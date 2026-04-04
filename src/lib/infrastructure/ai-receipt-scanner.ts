import { Context, Effect, Layer } from 'effect';
import { ReceiptScanner } from '$lib/domain/receipt/receipt-scanner.js';

type ReceiptScannerService = Context.Tag.Service<ReceiptScanner>;
import { generateObject, NoObjectGeneratedError } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { z } from 'zod';
import {
	UnreadableImageError,
	NoItemsExtractedError,
	AIProviderError
} from '$lib/domain/receipt/errors.js';
import type { ExtractionError } from '$lib/domain/receipt/errors.js';
import type { ExtractedFoodItem } from '$lib/domain/receipt/types.js';
import { normalizeUnit, UnknownUnitError } from '$lib/infrastructure/unit-normalizer.js';
import type { Quantity } from '$lib/domain/shared/quantity.js';
import { RECEIPT_SCAN_SYSTEM_PROMPT } from '$lib/domain/receipt/prompts.js';

export interface RawExtractedItem {
	name: string;
	canonicalName: string | null;
	storageLocation: 'pantry' | 'fridge' | 'freezer';
	quantityValue: number;
	quantityUnit: string;
	daysToExpiration: number | null;
}

function safeNormalizeUnit(value: number, unit: string): Quantity {
	try {
		return normalizeUnit(value, unit);
	} catch (e) {
		if (e instanceof UnknownUnitError) {
			return { value, unit: 'count' };
		}
		throw e;
	}
}

export function mapRawItemToExtracted(
	item: RawExtractedItem,
	now: Date = new Date()
): ExtractedFoodItem {
	let expirationDate: Date | null = null;
	if (item.daysToExpiration != null) {
		const clamped = Math.max(1, Math.min(item.daysToExpiration, 730));
		expirationDate = new Date(now.getTime() + clamped * 24 * 60 * 60 * 1000);
	}
	return {
		name: item.name,
		canonicalName: item.canonicalName,
		storageLocation: item.storageLocation,
		quantity: safeNormalizeUnit(item.quantityValue, item.quantityUnit),
		expirationDate
	};
}

export function classifyAIError(e: unknown): ExtractionError {
	if (e instanceof NoItemsExtractedError) return e;
	if (e instanceof UnreadableImageError) return e;
	if (NoObjectGeneratedError.isInstance(e)) return new UnreadableImageError();
	const message = e instanceof Error ? e.message : String(e);
	if (message.includes('No object generated') || message.includes('NoObjectGenerated')) {
		return new UnreadableImageError();
	}
	return new AIProviderError({ cause: e });
}

const extractedFoodItemSchema = z.object({
	name: z.string(),
	canonicalName: z.string().nullable(),
	storageLocation: z.enum(['pantry', 'fridge', 'freezer']),
	quantityValue: z.number(),
	quantityUnit: z.string(),
	daysToExpiration: z.number().nullable()
});

export const AIReceiptScanner: ReceiptScannerService = {
	extractItems: (input) =>
		Effect.tryPromise({
			try: async () => {
				const result = await generateObject({
					model: createAnthropic({ apiKey: ANTHROPIC_API_KEY })('claude-sonnet-4-6'),
					output: 'array',
					schema: extractedFoodItemSchema,
					system: RECEIPT_SCAN_SYSTEM_PROMPT,
					messages: [
						{
							role: 'user',
							content: [
								{
									type: 'image',
									image: input.imageBase64,
									mediaType: input.mimeType as
										| 'image/jpeg'
										| 'image/png'
										| 'image/gif'
										| 'image/webp'
								},
								{
									type: 'text',
									text: 'Extract all food items from this receipt.'
								}
							]
						}
					]
				});

				const items: ExtractedFoodItem[] = result.object.map((item) => mapRawItemToExtracted(item));

				if (items.length === 0) {
					throw new NoItemsExtractedError();
				}

				return items;
			},
			catch: classifyAIError
		})
};

export const AIReceiptScannerLive = Layer.succeed(ReceiptScanner, AIReceiptScanner);
