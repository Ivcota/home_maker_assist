import { fail, redirect } from '@sveltejs/kit';
import { Effect } from 'effect';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import { appRuntime } from '$lib/server/runtime';
import { generateInviteCode } from '$lib/domain/household/use-cases.js';
import { HouseholdRepository } from '$lib/domain/household/household-repository.js';
import { NotHouseholdOwnerError } from '$lib/domain/household/errors.js';

export const load: PageServerLoad = async ({ locals, url }) => {
	let household = null;
	if (locals.householdId) {
		household = await appRuntime.runPromise(
			Effect.gen(function* () {
				const repo = yield* HouseholdRepository;
				return yield* repo.findByUserId(locals.user!.id);
			})
		).catch(() => null);
	}
	return {
		user: locals.user!,
		household,
		inviteGenerated: url.searchParams.get('inviteGenerated') ?? null
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';

		if (!name) {
			return fail(400, { field: 'profile', message: 'Name is required' });
		}

		try {
			await auth.api.updateUser({
				body: { name },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { field: 'profile', message: error.message || 'Failed to update profile' });
			}
			console.error(`[${event.locals.requestId}] updateProfile unexpected error:`, error);
			return fail(500, { field: 'profile', message: 'Unexpected error' });
		}

		return { field: 'profile', success: true };
	},

	changePassword: async (event) => {
		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { field: 'password', message: 'All password fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { field: 'password', message: 'New passwords do not match' });
		}

		if (newPassword.length < 8) {
			return fail(400, { field: 'password', message: 'New password must be at least 8 characters' });
		}

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					field: 'password',
					message: error.message || 'Failed to change password'
				});
			}
			console.error(`[${event.locals.requestId}] changePassword unexpected error:`, error);
			return fail(500, { field: 'password', message: 'Unexpected error' });
		}

		return { field: 'password', success: true };
	},

	generateInvite: async (event) => {
		if (!event.locals.user || !event.locals.householdId) {
			return fail(403, { field: 'invite', message: 'Not authorized' });
		}
		const result = await appRuntime.runPromise(
			Effect.either(generateInviteCode(event.locals.householdId, event.locals.user.id))
		);
		if (result._tag === 'Left') {
			const error = result.left;
			if (error instanceof NotHouseholdOwnerError) {
				return fail(403, { field: 'invite', message: 'Only household owners can generate invite links' });
			}
			return fail(500, { field: 'invite', message: 'Failed to generate invite link' });
		}
		return { field: 'invite', success: true, household: result.right };
	},

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/');
	}
};
