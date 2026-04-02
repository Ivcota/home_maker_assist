import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
	const resend = new Resend(env.RESEND_API_KEY);
	const from = env.RESEND_FROM_EMAIL;
	if (!from) throw new Error('RESEND_FROM_EMAIL is not configured');
	await resend.emails.send({
		from,
		to,
		subject: 'Reset your password',
		html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
	});
}
