import { Effect } from 'effect';
import { HouseholdRepository } from './household-repository.js';

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
