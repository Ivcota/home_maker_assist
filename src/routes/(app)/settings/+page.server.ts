import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user! };
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

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/');
	}
};
