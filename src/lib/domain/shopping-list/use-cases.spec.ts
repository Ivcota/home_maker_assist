import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { ShoppingListRepository } from './shopping-list-repository.js';
import { FoodItemRepository } from '$lib/domain/inventory/food-item-repository.js';
import { ShoppingListRepositoryError } from './errors.js';
import { generateShoppingList } from './use-cases.js';
import type { ShoppingListItem } from './shopping-list-item.js';
import type { FoodItem } from '$lib/domain/inventory/food-item.js';

const now = new Date('2026-01-10T12:00:00Z');
const expiredDate = new Date('2026-01-05T12:00:00Z'); // 5 days ago
const freshDate = new Date('2026-06-01T12:00:00Z'); // far future

function makeFoodItem(overrides: Partial<FoodItem> = {}): FoodItem {
	return {
		id: 1,
		userId: 'user-a',
		name: 'Milk',
		canonicalName: 'milk',
		storageLocation: 'fridge',
		trackingType: 'count',
		amount: null,
		quantity: 1,
		expirationDate: expiredDate,
		trashedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides
	};
}

function makeShoppingListItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
	return {
		id: 1,
		userId: 'user-a',
		canonicalKey: 'milk',
		displayName: 'Milk',
		checked: false,
		sourceType: 'restock',
		sourceRestockItemId: 1,
		sourceRecipeNames: null,
		carriedStorageLocation: 'fridge',
		carriedTrackingType: 'count',
		createdAt: now,
		...overrides
	};
}

const noop = () => Effect.die('not implemented');

function makeShoppingListRepo(
	overrides: Partial<ShoppingListRepository>
): Layer.Layer<ShoppingListRepository> {
	return Layer.succeed(ShoppingListRepository, {
		findAll: noop,
		addMissingRestock: noop,
		setChecked: noop,
		clearAll: noop,
		...overrides
	} as ShoppingListRepository);
}

function makeFoodItemRepo(overrides: Partial<FoodItemRepository>): Layer.Layer<FoodItemRepository> {
	return Layer.succeed(FoodItemRepository, {
		findAll: noop,
		findTrashed: noop,
		create: noop,
		bulkCreate: noop,
		update: noop,
		trash: noop,
		restore: noop,
		...overrides
	} as FoodItemRepository);
}

describe('generateShoppingList', () => {
	it('calls addMissingRestock with restock items derived from expiring food items', async () => {
		const expiredItem = makeFoodItem({ id: 10, name: 'Milk', canonicalName: 'milk' });
		let capturedItems: unknown = null;

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: (_, items) => {
				capturedItems = items;
				return Effect.void;
			},
			findAll: () => Effect.succeed([])
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([expiredItem])
		});

		await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect(capturedItems).toEqual([
			{
				canonicalKey: 'milk',
				displayName: 'Milk',
				sourceRestockItemId: 10,
				carriedStorageLocation: 'fridge',
				carriedTrackingType: 'count'
			}
		]);
	});

	it('uses raw name as canonicalKey when canonicalName is null', async () => {
		const item = makeFoodItem({ id: 5, name: 'Organic Baby Spinach', canonicalName: null });
		let capturedItems: unknown = null;

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: (_, items) => {
				capturedItems = items;
				return Effect.void;
			},
			findAll: () => Effect.succeed([])
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([item])
		});

		await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect((capturedItems as { canonicalKey: string }[])[0].canonicalKey).toBe(
			'organic baby spinach'
		);
	});

	it('does not call addMissingRestock for fresh (non-expiring) items', async () => {
		const freshItem = makeFoodItem({ expirationDate: freshDate });
		let addCalled = false;

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: () => {
				addCalled = true;
				return Effect.void;
			},
			findAll: () => Effect.succeed([])
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([freshItem])
		});

		await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect(addCalled).toBe(false);
	});

	it('does not call addMissingRestock for items with no expiration date', async () => {
		const noExpiry = makeFoodItem({ expirationDate: null });
		let addCalled = false;

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: () => {
				addCalled = true;
				return Effect.void;
			},
			findAll: () => Effect.succeed([])
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([noExpiry])
		});

		await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect(addCalled).toBe(false);
	});

	it('returns the full shopping list from the repository', async () => {
		const item = makeShoppingListItem();

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: () => Effect.void,
			findAll: () => Effect.succeed([item])
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([])
		});

		const result = await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect(result).toEqual([item]);
	});

	it('propagates ShoppingListRepositoryError from addMissingRestock', async () => {
		const expiredItem = makeFoodItem();

		const shoppingListLayer = makeShoppingListRepo({
			addMissingRestock: () =>
				Effect.fail(new ShoppingListRepositoryError({ message: 'DB error' }))
		});
		const foodItemLayer = makeFoodItemRepo({
			findAll: () => Effect.succeed([expiredItem])
		});

		const error = await Effect.runPromise(
			generateShoppingList('user-a', now).pipe(
				Effect.flip,
				Effect.provide(Layer.mergeAll(shoppingListLayer, foodItemLayer))
			)
		);

		expect(error).toBeInstanceOf(ShoppingListRepositoryError);
	});
});
