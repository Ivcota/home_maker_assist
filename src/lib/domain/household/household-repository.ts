import { Context, Effect } from 'effect';
import type { Household } from './household.js';
import type { HouseholdRepositoryError } from './errors.js';

export class HouseholdRepository extends Context.Tag('HouseholdRepository')<
	HouseholdRepository,
	{
		readonly createSoloHousehold: (
			userId: string,
			userName: string
		) => Effect.Effect<Household, HouseholdRepositoryError>;
		readonly findByUserId: (
			userId: string
		) => Effect.Effect<Household | null, HouseholdRepositoryError>;
		readonly findByInviteCode: (
			code: string
		) => Effect.Effect<Household | null, HouseholdRepositoryError>;
		readonly generateInviteCode: (
			householdId: string
		) => Effect.Effect<Household, HouseholdRepositoryError>;
		readonly getMemberCount: (
			householdId: string
		) => Effect.Effect<number, HouseholdRepositoryError>;
		readonly joinHousehold: (
			userId: string,
			newHouseholdId: string,
			oldHouseholdId: string | null
		) => Effect.Effect<Household, HouseholdRepositoryError>;
		readonly getUserRole: (
			userId: string
		) => Effect.Effect<'owner' | 'member' | null, HouseholdRepositoryError>;
	}
>() {}
