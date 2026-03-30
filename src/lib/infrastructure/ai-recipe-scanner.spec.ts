import { describe, it, expect } from 'vitest';
import { mapRawRecipeToExtracted } from './ai-recipe-scanner.js';

describe('mapRawRecipeToExtracted', () => {
	it('converts ingredient with volume unit to ml Quantity', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Pancakes',
			items: [
				{
					type: 'ingredient',
					name: 'all-purpose flour',
					canonicalName: 'flour',
					quantity: '2',
					unit: 'cups'
				}
			]
		});

		expect(result.name).toBe('Pancakes');
		expect(result.ingredients).toHaveLength(1);
		expect(result.ingredients[0]).toEqual({
			name: 'all-purpose flour',
			canonicalName: 'flour',
			quantity: { value: 2 * 236.588, unit: 'ml' }
		});
		expect(result.notes).toHaveLength(0);
	});

	it('converts ingredient with mass unit to grams Quantity', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Steak',
			items: [
				{
					type: 'ingredient',
					name: 'ribeye steak',
					canonicalName: 'beef',
					quantity: '1',
					unit: 'lb'
				}
			]
		});

		expect(result.ingredients[0].quantity).toEqual({ value: 453.592, unit: 'g' });
	});

	it('defaults to count=1 when ingredient has no quantity or unit', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Simple Salad',
			items: [
				{
					type: 'ingredient',
					name: 'salt',
					canonicalName: 'salt',
					quantity: null,
					unit: null
				}
			]
		});

		expect(result.ingredients[0].quantity).toEqual({ value: 1, unit: 'count' });
	});

	it('falls back to count when unit is unknown', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Herb Soup',
			items: [
				{
					type: 'ingredient',
					name: 'basil',
					canonicalName: 'basil',
					quantity: '1',
					unit: 'bunch'
				}
			]
		});

		expect(result.ingredients[0].quantity).toEqual({ value: 1, unit: 'count' });
	});

	it('separates notes from ingredients', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Pasta',
			items: [
				{
					type: 'ingredient',
					name: 'spaghetti',
					canonicalName: 'pasta',
					quantity: '1',
					unit: 'lb'
				},
				{
					type: 'note',
					name: 'Season to taste with salt and pepper',
					canonicalName: null,
					quantity: null,
					unit: null
				}
			]
		});

		expect(result.ingredients).toHaveLength(1);
		expect(result.ingredients[0].name).toBe('spaghetti');
		expect(result.notes).toHaveLength(1);
		expect(result.notes[0]).toEqual({ text: 'Season to taste with salt and pepper' });
	});

	it('parses fractional quantity strings', () => {
		const result = mapRawRecipeToExtracted({
			name: 'Cookies',
			items: [
				{
					type: 'ingredient',
					name: 'butter',
					canonicalName: 'butter',
					quantity: '0.5',
					unit: 'lb'
				}
			]
		});

		expect(result.ingredients[0].quantity).toEqual({ value: 0.5 * 453.592, unit: 'g' });
	});
});
