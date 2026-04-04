import { redirect, fail } from '@sveltejs/kit';
import { Effect } from 'effect';
import type { Actions, PageServerLoad } from './$types';
import { appRuntime } from '$lib/server/runtime';
import { validateInviteCode, joinHousehold } from '$lib/domain/household/use-cases.js';
import { HouseholdRepository } from '$lib/domain/household/household-repository.js';
import {
	InvalidInviteCodeError,
	ExpiredInviteCodeError,
	HouseholdFullError
} from '$lib/domain/household/errors.js';

const INVITE_COOKIE = 'invite_code';
const INVITE_COOKIE_MAX_AGE = 60 * 60; // 1 hour

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const { code } = params;

	// Validate the invite code
	const validation = await appRuntime.runPromise(Effect.either(validateInviteCode(code)));

	if (validation._tag === 'Left') {
		const error = validation.left;
		if (error instanceof ExpiredInviteCodeError) {
			return { status: 'expired' as const, code };
		}
		// InvalidInviteCodeError or HouseholdRepositoryError
		return { status: 'invalid' as const, code };
	}

	const targetHousehold = validation.right;

	// User is not logged in — stash invite code in cookie and redirect to login
	if (!locals.user) {
		cookies.set(INVITE_COOKIE, code, {
			path: '/',
			maxAge: INVITE_COOKIE_MAX_AGE,
			httpOnly: true,
			sameSite: 'lax'
		});
		return redirect(302, '/login');
	}

	// Clear the invite cookie now that we're processing it
	cookies.delete(INVITE_COOKIE, { path: '/' });

	const userId = locals.user.id;
	const currentHouseholdId = locals.householdId;

	// User is already in the target household
	if (currentHouseholdId === targetHousehold.id) {
		return { status: 'already_member' as const, household: targetHousehold };
	}

	// Check if user is in a solo household (just themselves) or a shared household
	let isInSharedHousehold = false;
	if (currentHouseholdId) {
		const memberCount = await appRuntime.runPromise(
			Effect.gen(function* () {
				const repo = yield* HouseholdRepository;
				return yield* repo.getMemberCount(currentHouseholdId);
			})
		);
		// More than 1 member means it's a shared household — require confirmation
		isInSharedHousehold = memberCount > 1;
	}

	// User is in a shared household — show confirmation dialog
	if (isInSharedHousehold) {
		return {
			status: 'confirm_switch' as const,
			code,
			targetHousehold
		};
	}

	// User has no household or is in a solo household — join immediately
	const joinResult = await appRuntime.runPromise(Effect.either(joinHousehold(code, userId)));

	if (joinResult._tag === 'Left') {
		const error = joinResult.left;
		if (error instanceof HouseholdFullError) {
			return { status: 'full' as const, code };
		}
		if (error instanceof ExpiredInviteCodeError) {
			return { status: 'expired' as const, code };
		}
		return { status: 'invalid' as const, code };
	}

	return redirect(302, '/inventory');
};

export const actions: Actions = {
	confirmJoin: async ({ params, locals }) => {
		const { code } = params;

		if (!locals.user) {
			return redirect(302, `/login`);
		}

		const userId = locals.user.id;

		const result = await appRuntime.runPromise(Effect.either(joinHousehold(code, userId)));

		if (result._tag === 'Left') {
			const error = result.left;
			if (error instanceof HouseholdFullError) {
				return fail(400, { status: 'full' });
			}
			if (error instanceof ExpiredInviteCodeError) {
				return fail(400, { status: 'expired' });
			}
			return fail(400, { status: 'invalid' });
		}

		return redirect(302, '/inventory');
	}
};
