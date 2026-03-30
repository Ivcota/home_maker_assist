-- Add quantity columns to shopping_list_item (nullable for migration)
ALTER TABLE "shopping_list_item" ADD COLUMN "quantity_value" numeric;
ALTER TABLE "shopping_list_item" ADD COLUMN "quantity_unit" text;

-- Migrate existing rows: count items get count=1, amount items get count=1 placeholder
UPDATE "shopping_list_item"
SET "quantity_value" = 1,
    "quantity_unit" = 'count';

-- Make columns NOT NULL now that all rows are backfilled
ALTER TABLE "shopping_list_item" ALTER COLUMN "quantity_value" SET NOT NULL;
ALTER TABLE "shopping_list_item" ALTER COLUMN "quantity_unit" SET NOT NULL;

-- Drop deprecated column
ALTER TABLE "shopping_list_item" DROP COLUMN "carried_tracking_type";
