import { Layer, Effect } from 'effect';
import { eq, and } from 'drizzle-orm';
import { SubscriptionRepository } from '$lib/domain/subscription/subscription-repository.js';
import { SubscriptionRepositoryError } from '$lib/domain/subscription/errors.js';
import { Database } from './database.js';
import { user } from '$lib/server/db/schema';

export const DrizzleSubscriptionRepository = Layer.effect(
	SubscriptionRepository,
	Effect.gen(function* () {
		const db = yield* Database;
		return {
			findByUserId: () =>
				Effect.tryPromise({
					try: async () => null,
					catch: (cause) => new SubscriptionRepositoryError({ message: 'Failed to find subscription', cause })
				}),

			isComplementary: (userId) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.select({ complementary: user.complementary })
							.from(user)
							.where(eq(user.id, userId))
							.limit(1);
						return row?.complementary ?? false;
					},
					catch: (cause) =>
						new SubscriptionRepositoryError({ message: 'Failed to check complementary status', cause })
				}),

			findByHouseholdOwnerId: (householdId) =>
				Effect.tryPromise({
					try: async () => {
						const [owner] = await db
							.select({ complementary: user.complementary })
							.from(user)
							.where(and(eq(user.householdId, householdId), eq(user.householdRole, 'owner')))
							.limit(1);
						return {
							subscription: null,
							isComplementary: owner?.complementary ?? false
						};
					},
					catch: (cause) =>
						new SubscriptionRepositoryError({
							message: 'Failed to find household owner subscription',
							cause
						})
				})
		};
	})
);
