import { json, error } from '@sveltejs/kit';
import { Effect } from 'effect';
import type { RequestHandler } from './$types';
import { withRequestLogging } from '$lib/server/logging';
import { appRuntime } from '$lib/server/runtime.js';
import { extractItemsFromReceipt } from '$lib/domain/receipt/use-cases.js';
import { AIFoodPhotoScannerLive } from '$lib/infrastructure/ai-food-photo-scanner.js';
import { checkFeatureAccess } from '$lib/domain/subscription/use-cases.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const accessResult = await appRuntime.runPromise(
		checkFeatureAccess(locals.user.id, locals.householdId ?? null, 'scan').pipe(
			Effect.map(() => 'granted' as const),
			Effect.catchTag('SubscriptionRequiredError', () => Effect.succeed('denied' as const))
		)
	);
	if (accessResult === 'denied') {
		error(403, 'This feature requires an active subscription.');
	}

	const formData = await request.formData();
	const imageFile = formData.get('image');

	if (!(imageFile instanceof File)) {
		error(400, 'Missing image file');
	}

	const arrayBuffer = await imageFile.arrayBuffer();
	const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
	const mimeType = imageFile.type || 'image/jpeg';

	const ctx = {
		userId: locals.user.id,
		requestId: locals.requestId,
		route: '/api/scan-food',
		useCase: 'extractItemsFromFoodPhoto'
	};

	const outcome = await appRuntime.runPromise(
		Effect.match(
			withRequestLogging(
				extractItemsFromReceipt({ imageBase64, mimeType }).pipe(
					Effect.withLogSpan('ai-food-photo-scan'),
					Effect.provide(AIFoodPhotoScannerLive)
				),
				ctx
			),
			{
				onFailure: (e) => {
					if (e._tag === 'UnreadableImageError' || e._tag === 'NoItemsExtractedError') {
						return { ok: false as const, status: 422 as const };
					}
					console.error(e.cause);
					return { ok: false as const, status: 503 as const };
				},
				onSuccess: (items) => ({ ok: true as const, items })
			}
		)
	);

	if (!outcome.ok) {
		if (outcome.status === 422) {
			error(422, "Couldn't extract any items from this image. Try a clearer photo.");
		}
		error(503, 'Something went wrong. Try again in a moment.');
	}

	return json(outcome.items);
};
