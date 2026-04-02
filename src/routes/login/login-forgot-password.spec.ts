import { describe, it, expect, vi } from 'vitest';

const { mockRequestPasswordReset } = vi.hoisted(() => ({
	mockRequestPasswordReset: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	auth: {
		api: {
			signInEmail: vi.fn(),
			signUpEmail: vi.fn(),
			requestPasswordReset: mockRequestPasswordReset
		}
	}
}));

import { actions } from './+page.server.js';

type ForgotAction = (ctx: { request: Request; url: URL }) => unknown;

function makeRequest(email: string) {
	const formData = new FormData();
	formData.append('email', email);
	return new Request('http://localhost/login', { method: 'POST', body: formData });
}

describe('/login forgotPassword action', () => {
	it('calls requestPasswordReset with email and redirectTo=/reset-password', async () => {
		mockRequestPasswordReset.mockResolvedValueOnce(undefined);

		const result = await (actions as Record<string, ForgotAction>).forgotPassword({
			request: makeRequest('user@example.com'),
			url: new URL('http://localhost/login')
		});

		expect(mockRequestPasswordReset).toHaveBeenCalledWith({
			body: { email: 'user@example.com', redirectTo: '/reset-password' }
		});
		expect(result).toMatchObject({ success: true });
	});

	it('returns success even when email does not exist (no info leak)', async () => {
		mockRequestPasswordReset.mockRejectedValueOnce(new Error('User not found'));

		const result = await (actions as Record<string, ForgotAction>).forgotPassword({
			request: makeRequest('unknown@example.com'),
			url: new URL('http://localhost/login')
		});

		expect(result).toMatchObject({ success: true });
	});

	it('returns success for any email to prevent account enumeration', async () => {
		mockRequestPasswordReset.mockResolvedValueOnce(undefined);

		const result = await (actions as Record<string, ForgotAction>).forgotPassword({
			request: makeRequest('anyone@example.com'),
			url: new URL('http://localhost/login')
		});

		expect(result).toMatchObject({ success: true });
	});
});
