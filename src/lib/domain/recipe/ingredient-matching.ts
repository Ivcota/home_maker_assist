import type { RecipeIngredient } from './recipe.js';
import type { FoodItem } from '$lib/domain/inventory/food-item.js';

export interface IngredientMatch {
	ingredient: RecipeIngredient;
	matched: boolean;
}

export type ReadinessStatus = 'ready' | 'almost-ready' | 'need-to-shop';

export interface RecipeReadiness {
	matched: number;
	total: number;
	status: ReadinessStatus;
}

function ingredientKey(ingredient: RecipeIngredient): string {
	return (ingredient.canonicalName ?? ingredient.name).toLowerCase().trim();
}

function foodItemKey(item: FoodItem): string {
	return (item.canonicalName ?? item.name).toLowerCase().trim();
}

export function matchIngredients(
	ingredients: RecipeIngredient[],
	foodItems: FoodItem[]
): IngredientMatch[] {
	const foodItemKeys = new Set(foodItems.map(foodItemKey));
	return ingredients.map((ingredient) => ({
		ingredient,
		matched: foodItemKeys.has(ingredientKey(ingredient))
	}));
}

export function calculateReadiness(
	ingredients: RecipeIngredient[],
	foodItems: FoodItem[]
): RecipeReadiness {
	const total = ingredients.length;
	if (total === 0) return { matched: 0, total: 0, status: 'ready' };

	const matches = matchIngredients(ingredients, foodItems);
	const matched = matches.filter((m) => m.matched).length;

	let status: ReadinessStatus;
	if (matched === total) {
		status = 'ready';
	} else if (matched / total >= 0.5) {
		status = 'almost-ready';
	} else {
		status = 'need-to-shop';
	}

	return { matched, total, status };
}
