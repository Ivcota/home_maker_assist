import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleRequestId: Handle = async ({ event, resolve }) => {
	event.locals.requestId = crypto.randomUUID();
	return resolve(event);
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;

		const fullUser = session.user as Record<string, unknown>;

		// better-auth already fetches the full user row; grab householdId
		// from it instead of issuing a second DB query on every request.
		const householdId = fullUser.householdId;
		if (typeof householdId === 'string' && householdId) {
			event.locals.householdId = householdId;
		}

		const complementary = fullUser.complementary === true;
		event.locals.subscription = {
			tier: complementary ? 'solo' : 'free',
			status: 'active',
			complementary
		};
	} else {
		event.locals.subscription = { tier: 'free', status: 'active', complementary: false };
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleRequestId, handleBetterAuth);
