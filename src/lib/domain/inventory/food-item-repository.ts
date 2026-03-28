import { Context, Effect } from 'effect';
import type { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from './food-item.js';
import type { FoodItemRepositoryError, FoodItemNotFoundError } from './errors.js';

export interface FoodItemRepository {
	create(
		userId: string,
		input: CreateFoodItemInput
	): Effect.Effect<FoodItem, FoodItemRepositoryError>;
	findAll(userId: string): Effect.Effect<FoodItem[], FoodItemRepositoryError>;
	update(
		userId: string,
		input: UpdateFoodItemInput
	): Effect.Effect<FoodItem, FoodItemRepositoryError | FoodItemNotFoundError>;
}

export const FoodItemRepository =
	Context.GenericTag<FoodItemRepository>('FoodItemRepository');
