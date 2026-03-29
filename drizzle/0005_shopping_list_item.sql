CREATE TYPE "public"."shopping_list_source_type" AS ENUM('restock', 'recipe');

CREATE TABLE "shopping_list_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"canonical_key" text NOT NULL,
	"display_name" text NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"source_type" "shopping_list_source_type" NOT NULL,
	"source_restock_item_id" integer,
	"source_recipe_names" text[],
	"carried_storage_location" "storage_location" NOT NULL,
	"carried_tracking_type" "tracking_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_list_item_user_id_canonical_key_unique" UNIQUE("user_id","canonical_key")
);

ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
