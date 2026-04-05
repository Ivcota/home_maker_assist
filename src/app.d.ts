import type { User, Session } from 'better-auth/minimal';
import type { SubscriptionTier, SubscriptionStatus } from '$lib/domain/subscription/subscription.js';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			requestId: string;
			householdId?: string;
			subscription: { tier: SubscriptionTier; status: SubscriptionStatus; complementary: boolean };
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
