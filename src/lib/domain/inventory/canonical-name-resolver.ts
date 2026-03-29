import { Context, Effect } from 'effect';

export interface CanonicalNameResolver {
	resolve(name: string): Effect.Effect<string, Error>;
}

export const CanonicalNameResolver =
	Context.GenericTag<CanonicalNameResolver>('CanonicalNameResolver');
