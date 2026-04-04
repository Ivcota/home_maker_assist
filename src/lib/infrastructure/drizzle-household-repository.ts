import { Layer, Effect } from 'effect';
import { eq, count } from 'drizzle-orm';
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
				}),
			findByInviteCode: (code) =>
				Effect.tryPromise({
					try: async () => {
						const rows = await db
							.select()
							.from(household)
							.where(eq(household.inviteCode, code));
						return rows.length > 0 ? rows[0] : null;
					},
					catch: (e) =>
						new HouseholdRepositoryError({
							message: 'Failed to find household by invite code',
							cause: e
						})
				}),
			generateInviteCode: (householdId) =>
				Effect.tryPromise({
					try: async () => {
						const code = crypto.randomUUID();
						const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
						const now = new Date();
						const [updated] = await db
							.update(household)
							.set({ inviteCode: code, inviteExpiresAt: expiresAt, updatedAt: now })
							.where(eq(household.id, householdId))
							.returning();
						return updated;
					},
					catch: (e) =>
						new HouseholdRepositoryError({ message: 'Failed to generate invite code', cause: e })
				}),
			getMemberCount: (householdId) =>
				Effect.tryPromise({
					try: async () => {
						const rows = await db
							.select({ count: count() })
							.from(user)
							.where(eq(user.householdId, householdId));
						return rows[0]?.count ?? 0;
					},
					catch: (e) =>
						new HouseholdRepositoryError({ message: 'Failed to get member count', cause: e })
				}),
			joinHousehold: (userId, newHouseholdId, oldHouseholdId) =>
				Effect.tryPromise({
					try: async () => {
						await db
							.update(user)
							.set({ householdId: newHouseholdId, householdRole: 'member' })
							.where(eq(user.id, userId));

						// Delete old solo household if it's now empty
						if (oldHouseholdId && oldHouseholdId !== newHouseholdId) {
							const memberRows = await db
								.select({ count: count() })
								.from(user)
								.where(eq(user.householdId, oldHouseholdId));
							if ((memberRows[0]?.count ?? 0) === 0) {
								await db.delete(household).where(eq(household.id, oldHouseholdId));
							}
						}

						const [joined] = await db
							.select()
							.from(household)
							.where(eq(household.id, newHouseholdId));
						return joined;
					},
					catch: (e) =>
						new HouseholdRepositoryError({ message: 'Failed to join household', cause: e })
				}),
			getUserRole: (userId) =>
				Effect.tryPromise({
					try: async () => {
						const rows = await db
							.select({ householdRole: user.householdRole })
							.from(user)
							.where(eq(user.id, userId));
						return rows.length > 0 ? (rows[0].householdRole ?? null) : null;
					},
					catch: (e) =>
						new HouseholdRepositoryError({ message: 'Failed to get user role', cause: e })
				})
		};
	})
);
