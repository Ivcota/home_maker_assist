import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { HouseholdRepository } from './household-repository.js';
import { createSoloHousehold, findUserHousehold } from './use-cases.js';
import { HouseholdRepositoryError } from './errors.js';
import type { Household } from './household.js';

const makeHousehold = (overrides: Partial<Household> = {}): Household => ({
	id: 'hh-1',
	name: "Alice's Household",
	inviteCode: null,
	inviteExpiresAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides
});

const makeRepo = (overrides: Partial<typeof HouseholdRepository.Service> = {}) =>
	Layer.succeed(HouseholdRepository, {
		createSoloHousehold: () => Effect.succeed(makeHousehold()),
		findByUserId: () => Effect.succeed(null),
		...overrides
	});

describe('domain/household', () => {
	it('createSoloHousehold delegates to repository and returns household', async () => {
		const household = makeHousehold({ id: 'hh-42', name: "Bob's Household" });

		const result = await Effect.runPromise(
			createSoloHousehold('user-1', 'Bob').pipe(
				Effect.provide(makeRepo({ createSoloHousehold: () => Effect.succeed(household) }))
			)
		);

		expect(result).toEqual(household);
	});

	it('createSoloHousehold passes userId and userName to repository', async () => {
		let capturedUserId: string | null = null;
		let capturedUserName: string | null = null;

		await Effect.runPromise(
			createSoloHousehold('user-99', 'Charlie').pipe(
				Effect.provide(
					makeRepo({
						createSoloHousehold: (userId, userName) => {
							capturedUserId = userId;
							capturedUserName = userName;
							return Effect.succeed(makeHousehold());
						}
					})
				)
			)
		);

		expect(capturedUserId).toBe('user-99');
		expect(capturedUserName).toBe('Charlie');
	});

	it('createSoloHousehold propagates repository errors', async () => {
		const error = new HouseholdRepositoryError({ message: 'DB is down' });

		const result = await Effect.runPromise(
			createSoloHousehold('user-1', 'Alice').pipe(
				Effect.provide(makeRepo({ createSoloHousehold: () => Effect.fail(error) })),
				Effect.flip
			)
		);

		expect(result).toBeInstanceOf(HouseholdRepositoryError);
		expect((result as HouseholdRepositoryError).message).toBe('DB is down');
	});

	it('findUserHousehold returns null when user has no household', async () => {
		const result = await Effect.runPromise(
			findUserHousehold('user-1').pipe(
				Effect.provide(makeRepo({ findByUserId: () => Effect.succeed(null) }))
			)
		);

		expect(result).toBeNull();
	});

	it('findUserHousehold returns household when found', async () => {
		const household = makeHousehold({ id: 'hh-7' });

		const result = await Effect.runPromise(
			findUserHousehold('user-1').pipe(
				Effect.provide(makeRepo({ findByUserId: () => Effect.succeed(household) }))
			)
		);

		expect(result).toEqual(household);
	});
});
