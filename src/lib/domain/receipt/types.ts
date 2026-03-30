import type { StorageLocation } from '$lib/domain/inventory/food-item.js';
import type { Quantity } from '$lib/domain/shared/quantity.js';

export interface ExtractItemsInput {
	imageBase64: string;
	mimeType: string;
}

export interface ExtractedFoodItem {
	name: string;
	canonicalName: string | null;
	storageLocation: StorageLocation;
	quantity: Quantity;
	expirationDate: Date | null;
}
