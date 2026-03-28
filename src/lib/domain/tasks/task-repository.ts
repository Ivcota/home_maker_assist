import { Context, Effect } from 'effect';
import type { Task, CreateTaskInput } from './task.js';

export interface TaskRepository {
	create(input: CreateTaskInput): Effect.Effect<Task>;
	findAll(): Effect.Effect<Task[]>;
}

export const TaskRepository = Context.GenericTag<TaskRepository>('TaskRepository');
