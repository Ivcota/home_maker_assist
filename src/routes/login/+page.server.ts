import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

const INVITE_COOKIE = 'invite_code';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		// If there's a pending invite, redirect to it so it can be processed
		const inviteCode = event.cookies.get(INVITE_COOKIE);
		if (inviteCode) {
			return redirect(302, `/invite/${inviteCode}`);
		}
		return redirect(302, '/inventory');
	}
	return {
		redirectTo: event.url.searchParams.get('redirectTo') ?? '/inventory',
		initialMode: (event.url.searchParams.get('mode') as 'signin' | 'signup' | null) ??
			(event.url.searchParams.has('forgot') ? 'forgot' : 'signin')
	};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/inventory';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			console.error(`[${event.locals.requestId}] signInEmail unexpected error:`, error);
			return fail(500, { message: 'Unexpected error' });
		}

		// After sign-in, if there's a pending invite, redirect to it
		const inviteCode = event.cookies.get(INVITE_COOKIE);
		if (inviteCode) {
			return redirect(302, `/invite/${inviteCode}`);
		}

		return redirect(302, redirectTo);
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/inventory';

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			console.error(`[${event.locals.requestId}] signUpEmail unexpected error:`, error);
			return fail(500, { message: 'Unexpected error' });
		}

		// After sign-up, if there's a pending invite, redirect to it
		const inviteCode = event.cookies.get(INVITE_COOKIE);
		if (inviteCode) {
			return redirect(302, `/invite/${inviteCode}`);
		}

		return redirect(302, redirectTo);
	},
	forgotPassword: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		try {
			await auth.api.requestPasswordReset({
				body: { email, redirectTo: '/reset-password' }
			});
		} catch {
			// Always return success to prevent account enumeration
		}

		return { success: true };
	}
};
