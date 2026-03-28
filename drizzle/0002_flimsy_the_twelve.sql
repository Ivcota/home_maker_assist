CREATE TYPE "public"."storage_location" AS ENUM('pantry', 'fridge', 'freezer');--> statement-breakpoint
CREATE TYPE "public"."tracking_type" AS ENUM('amount', 'count');--> statement-breakpoint
CREATE TABLE "food_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"storage_location" "storage_location" NOT NULL,
	"tracking_type" "tracking_type" NOT NULL,
	"amount" numeric,
	"quantity" integer,
	"expiration_date" timestamp,
	"trashed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_item" ADD CONSTRAINT "food_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;