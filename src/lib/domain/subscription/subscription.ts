export type SubscriptionTier = 'free' | 'solo';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export type Feature = 'scan';

export interface Subscription {
	userId: string;
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	currentPeriodEnd: Date | null;
}
