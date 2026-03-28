import { fail, redirect } from '@sveltejs/kit';
import { Effect } from 'effect';
import type { Actions, PageServerLoad } from './$types';
import { appRuntime } from '$lib/server/runtime';
import { createFoodItem, findAllFoodItems } from '$lib/domain/inventory/use-cases';
import type { StorageLocation, TrackingType } from '$lib/domain/inventory/food-item';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/demo/better-auth/login');
	}

	const userId = locals.user.id;
	const items = await appRuntime.runPromise(
		findAllFoodItems(userId).pipe(Effect.orDie)
	);
	return { items };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const userId = locals.user.id;
		const formData = await request.formData();

		const name = formData.get('name')?.toString() ?? '';
		const storageLocation = (formData.get('storageLocation')?.toString() ?? 'pantry') as StorageLocation;
		const trackingType = (formData.get('trackingType')?.toString() ?? 'count') as TrackingType;
		const amountRaw = formData.get('amount')?.toString();
		const quantityRaw = formData.get('quantity')?.toString();
		const expirationDateRaw = formData.get('expirationDate')?.toString();

		const amount = trackingType === 'amount' && amountRaw ? parseFloat(amountRaw) : null;
		const quantity = trackingType === 'count' && quantityRaw ? parseInt(quantityRaw, 10) : null;
		const expirationDate = expirationDateRaw ? new Date(expirationDateRaw) : null;

		const outcome = await appRuntime.runPromise(
			Effect.match(
				createFoodItem(userId, { name, storageLocation, trackingType, amount, quantity, expirationDate }),
				{
					onFailure: (e) =>
						e._tag === 'FoodItemValidationError'
							? { ok: false as const, status: 400 as const, message: e.message }
							: { ok: false as const, status: 500 as const, message: 'Database error' },
					onSuccess: () => ({ ok: true as const })
				}
			)
		);

		if (!outcome.ok) return fail(outcome.status, { message: outcome.message });
	}
};
