import { Effect } from 'effect';
import { HouseholdRepository } from './household-repository.js';
import {
	ExpiredInviteCodeError,
	HouseholdFullError,
	InvalidInviteCodeError,
	NotHouseholdOwnerError
} from './errors.js';

export const createSoloHousehold = (userId: string, userName: string) =>
	Effect.gen(function* () {
		const repo = yield* HouseholdRepository;
		return yield* repo.createSoloHousehold(userId, userName);
	});

export const findUserHousehold = (userId: string) =>
	Effect.gen(function* () {
		const repo = yield* HouseholdRepository;
		return yield* repo.findByUserId(userId);
	});

export const generateInviteCode = (householdId: string, userId: string) =>
	Effect.gen(function* () {
		const repo = yield* HouseholdRepository;
		const role = yield* repo.getUserRole(userId);
		if (role !== 'owner') {
			return yield* Effect.fail(new NotHouseholdOwnerError({ userId, householdId }));
		}
		return yield* repo.generateInviteCode(householdId);
	});

export const validateInviteCode = (code: string) =>
	Effect.gen(function* () {
		const repo = yield* HouseholdRepository;
		const household = yield* repo.findByInviteCode(code);
		if (!household) {
			return yield* Effect.fail(new InvalidInviteCodeError({ code }));
		}
		if (!household.inviteExpiresAt || household.inviteExpiresAt < new Date()) {
			return yield* Effect.fail(new ExpiredInviteCodeError({ code }));
		}
		return household;
	});

export const joinHousehold = (code: string, userId: string) =>
	Effect.gen(function* () {
		const repo = yield* HouseholdRepository;
		const household = yield* repo.findByInviteCode(code);
		if (!household) {
			return yield* Effect.fail(new InvalidInviteCodeError({ code }));
		}
		if (!household.inviteExpiresAt || household.inviteExpiresAt < new Date()) {
			return yield* Effect.fail(new ExpiredInviteCodeError({ code }));
		}
		const count = yield* repo.getMemberCount(household.id);
		if (count >= 10) {
			return yield* Effect.fail(new HouseholdFullError({ householdId: household.id }));
		}
		const currentHousehold = yield* repo.findByUserId(userId);
		const oldHouseholdId = currentHousehold ? currentHousehold.id : null;
		return yield* repo.joinHousehold(userId, household.id, oldHouseholdId);
	});
