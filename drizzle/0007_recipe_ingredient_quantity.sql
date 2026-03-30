-- Add quantity columns to recipe_ingredient (nullable for backfill)
ALTER TABLE "recipe_ingredient" ADD COLUMN "quantity_value" numeric;
ALTER TABLE "recipe_ingredient" ADD COLUMN "quantity_unit" text;
ALTER TABLE "recipe_ingredient" ADD COLUMN "canonical_ingredient_id" integer REFERENCES "canonical_ingredient"("id");

-- Backfill existing rows: parse numeric quantity if possible, otherwise default to 1 count
UPDATE "recipe_ingredient"
SET "quantity_value" = CASE
    WHEN "quantity" ~ '^[0-9]+(\.[0-9]+)?$' THEN "quantity"::numeric
    ELSE 1
  END,
  "quantity_unit" = CASE
    WHEN "unit" IS NOT NULL AND trim("unit") != '' THEN lower(trim("unit"))
    ELSE 'count'
  END;

-- Make quantity columns NOT NULL
ALTER TABLE "recipe_ingredient" ALTER COLUMN "quantity_value" SET NOT NULL;
ALTER TABLE "recipe_ingredient" ALTER COLUMN "quantity_unit" SET NOT NULL;

-- Drop deprecated columns
ALTER TABLE "recipe_ingredient" DROP COLUMN "canonical_name";
ALTER TABLE "recipe_ingredient" DROP COLUMN "quantity";
ALTER TABLE "recipe_ingredient" DROP COLUMN "unit";

-- Create recipe_note table
CREATE TABLE "recipe_note" (
  "id" serial PRIMARY KEY,
  "recipe_id" integer NOT NULL REFERENCES "recipe"("id") ON DELETE CASCADE,
  "text" text NOT NULL
);
