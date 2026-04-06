import { Data } from 'effect';

export class SubscriptionRepositoryError extends Data.TaggedError('SubscriptionRepositoryError')<{
	message: string;
	cause?: unknown;
}> {}

export class SubscriptionRequiredError extends Data.TaggedError('SubscriptionRequiredError')<{
	userId: string;
	feature: string;
}> {}
