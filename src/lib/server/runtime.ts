import { ManagedRuntime, Layer } from 'effect';
import { DrizzleTaskRepository } from '$lib/infrastructure/drizzle-task-repository.js';
import { DrizzleFoodItemRepository } from '$lib/infrastructure/drizzle-food-item-repository.js';
import { DatabaseLive } from '$lib/infrastructure/database.js';

const AppLive = Layer.mergeAll(DrizzleTaskRepository, DrizzleFoodItemRepository).pipe(
	Layer.provide(DatabaseLive)
);

export const appRuntime = ManagedRuntime.make(AppLive);
