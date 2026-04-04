import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { HouseholdRepository } from './household-repository.js';
import {
	createSoloHousehold,
	findUserHousehold,
	generateInviteCode,
	validateInviteCode,
	joinHousehold
} from './use-cases.js';
import {
	HouseholdRepositoryError,
	InvalidInviteCodeError,
	ExpiredInviteCodeError,
	HouseholdFullError,
	NotHouseholdOwnerError
} from './errors.js';
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
		findByInviteCode: () => Effect.succeed(null),
		generateInviteCode: () => Effect.succeed(makeHousehold()),
		getMemberCount: () => Effect.succeed(1),
		joinHousehold: () => Effect.succeed(makeHousehold()),
		getUserRole: () => Effect.succeed(null),
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

	// generateInviteCode
	describe('generateInviteCode', () => {
		it('fails with NotHouseholdOwnerError when user is not owner', async () => {
			const result = await Effect.runPromise(
				generateInviteCode('hh-1', 'user-1').pipe(
					Effect.provide(makeRepo({ getUserRole: () => Effect.succeed('member') })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(NotHouseholdOwnerError);
		});

		it('fails with NotHouseholdOwnerError when user has no role', async () => {
			const result = await Effect.runPromise(
				generateInviteCode('hh-1', 'user-1').pipe(
					Effect.provide(makeRepo({ getUserRole: () => Effect.succeed(null) })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(NotHouseholdOwnerError);
		});

		it('returns updated household with invite code when user is owner', async () => {
			const updatedHousehold = makeHousehold({
				inviteCode: 'abc123',
				inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			});

			const result = await Effect.runPromise(
				generateInviteCode('hh-1', 'user-1').pipe(
					Effect.provide(
						makeRepo({
							getUserRole: () => Effect.succeed('owner'),
							generateInviteCode: () => Effect.succeed(updatedHousehold)
						})
					)
				)
			);

			expect(result).toEqual(updatedHousehold);
		});

		it('passes householdId to repository generateInviteCode', async () => {
			let capturedId: string | null = null;

			await Effect.runPromise(
				generateInviteCode('hh-99', 'user-1').pipe(
					Effect.provide(
						makeRepo({
							getUserRole: () => Effect.succeed('owner'),
							generateInviteCode: (id) => {
								capturedId = id;
								return Effect.succeed(makeHousehold());
							}
						})
					)
				)
			);

			expect(capturedId).toBe('hh-99');
		});
	});

	// validateInviteCode
	describe('validateInviteCode', () => {
		it('fails with InvalidInviteCodeError when code not found', async () => {
			const result = await Effect.runPromise(
				validateInviteCode('bad-code').pipe(
					Effect.provide(makeRepo({ findByInviteCode: () => Effect.succeed(null) })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(InvalidInviteCodeError);
			expect((result as InvalidInviteCodeError).code).toBe('bad-code');
		});

		it('fails with ExpiredInviteCodeError when code is expired', async () => {
			const expired = makeHousehold({
				inviteCode: 'old-code',
				inviteExpiresAt: new Date(Date.now() - 1000)
			});

			const result = await Effect.runPromise(
				validateInviteCode('old-code').pipe(
					Effect.provide(makeRepo({ findByInviteCode: () => Effect.succeed(expired) })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(ExpiredInviteCodeError);
			expect((result as ExpiredInviteCodeError).code).toBe('old-code');
		});

		it('returns household when code is valid and not expired', async () => {
			const valid = makeHousehold({
				inviteCode: 'valid-code',
				inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			});

			const result = await Effect.runPromise(
				validateInviteCode('valid-code').pipe(
					Effect.provide(makeRepo({ findByInviteCode: () => Effect.succeed(valid) }))
				)
			);
			expect(result).toEqual(valid);
		});
	});

	// joinHousehold
	describe('joinHousehold', () => {
		it('fails with InvalidInviteCodeError when code not found', async () => {
			const result = await Effect.runPromise(
				joinHousehold('bad-code', 'user-1').pipe(
					Effect.provide(makeRepo({ findByInviteCode: () => Effect.succeed(null) })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(InvalidInviteCodeError);
		});

		it('fails with ExpiredInviteCodeError when code is expired', async () => {
			const expired = makeHousehold({
				inviteCode: 'old-code',
				inviteExpiresAt: new Date(Date.now() - 1000)
			});

			const result = await Effect.runPromise(
				joinHousehold('old-code', 'user-1').pipe(
					Effect.provide(makeRepo({ findByInviteCode: () => Effect.succeed(expired) })),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(ExpiredInviteCodeError);
		});

		it('fails with HouseholdFullError when household has 10 members', async () => {
			const full = makeHousehold({
				id: 'hh-full',
				inviteCode: 'full-code',
				inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			});

			const result = await Effect.runPromise(
				joinHousehold('full-code', 'user-1').pipe(
					Effect.provide(
						makeRepo({
							findByInviteCode: () => Effect.succeed(full),
							getMemberCount: () => Effect.succeed(10)
						})
					),
					Effect.flip
				)
			);
			expect(result).toBeInstanceOf(HouseholdFullError);
			expect((result as HouseholdFullError).householdId).toBe('hh-full');
		});

		it('joins household successfully for user with no previous household', async () => {
			const target = makeHousehold({
				id: 'hh-target',
				inviteCode: 'join-code',
				inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			});

			let capturedUserId: string | null = null;
			let capturedNewId: string | null = null;
			let capturedOldId: string | null | undefined = undefined;

			const result = await Effect.runPromise(
				joinHousehold('join-code', 'user-1').pipe(
					Effect.provide(
						makeRepo({
							findByInviteCode: () => Effect.succeed(target),
							getMemberCount: () => Effect.succeed(3),
							findByUserId: () => Effect.succeed(null),
							joinHousehold: (userId, newId, oldId) => {
								capturedUserId = userId;
								capturedNewId = newId;
								capturedOldId = oldId;
								return Effect.succeed(target);
							}
						})
					)
				)
			);

			expect(result).toEqual(target);
			expect(capturedUserId).toBe('user-1');
			expect(capturedNewId).toBe('hh-target');
			expect(capturedOldId).toBeNull();
		});

		it('passes old householdId to repository when user is switching households', async () => {
			const oldHousehold = makeHousehold({ id: 'hh-old' });
			const target = makeHousehold({
				id: 'hh-target',
				inviteCode: 'join-code',
				inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			});

			let capturedOldId: string | null | undefined = undefined;

			await Effect.runPromise(
				joinHousehold('join-code', 'user-1').pipe(
					Effect.provide(
						makeRepo({
							findByInviteCode: () => Effect.succeed(target),
							getMemberCount: () => Effect.succeed(3),
							findByUserId: () => Effect.succeed(oldHousehold),
							joinHousehold: (_u, _n, oldId) => {
								capturedOldId = oldId;
								return Effect.succeed(target);
							}
						})
					)
				)
			);

			expect(capturedOldId).toBe('hh-old');
		});
	});
});
