-- Create household_role enum
CREATE TYPE "public"."household_role" AS ENUM('owner', 'member');
--> statement-breakpoint

-- Create household table
CREATE TABLE "household" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"invite_code" text,
	"invite_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add household_id (nullable initially) and household_role to user table
ALTER TABLE "user" ADD COLUMN "household_id" text REFERENCES "household"("id");
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "household_role" "household_role";
--> statement-breakpoint

-- Backfill: create a solo household for each existing user and assign them as owner
DO $$
DECLARE
	u RECORD;
	new_household_id TEXT;
BEGIN
	FOR u IN SELECT id, name FROM "user" LOOP
		new_household_id := gen_random_uuid()::text;
		INSERT INTO "household" (id, name, created_at, updated_at)
		VALUES (new_household_id, u.name || '''s Household', now(), now());
		UPDATE "user" SET household_id = new_household_id, household_role = 'owner' WHERE id = u.id;
	END LOOP;
END $$;
--> statement-breakpoint

-- Add household_id (FK) to data tables
ALTER TABLE "food_item" ADD COLUMN "household_id" text REFERENCES "household"("id");
--> statement-breakpoint
ALTER TABLE "recipe" ADD COLUMN "household_id" text REFERENCES "household"("id");
--> statement-breakpoint
ALTER TABLE "shopping_list_item" ADD COLUMN "household_id" text REFERENCES "household"("id");
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "household_id" text REFERENCES "household"("id");
--> statement-breakpoint

-- Backfill household_id on all data tables from user's household
UPDATE "food_item" fi SET household_id = u.household_id FROM "user" u WHERE fi.user_id = u.id;
--> statement-breakpoint
UPDATE "recipe" r SET household_id = u.household_id FROM "user" u WHERE r.user_id = u.id;
--> statement-breakpoint
UPDATE "shopping_list_item" sli SET household_id = u.household_id FROM "user" u WHERE sli.user_id = u.id;
--> statement-breakpoint
UPDATE "task" t SET household_id = u.household_id FROM "user" u WHERE t.user_id = u.id;
