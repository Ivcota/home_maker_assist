import { pgTable, serial, integer, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth.schema.js';

export const storageLocationEnum = pgEnum('storage_location', ['pantry', 'fridge', 'freezer']);
export const trackingTypeEnum = pgEnum('tracking_type', ['amount', 'count']);

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1),
	completedAt: timestamp('completed_at'),
	deletedAt: timestamp('deleted_at')
});

export const foodItem = pgTable('food_item', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	storageLocation: storageLocationEnum('storage_location').notNull(),
	trackingType: trackingTypeEnum('tracking_type').notNull(),
	amount: numeric('amount'),
	quantity: integer('quantity'),
	expirationDate: timestamp('expiration_date'),
	trashedAt: timestamp('trashed_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export * from './auth.schema';
