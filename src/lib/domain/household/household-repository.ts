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
	}
>() {}
