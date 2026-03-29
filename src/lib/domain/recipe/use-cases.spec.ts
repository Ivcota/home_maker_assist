import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { RecipeRepository } from './recipe-repository.js';
import { RecipeValidationError, RecipeRestoreExpiredError } from './errors.js';
import {
	createRecipe,
	updateRecipe,
	restoreRecipe,
	RESTORE_WINDOW_HOURS
} from './use-cases.js';
import type { Recipe } from './recipe.js';

const baseRecipe: Recipe = {
	id: 1,
	userId: 'user-a',
	name: 'Test Recipe',
	ingredients: [],
	trashedAt: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

const noop = () => Effect.die('not implemented');

function makeRepo(overrides: Partial<RecipeRepository>): Layer.Layer<RecipeRepository> {
	return Layer.succeed(RecipeRepository, {
		findAll: noop,
		findTrashed: noop,
		create: noop,
		update: noop,
		trash: noop,
		restore: noop,
		...overrides
	} as RecipeRepository);
}

describe('createRecipe', () => {
	it('fails with RecipeValidationError for empty recipe name', async () => {
		const layer = makeRepo({ create: () => Effect.succeed(baseRecipe) });

		const error = await Effect.runPromise(
			createRecipe('user-a', { name: '  ', ingredients: [] }).pipe(Effect.flip, Effect.provide(layer))
		);

		expect(error).toBeInstanceOf(RecipeValidationError);
	});

	it('fails with RecipeValidationError for empty ingredient name', async () => {
		const layer = makeRepo({ create: () => Effect.succeed(baseRecipe) });

		const error = await Effect.runPromise(
			createRecipe('user-a', {
				name: 'Valid Name',
				ingredients: [{ name: '', canonicalName: null, quantity: null, unit: null }]
			}).pipe(Effect.flip, Effect.provide(layer))
		);

		expect(error).toBeInstanceOf(RecipeValidationError);
	});

	it('does not call repo when validation fails', async () => {
		let repoCalled = false;
		const layer = makeRepo({
			create: () => {
				repoCalled = true;
				return Effect.succeed(baseRecipe);
			}
		});

		await Effect.runPromise(
			createRecipe('user-a', { name: '', ingredients: [] }).pipe(Effect.ignore, Effect.provide(layer))
		);

		expect(repoCalled).toBe(false);
	});
});

describe('updateRecipe', () => {
	it('fails with RecipeValidationError for empty recipe name', async () => {
		const layer = makeRepo({ update: () => Effect.succeed(baseRecipe) });

		const error = await Effect.runPromise(
			updateRecipe('user-a', { id: 1, name: '', ingredients: [] }).pipe(
				Effect.flip,
				Effect.provide(layer)
			)
		);

		expect(error).toBeInstanceOf(RecipeValidationError);
	});

	it('fails with RecipeValidationError for empty ingredient name', async () => {
		const layer = makeRepo({ update: () => Effect.succeed(baseRecipe) });

		const error = await Effect.runPromise(
			updateRecipe('user-a', {
				id: 1,
				name: 'Valid Name',
				ingredients: [{ name: '   ', canonicalName: null, quantity: null, unit: null }]
			}).pipe(Effect.flip, Effect.provide(layer))
		);

		expect(error).toBeInstanceOf(RecipeValidationError);
	});
});

describe('restoreRecipe', () => {
	it('fails with RecipeRestoreExpiredError when trashedAt is beyond 24h window', async () => {
		const now = new Date('2026-01-02T12:00:00Z');
		const trashedAt = new Date('2026-01-01T11:00:00Z'); // 25 hours before now
		const trashedRecipe = { ...baseRecipe, trashedAt };
		const layer = makeRepo({ restore: () => Effect.succeed(trashedRecipe) });

		const error = await Effect.runPromise(
			restoreRecipe('user-a', 1, now).pipe(Effect.flip, Effect.provide(layer))
		);

		expect(error).toBeInstanceOf(RecipeRestoreExpiredError);
	});

	it('succeeds when trashedAt is within the 24h window', async () => {
		const now = new Date('2026-01-02T12:00:00Z');
		const trashedAt = new Date('2026-01-01T13:00:00Z'); // 23 hours before now
		const trashedRecipe = { ...baseRecipe, trashedAt };
		const layer = makeRepo({ restore: () => Effect.succeed(trashedRecipe) });

		const result = await Effect.runPromise(
			restoreRecipe('user-a', 1, now).pipe(Effect.as('ok'), Effect.provide(layer))
		);
		expect(result).toBe('ok');
	});

	it('treats exactly 24h as within the window', async () => {
		const now = new Date('2026-01-02T12:00:00Z');
		const trashedAt = new Date(now.getTime() - RESTORE_WINDOW_HOURS * 60 * 60 * 1000); // exactly 24h
		const trashedRecipe = { ...baseRecipe, trashedAt };
		const layer = makeRepo({ restore: () => Effect.succeed(trashedRecipe) });

		// Exactly 24h is NOT > 24h, so it should succeed
		const result = await Effect.runPromise(
			restoreRecipe('user-a', 1, now).pipe(Effect.as('ok'), Effect.provide(layer))
		);
		expect(result).toBe('ok');
	});
});
