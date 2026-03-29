import type { StorageLocation, TrackingType } from '$lib/domain/inventory/food-item.js';

export interface ExtractItemsInput {
	imageBase64: string;
	mimeType: string;
}

export interface ExtractedFoodItem {
	name: string;
	canonicalName: string | null;
	storageLocation: StorageLocation;
	trackingType: TrackingType;
	quantity: number | null;
	amount: number | null;
	expirationDate: Date | null;
}
