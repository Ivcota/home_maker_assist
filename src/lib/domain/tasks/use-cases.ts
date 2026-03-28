import { Effect } from 'effect';
import { TaskRepository } from './task-repository.js';
import type { Task, CreateTaskInput } from './task.js';

export const createTask = (input: CreateTaskInput): Effect.Effect<Task, never, TaskRepository> =>
	Effect.gen(function* () {
		const repo = yield* TaskRepository;
		return yield* repo.create(input);
	});

export const findAllTasks = (): Effect.Effect<Task[], never, TaskRepository> =>
	Effect.gen(function* () {
		const repo = yield* TaskRepository;
		return yield* repo.findAll();
	});
