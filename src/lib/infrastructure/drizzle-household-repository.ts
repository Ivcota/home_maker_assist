import { Layer, Effect } from 'effect';
import { eq } from 'drizzle-orm';
import { HouseholdRepository } from '$lib/domain/household/household-repository.js';
import { HouseholdRepositoryError } from '$lib/domain/household/errors.js';
import { Database } from './database.js';
import { household, user } from '$lib/server/db/schema';

export const DrizzleHouseholdRepository = Layer.effect(
	HouseholdRepository,
	Effect.gen(function* () {
		const db = yield* Database;
		return {
			createSoloHousehold: (userId, userName) =>
				Effect.tryPromise({
					try: async () => {
						const householdId = crypto.randomUUID();
						const householdName = `${userName}'s Household`;
						const now = new Date();

						const [created] = await db
							.insert(household)
							.values({ id: householdId, name: householdName, createdAt: now, updatedAt: now })
							.returning();

						await db
							.update(user)
							.set({ householdId, householdRole: 'owner' })
							.where(eq(user.id, userId));

						return created;
					},
					catch: (e) =>
						new HouseholdRepositoryError({ message: 'Failed to create solo household', cause: e })
				}),
			findByUserId: (userId) =>
				Effect.tryPromise({
					try: async () => {
						const rows = await db
							.select({ household })
							.from(user)
							.innerJoin(household, eq(user.householdId, household.id))
							.where(eq(user.id, userId));
						return rows.length > 0 ? rows[0].household : null;
					},
					catch: (e) =>
						new HouseholdRepositoryError({
							message: 'Failed to find household for user',
							cause: e
						})
				})
		};
	})
);
