import { Effect } from 'effect';
import { SubscriptionRepository } from './subscription-repository.js';
import { SubscriptionRequiredError } from './errors.js';
import type { Feature, Subscription } from './subscription.js';

const hasAccess = (subscription: Subscription | null): boolean => {
	if (!subscription) return false;
	if (subscription.status === 'active') return true;
	if (
		subscription.status === 'cancelled' &&
		subscription.currentPeriodEnd &&
		subscription.currentPeriodEnd > new Date()
	)
		return true;
	return false;
};

export const checkFeatureAccess = (userId: string, householdId: string | null, feature: Feature) =>
	Effect.gen(function* () {
		const repo = yield* SubscriptionRepository;
		const complementary = yield* repo.isComplementary(userId);
		if (complementary) return;

		const subscription = yield* repo.findByUserId(userId);
		if (hasAccess(subscription)) return;

		// Fall back to household owner's subscription
		if (householdId) {
			const owner = yield* repo.findByHouseholdOwnerId(householdId);
			if (owner.isComplementary) return;
			if (hasAccess(owner.subscription)) return;
		}

		return yield* Effect.fail(new SubscriptionRequiredError({ userId, feature }));
	});

export const getSubscription = (userId: string) =>
	Effect.gen(function* () {
		const repo = yield* SubscriptionRepository;
		return yield* repo.findByUserId(userId);
	});
