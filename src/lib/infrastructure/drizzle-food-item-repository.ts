import { Layer, Effect } from 'effect';
import { and, eq, isNull } from 'drizzle-orm';
import { FoodItemRepository } from '$lib/domain/inventory/food-item-repository.js';
import { FoodItemRepositoryError, FoodItemNotFoundError } from '$lib/domain/inventory/errors.js';
import type { FoodItem } from '$lib/domain/inventory/food-item.js';
import { Database } from './database.js';
import { foodItem } from '$lib/server/db/schema';

function rowToFoodItem(row: typeof foodItem.$inferSelect): FoodItem {
	return {
		id: row.id,
		userId: row.userId,
		name: row.name,
		storageLocation: row.storageLocation,
		trackingType: row.trackingType,
		amount: row.amount !== null ? Number(row.amount) : null,
		quantity: row.quantity,
		expirationDate: row.expirationDate,
		trashedAt: row.trashedAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export const DrizzleFoodItemRepository = Layer.effect(
	FoodItemRepository,
	Effect.gen(function* () {
		const db = yield* Database;
		return {
			create: (userId, input) =>
				Effect.tryPromise({
					try: () =>
						db
							.insert(foodItem)
							.values({
								userId,
								name: input.name,
								storageLocation: input.storageLocation,
								trackingType: input.trackingType,
								amount: input.amount !== null ? String(input.amount) : null,
								quantity: input.quantity,
								expirationDate: input.expirationDate
							})
							.returning()
							.then((rows) => rowToFoodItem(rows[0])),
					catch: (e) =>
						new FoodItemRepositoryError({ message: 'Failed to create food item', cause: e })
				}),
			findAll: (userId) =>
				Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(foodItem)
							.where(and(eq(foodItem.userId, userId), isNull(foodItem.trashedAt)))
							.then((rows) => rows.map(rowToFoodItem)),
					catch: (e) =>
						new FoodItemRepositoryError({ message: 'Failed to fetch food items', cause: e })
				}),
			update: (userId, input) =>
				Effect.gen(function* () {
					const rows = yield* Effect.tryPromise({
						try: () =>
							db
								.select()
								.from(foodItem)
								.where(
									and(eq(foodItem.id, input.id), eq(foodItem.userId, userId), isNull(foodItem.trashedAt))
								),
						catch: (e) =>
							new FoodItemRepositoryError({ message: 'Failed to find food item', cause: e })
					});

					if (rows.length === 0) {
						return yield* Effect.fail(new FoodItemNotFoundError({ id: input.id }));
					}

					return yield* Effect.tryPromise({
						try: () =>
							db
								.update(foodItem)
								.set({
									name: input.name,
									storageLocation: input.storageLocation,
									trackingType: input.trackingType,
									amount: input.amount !== null ? String(input.amount) : null,
									quantity: input.quantity,
									expirationDate: input.expirationDate,
									updatedAt: new Date()
								})
								.where(and(eq(foodItem.id, input.id), eq(foodItem.userId, userId)))
								.returning()
								.then((rows) => rowToFoodItem(rows[0])),
						catch: (e) =>
							new FoodItemRepositoryError({ message: 'Failed to update food item', cause: e })
					});
				})
		};
	})
);
