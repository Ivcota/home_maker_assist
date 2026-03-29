import { Data } from 'effect';

export class ShoppingListRepositoryError extends Data.TaggedError('ShoppingListRepositoryError')<{
	message: string;
	cause?: unknown;
}> {}

export class ShoppingListItemNotFoundError extends Data.TaggedError(
	'ShoppingListItemNotFoundError'
)<{
	id: number;
}> {}
