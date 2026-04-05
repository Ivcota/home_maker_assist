import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { SubscriptionRepository } from './subscription-repository.js';
import { checkFeatureAccess, getSubscription } from './use-cases.js';
import { SubscriptionRequiredError } from './errors.js';
import type { Subscription } from './subscription.js';

const makeSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
	userId: 'user-1',
	tier: 'solo',
	status: 'active',
	currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
	...overrides
});

const makeRepo = (overrides: Partial<typeof SubscriptionRepository.Service> = {}) =>
	Layer.succeed(SubscriptionRepository, {
		findByUserId: () => Effect.succeed(null),
		isComplementary: () => Effect.succeed(false),
		findByHouseholdOwnerId: () =>
			Effect.succeed({ subscription: null, isComplementary: false }),
		...overrides
	});

describe('domain/subscription', () => {
	describe('checkFeatureAccess', () => {
		const accessResult = (userId: string, householdId: string | null, repo: ReturnType<typeof makeRepo>) =>
			Effect.runPromise(
				checkFeatureAccess(userId, householdId, 'scan').pipe(
					Effect.provide(repo),
					Effect.map(() => 'granted' as const),
					Effect.catchTag('SubscriptionRequiredError', () => Effect.succeed('denied' as const))
				)
			);

		it('grants access when user has complementary flag', async () => {
			const result = await accessResult('user-1', null, makeRepo({ isComplementary: () => Effect.succeed(true) }));
			expect(result).toBe('granted');
		});

		it('grants access when user has active solo subscription', async () => {
			const result = await accessResult(
				'user-1',
				null,
				makeRepo({ findByUserId: () => Effect.succeed(makeSubscription()) })
			);
			expect(result).toBe('granted');
		});
		it('grants access when cancelled but still within billing period', async () => {
			const result = await accessResult(
				'user-1',
				null,
				makeRepo({
					findByUserId: () =>
						Effect.succeed(
							makeSubscription({
								status: 'cancelled',
								currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
							})
						)
				})
			);
			expect(result).toBe('granted');
		});

		it('denies access when subscription is expired', async () => {
			const result = await accessResult(
				'user-1',
				null,
				makeRepo({
					findByUserId: () =>
						Effect.succeed(makeSubscription({ status: 'expired', currentPeriodEnd: new Date(Date.now() - 1000) }))
				})
			);
			expect(result).toBe('denied');
		});

		it('denies access when user has no subscription', async () => {
			const result = await accessResult('user-1', null, makeRepo());
			expect(result).toBe('denied');
		});

		it('grants access when household owner has active subscription', async () => {
			const result = await accessResult(
				'member-1',
				'hh-1',
				makeRepo({
					findByHouseholdOwnerId: () =>
						Effect.succeed({
							subscription: makeSubscription({ userId: 'owner-1' }),
							isComplementary: false
						})
				})
			);
			expect(result).toBe('granted');
		});

		it('denies access when household owner has no subscription', async () => {
			const result = await accessResult(
				'member-1',
				'hh-1',
				makeRepo({
					findByHouseholdOwnerId: () =>
						Effect.succeed({ subscription: null, isComplementary: false })
				})
			);
			expect(result).toBe('denied');
		});

		it('denies access when cancelled and past period end', async () => {
			const result = await accessResult(
				'user-1',
				null,
				makeRepo({
					findByUserId: () =>
						Effect.succeed(
							makeSubscription({
								status: 'cancelled',
								currentPeriodEnd: new Date(Date.now() - 1000)
							})
						)
				})
			);
			expect(result).toBe('denied');
		});

		it('grants access when household owner has complementary flag', async () => {
			const result = await accessResult(
				'member-1',
				'hh-1',
				makeRepo({
					findByHouseholdOwnerId: () =>
						Effect.succeed({ subscription: null, isComplementary: true })
				})
			);
			expect(result).toBe('granted');
		});
	});

	describe('getSubscription', () => {
		it('returns subscription when found', async () => {
			const sub = makeSubscription();
			const result = await Effect.runPromise(
				getSubscription('user-1').pipe(
					Effect.provide(makeRepo({ findByUserId: () => Effect.succeed(sub) }))
				)
			);
			expect(result).toEqual(sub);
		});

		it('returns null when no subscription exists', async () => {
			const result = await Effect.runPromise(
				getSubscription('user-1').pipe(Effect.provide(makeRepo()))
			);
			expect(result).toBeNull();
		});
	});
});
