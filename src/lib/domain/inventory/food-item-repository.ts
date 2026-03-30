import { Context, Effect } from 'effect';
import type { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from './food-item.js';
import type { FoodItemRepositoryError, FoodItemNotFoundError } from './errors.js';

export interface FoodItemRepository {
	create(
		userId: string,
		input: CreateFoodItemInput
	): Effect.Effect<FoodItem, FoodItemRepositoryError>;
	bulkCreate(
		userId: string,
		items: CreateFoodItemInput[]
	): Effect.Effect<FoodItem[], FoodItemRepositoryError>;
	findAll(userId: string): Effect.Effect<FoodItem[], FoodItemRepositoryError>;
	update(
		userId: string,
		input: UpdateFoodItemInput
	): Effect.Effect<FoodItem, FoodItemRepositoryError | FoodItemNotFoundError>;
	trash(
		userId: string,
		id: number
	): Effect.Effect<void, FoodItemRepositoryError | FoodItemNotFoundError>;
	restore(
		userId: string,
		id: number
	): Effect.Effect<void, FoodItemRepositoryError | FoodItemNotFoundError>;
	findTrashed(userId: string): Effect.Effect<FoodItem[], FoodItemRepositoryError>;
	patchCanonicalName(
		userId: string,
		id: number,
		canonicalName: string
	): Effect.Effect<void, FoodItemRepositoryError>;
	trashAll(userId: string): Effect.Effect<void, FoodItemRepositoryError>;
}

export const FoodItemRepository = Context.GenericTag<FoodItemRepository>('FoodItemRepository');
