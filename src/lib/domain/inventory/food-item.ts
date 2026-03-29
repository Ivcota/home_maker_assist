export type StorageLocation = 'pantry' | 'fridge' | 'freezer';
export type TrackingType = 'amount' | 'count';

export interface FoodItem {
	id: number;
	userId: string;
	name: string;
	canonicalName: string | null;
	storageLocation: StorageLocation;
	trackingType: TrackingType;
	amount: number | null;
	quantity: number | null;
	expirationDate: Date | null;
	trashedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateFoodItemInput {
	name: string;
	canonicalName?: string | null;
	storageLocation: StorageLocation;
	trackingType: TrackingType;
	amount: number | null;
	quantity: number | null;
	expirationDate: Date | null;
}

export interface UpdateFoodItemInput {
	id: number;
	name: string;
	canonicalName?: string | null;
	storageLocation: StorageLocation;
	trackingType: TrackingType;
	amount: number | null;
	quantity: number | null;
	expirationDate: Date | null;
}
