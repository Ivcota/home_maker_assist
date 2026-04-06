import { Context, Effect } from 'effect';
import type { Subscription } from './subscription.js';
import type { SubscriptionRepositoryError } from './errors.js';

export class SubscriptionRepository extends Context.Tag('SubscriptionRepository')<
	SubscriptionRepository,
	{
		readonly findByUserId: (
			userId: string
		) => Effect.Effect<Subscription | null, SubscriptionRepositoryError>;
		readonly isComplementary: (
			userId: string
		) => Effect.Effect<boolean, SubscriptionRepositoryError>;
		readonly findByHouseholdOwnerId: (
			householdId: string
		) => Effect.Effect<{ subscription: Subscription | null; isComplementary: boolean }, SubscriptionRepositoryError>;
	}
>() {}
