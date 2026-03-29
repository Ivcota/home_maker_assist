import { Effect } from 'effect';

/**
 * Unexpected (infrastructure) error tags — these log at ERROR level.
 * Everything else is expected/user-facing and logs at WARNING level.
 */
const UNEXPECTED_ERROR_TAGS = new Set([
	'AIProviderError',
	'FoodItemRepositoryError',
	'RecipeRepositoryError',
	'ShoppingListRepositoryError',
	'TaskRepositoryError'
]);

type TaggedError = { readonly _tag: string; readonly cause?: unknown; readonly message?: string };

function isUnexpectedError(error: TaggedError): boolean {
	return UNEXPECTED_ERROR_TAGS.has(error._tag);
}

/**
 * Wraps an Effect use case with logging and request context annotations.
 *
 * Logs:
 * - SUCCESS → INFO with use case name
 * - Expected errors → WARNING with error tag
 * - Unexpected errors → ERROR with error tag and cause
 */
export function withRequestLogging<A, E extends TaggedError, R>(
	effect: Effect.Effect<A, E, R>,
	context: {
		useCase: string;
		userId: string;
		requestId: string;
		route: string;
	}
): Effect.Effect<A, E, R> {
	return effect.pipe(
		Effect.tap(() =>
			Effect.logInfo(`${context.useCase} succeeded`)
		),
		Effect.tapError((e) =>
			isUnexpectedError(e)
				? Effect.logError(`${context.useCase} failed`, { errorTag: e._tag, cause: e.cause })
				: Effect.logWarning(`${context.useCase} failed`, { errorTag: e._tag })
		),
		Effect.annotateLogs({
			useCase: context.useCase,
			userId: context.userId,
			requestId: context.requestId,
			route: context.route
		}),
		Effect.withLogSpan(context.useCase)
	);
}
