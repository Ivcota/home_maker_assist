import type { StorageLocation } from '$lib/domain/inventory/food-item.js';
import type { Quantity } from '$lib/domain/shared/quantity.js';

export type ShoppingListSourceType = 'restock' | 'recipe';

export interface ShoppingListItem {
	id: number;
	userId: string;
	canonicalKey: string;
	displayName: string;
	checked: boolean;
	sourceType: ShoppingListSourceType;
	sourceRestockItemId: number | null;
	sourceRecipeNames: string[] | null;
	carriedStorageLocation: StorageLocation;
	quantity: Quantity;
	createdAt: Date;
}

export interface RestockShoppingItemInput {
	canonicalKey: string;
	displayName: string;
	sourceRestockItemId: number;
	carriedStorageLocation: StorageLocation;
	quantity: Quantity;
}

export interface RecipeShoppingItemInput {
	canonicalKey: string;
	displayName: string;
	sourceRecipeNames: string[];
	carriedStorageLocation: StorageLocation;
	quantity: Quantity;
}
