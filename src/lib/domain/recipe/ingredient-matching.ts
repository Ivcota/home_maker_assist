import type { Ingredient } from './recipe.js';
import type { FoodItem } from '$lib/domain/inventory/food-item.js';

export interface IngredientMatch {
	ingredient: Ingredient;
	matched: boolean;
}

export type ReadinessStatus = 'ready' | 'almost-ready' | 'need-to-shop';

export interface RecipeReadiness {
	matched: number;
	total: number;
	status: ReadinessStatus;
}

function matchIngredientToFoodItems(ingredient: Ingredient, foodItems: FoodItem[]): boolean {
	return foodItems.some((fi) => {
		// If both have canonical IDs, match strictly by ID
		if (ingredient.canonicalIngredientId !== null && fi.canonicalIngredientId !== null) {
			return ingredient.canonicalIngredientId === fi.canonicalIngredientId;
		}
		// Otherwise fall back to case-insensitive name comparison
		const ingredientName = ingredient.name.toLowerCase().trim();
		const fiKey = (fi.canonicalName ?? fi.name).toLowerCase().trim();
		return fiKey === ingredientName;
	});
}

export function matchIngredients(
	ingredients: Ingredient[],
	foodItems: FoodItem[]
): IngredientMatch[] {
	return ingredients.map((ingredient) => ({
		ingredient,
		matched: matchIngredientToFoodItems(ingredient, foodItems)
	}));
}

export function calculateReadiness(
	ingredients: Ingredient[],
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
