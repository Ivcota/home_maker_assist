import { Context, Effect, Layer } from 'effect';
import { ReceiptScanner } from '$lib/domain/receipt/receipt-scanner.js';

type ReceiptScannerService = Context.Tag.Service<ReceiptScanner>;
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { z } from 'zod';
import { NoItemsExtractedError } from '$lib/domain/receipt/errors.js';
import type { ExtractedFoodItem } from '$lib/domain/receipt/types.js';
import { FOOD_PHOTO_SCAN_SYSTEM_PROMPT } from '$lib/domain/receipt/food-photo-prompts.js';
import { mapRawItemToExtracted, classifyAIError } from '$lib/infrastructure/ai-receipt-scanner.js';

export { mapRawItemToExtracted } from '$lib/infrastructure/ai-receipt-scanner.js';

const extractedFoodItemSchema = z.object({
	name: z.string(),
	canonicalName: z.string().nullable(),
	storageLocation: z.enum(['pantry', 'fridge', 'freezer']),
	quantityValue: z.number(),
	quantityUnit: z.string(),
	daysToExpiration: z.number().nullable()
});

export const AIFoodPhotoScanner: ReceiptScannerService = {
	extractItems: (input) =>
		Effect.tryPromise({
			try: async () => {
				const result = await generateObject({
					model: createAnthropic({ apiKey: ANTHROPIC_API_KEY })('claude-sonnet-4-6'),
					output: 'array',
					schema: extractedFoodItemSchema,
					system: FOOD_PHOTO_SCAN_SYSTEM_PROMPT,
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
									text: 'Identify all food items visible in this photo.'
								}
							]
						}
					]
				});

				const items: ExtractedFoodItem[] = result.object.map((item) =>
					mapRawItemToExtracted(item)
				);

				if (items.length === 0) {
					throw new NoItemsExtractedError();
				}

				return items;
			},
			catch: classifyAIError
		})
};

export const AIFoodPhotoScannerLive = Layer.succeed(ReceiptScanner, AIFoodPhotoScanner);
