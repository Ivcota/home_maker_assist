import { describe, it, expect, vi } from 'vitest';
import { FOOD_PHOTO_SCAN_SYSTEM_PROMPT } from '$lib/domain/receipt/food-photo-prompts.js';

const { mockGenerateObject } = vi.hoisted(() => ({ mockGenerateObject: vi.fn() }));

vi.mock('ai', async (importOriginal) => {
	const actual = await importOriginal<typeof import('ai')>();
	return { ...actual, generateObject: mockGenerateObject };
});

vi.mock('$env/static/private', () => ({ ANTHROPIC_API_KEY: 'test-key' }));
vi.mock('@ai-sdk/anthropic', () => ({ createAnthropic: () => () => 'mock-model' }));

import { AIFoodPhotoScanner, mapRawItemToExtracted } from './ai-food-photo-scanner.js';

describe('AIFoodPhotoScanner', () => {
	it('calls generateObject with the food photo prompt', async () => {
		mockGenerateObject.mockResolvedValue({
			object: [
				{
					name: 'Whole Milk',
					canonicalName: 'milk',
					storageLocation: 'fridge',
					quantityValue: 1,
					quantityUnit: 'each',
					daysToExpiration: 12
				}
			]
		});

		const { Effect, Exit } = await import('effect');
		const result = await Effect.runPromiseExit(
			AIFoodPhotoScanner.extractItems({ imageBase64: 'abc123', mimeType: 'image/jpeg' })
		);

		expect(Exit.isSuccess(result)).toBe(true);
		expect(mockGenerateObject).toHaveBeenCalledWith(
			expect.objectContaining({ system: FOOD_PHOTO_SCAN_SYSTEM_PROMPT })
		);
	});

	it('sends camera-first user message text', async () => {
		mockGenerateObject.mockResolvedValue({
			object: [
				{
					name: 'Eggs',
					canonicalName: 'egg',
					storageLocation: 'fridge',
					quantityValue: 1,
					quantityUnit: 'dozen',
					daysToExpiration: 21
				}
			]
		});

		const { Effect } = await import('effect');
		await Effect.runPromise(
			AIFoodPhotoScanner.extractItems({ imageBase64: 'xyz', mimeType: 'image/png' })
		);

		const call = mockGenerateObject.mock.calls[0][0];
		const userMessage = call.messages[0];
		expect(userMessage.role).toBe('user');
		const textPart = userMessage.content.find((c: { type: string }) => c.type === 'text');
		expect(textPart?.text).toContain('food');
	});
});

describe('mapRawItemToExtracted (reused in food photo scanner)', () => {
	const now = new Date('2026-03-29T12:00:00Z');

	it('processes food photo extraction results correctly', () => {
		const result = mapRawItemToExtracted(
			{
				name: 'Sourdough Bread',
				canonicalName: 'bread',
				storageLocation: 'pantry',
				quantityValue: 1,
				quantityUnit: 'each',
				daysToExpiration: 7
			},
			now
		);

		expect(result.name).toBe('Sourdough Bread');
		expect(result.canonicalName).toBe('bread');
		expect(result.storageLocation).toBe('pantry');
		expect(result.quantity).toEqual({ value: 1, unit: 'count' });
		expect(result.expirationDate).toEqual(new Date('2026-04-05T12:00:00Z'));
	});

	it('returns null expirationDate when daysToExpiration is null', () => {
		const result = mapRawItemToExtracted(
			{
				name: 'Canned Beans',
				canonicalName: 'beans',
				storageLocation: 'pantry',
				quantityValue: 2,
				quantityUnit: 'each',
				daysToExpiration: null
			},
			now
		);

		expect(result.expirationDate).toBeNull();
	});
});
