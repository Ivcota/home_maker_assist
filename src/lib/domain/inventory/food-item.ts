import type { Quantity } from '$lib/domain/shared/quantity.js';

export type StorageLocation = 'pantry' | 'fridge' | 'freezer';

export interface FoodItem {
	id: number;
	userId: string;
	name: string;
	canonicalName: string | null;
	storageLocation: StorageLocation;
	quantity: Quantity;
	canonicalIngredientId: number | null;
	expirationDate: Date | null;
	trashedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateFoodItemInput {
	name: string;
	canonicalName?: string | null;
	storageLocation: StorageLocation;
	quantity: Quantity;
	expirationDate: Date | null;
}

export interface UpdateFoodItemInput {
	id: number;
	name: string;
	canonicalName?: string | null;
	storageLocation: StorageLocation;
	quantity: Quantity;
	expirationDate: Date | null;
}
