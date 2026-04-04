import { Data } from 'effect';

export class HouseholdRepositoryError extends Data.TaggedError('HouseholdRepositoryError')<{
	message: string;
	cause?: unknown;
}> {}
