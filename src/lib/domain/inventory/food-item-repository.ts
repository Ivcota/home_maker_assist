import { Context, Effect } from 'effect';
import type { FoodItem, CreateFoodItemInput } from './food-item.js';
import type { FoodItemRepositoryError } from './errors.js';

export interface FoodItemRepository {
	create(
		userId: string,
		input: CreateFoodItemInput
	): Effect.Effect<FoodItem, FoodItemRepositoryError>;
	findAll(userId: string): Effect.Effect<FoodItem[], FoodItemRepositoryError>;
}

export const FoodItemRepository =
	Context.GenericTag<FoodItemRepository>('FoodItemRepository');
