import { Effect } from 'effect';
import { ShoppingListRepository } from './shopping-list-repository.js';
import type { ShoppingListItem, RestockShoppingItemInput } from './shopping-list-item.js';
import type { ShoppingListRepositoryError, ShoppingListItemNotFoundError } from './errors.js';
import { FoodItemRepository } from '$lib/domain/inventory/food-item-repository.js';
import type { FoodItemRepositoryError } from '$lib/domain/inventory/errors.js';
import { getRestockItems } from '$lib/domain/inventory/restock.js';
import { DEFAULT_EXPIRATION_CONFIG } from '$lib/domain/inventory/expiration.js';

export const generateShoppingList = (
	userId: string,
	now: Date = new Date()
): Effect.Effect<
	ShoppingListItem[],
	FoodItemRepositoryError | ShoppingListRepositoryError,
	FoodItemRepository | ShoppingListRepository
> =>
	Effect.gen(function* () {
		const foodItemRepo = yield* FoodItemRepository;
		const shoppingListRepo = yield* ShoppingListRepository;

		const foodItems = yield* foodItemRepo.findAll(userId);
		const restockItems = yield* getRestockItems(foodItems, DEFAULT_EXPIRATION_CONFIG, now).pipe(
			Effect.orDie
		);

		if (restockItems.length > 0) {
			const inputs: RestockShoppingItemInput[] = restockItems.map((ri) => ({
				canonicalKey: (ri.foodItem.canonicalName ?? ri.foodItem.name).toLowerCase().trim(),
				displayName: ri.foodItem.name,
				sourceRestockItemId: ri.foodItem.id,
				carriedStorageLocation: ri.foodItem.storageLocation,
				carriedTrackingType: ri.foodItem.trackingType
			}));
			yield* shoppingListRepo.addMissingRestock(userId, inputs);
		}

		return yield* shoppingListRepo.findAll(userId);
	});

export const setShoppingListItemChecked = (
	userId: string,
	id: number,
	checked: boolean
): Effect.Effect<
	void,
	ShoppingListItemNotFoundError | ShoppingListRepositoryError,
	ShoppingListRepository
> =>
	Effect.gen(function* () {
		const repo = yield* ShoppingListRepository;
		yield* repo.setChecked(userId, id, checked);
	});
