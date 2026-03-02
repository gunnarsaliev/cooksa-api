import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'bg');
  CREATE TYPE "public"."enum_ingredients_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ingredients_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ingredients_v_published_locale" AS ENUM('en', 'bg');
  CREATE TYPE "public"."enum_recipes_ingredients_unit" AS ENUM('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'smallPiece', 'mediumPiece', 'largePiece');
  CREATE TYPE "public"."enum_recipes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipes_v_version_ingredients_unit" AS ENUM('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'smallPiece', 'mediumPiece', 'largePiece');
  CREATE TYPE "public"."enum__recipes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipes_v_published_locale" AS ENUM('en', 'bg');
  CREATE TYPE "public"."enum_ingredient_nutritions_data_source" AS ENUM('usda', 'openai');
  CREATE TYPE "public"."enum_ingredient_nutritions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ingredient_nutritions_v_version_data_source" AS ENUM('usda', 'openai');
  CREATE TYPE "public"."enum__ingredient_nutritions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ingredient_nutritions_v_published_locale" AS ENUM('en', 'bg');
  CREATE TYPE "public"."enum_recipe_nutritions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipe_nutritions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipe_nutritions_v_published_locale" AS ENUM('en', 'bg');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "countries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"capital" varchar NOT NULL,
  	"population" numeric NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ingredient_faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingredient_id" integer NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"order" numeric,
  	"is_published" boolean DEFAULT true,
  	"published_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ingredient_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ingredient_tags_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ingredients_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "ingredients_faq_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ingredients_video_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "ingredients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"image_id" integer,
  	"published_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_ingredients_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "ingredients_locales" (
  	"name" varchar,
  	"long_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ingredients_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"ingredient_tags_id" integer
  );
  
  CREATE TABLE "_ingredients_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ingredients_v_version_faq_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_ingredients_v_version_video_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ingredients_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_published_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__ingredients_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__ingredients_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_ingredients_v_locales" (
  	"version_name" varchar,
  	"version_long_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_ingredients_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"ingredient_tags_id" integer
  );
  
  CREATE TABLE "recipe_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "recipe_tags_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "recipes_media_youtube_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "recipes_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" varchar,
  	"unit" "enum_recipes_ingredients_unit" DEFAULT 'g'
  );
  
  CREATE TABLE "recipes_ingredients_locales" (
  	"ingredient_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "recipes_directions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "recipes_directions_locales" (
  	"direction" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "recipes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_recipes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "recipes_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "recipes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"recipes_id" integer,
  	"users_id" integer,
  	"recipe_tags_id" integer
  );
  
  CREATE TABLE "_recipes_v_version_media_youtube_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"amount" varchar,
  	"unit" "enum__recipes_v_version_ingredients_unit" DEFAULT 'g',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_ingredients_locales" (
  	"ingredient_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_recipes_v_version_directions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_directions_locales" (
  	"direction" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_recipes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__recipes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__recipes_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_recipes_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_recipes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"recipes_id" integer,
  	"users_id" integer,
  	"recipe_tags_id" integer
  );
  
  CREATE TABLE "ingredient_nutritions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"ingredient_slug_en" varchar,
  	"data_source" "enum_ingredient_nutritions_data_source" DEFAULT 'openai',
  	"usda_fdc_id" numeric,
  	"calories" numeric,
  	"protein" numeric,
  	"fat" numeric,
  	"saturated_fat" numeric,
  	"trans_fat" numeric,
  	"polyunsaturated_fat" numeric,
  	"monounsaturated_fat" numeric,
  	"cholesterol" numeric,
  	"carbohydrates" numeric,
  	"fiber" numeric,
  	"sugars" numeric,
  	"added_sugars" numeric,
  	"sodium" numeric,
  	"potassium" numeric,
  	"calcium" numeric,
  	"iron" numeric,
  	"vitamin_a" numeric,
  	"vitamin_c" numeric,
  	"vitamin_d" numeric,
  	"vitamin_e" numeric,
  	"vitamin_k" numeric,
  	"magnesium" numeric,
  	"zinc" numeric,
  	"phosphorus" numeric,
  	"folate" numeric,
  	"niacin" numeric,
  	"riboflavin" numeric,
  	"thiamin" numeric,
  	"vitamin_b6" numeric,
  	"vitamin_b12" numeric,
  	"biotin" numeric,
  	"pantothenic_acid" numeric,
  	"selenium" numeric,
  	"copper" numeric,
  	"manganese" numeric,
  	"chromium" numeric,
  	"molybdenum" numeric,
  	"iodine" numeric,
  	"chloride" numeric,
  	"small_piece_weight" numeric,
  	"medium_piece_weight" numeric,
  	"large_piece_weight" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_ingredient_nutritions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_ingredient_nutritions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ingredient_id" integer,
  	"version_ingredient_slug_en" varchar,
  	"version_data_source" "enum__ingredient_nutritions_v_version_data_source" DEFAULT 'openai',
  	"version_usda_fdc_id" numeric,
  	"version_calories" numeric,
  	"version_protein" numeric,
  	"version_fat" numeric,
  	"version_saturated_fat" numeric,
  	"version_trans_fat" numeric,
  	"version_polyunsaturated_fat" numeric,
  	"version_monounsaturated_fat" numeric,
  	"version_cholesterol" numeric,
  	"version_carbohydrates" numeric,
  	"version_fiber" numeric,
  	"version_sugars" numeric,
  	"version_added_sugars" numeric,
  	"version_sodium" numeric,
  	"version_potassium" numeric,
  	"version_calcium" numeric,
  	"version_iron" numeric,
  	"version_vitamin_a" numeric,
  	"version_vitamin_c" numeric,
  	"version_vitamin_d" numeric,
  	"version_vitamin_e" numeric,
  	"version_vitamin_k" numeric,
  	"version_magnesium" numeric,
  	"version_zinc" numeric,
  	"version_phosphorus" numeric,
  	"version_folate" numeric,
  	"version_niacin" numeric,
  	"version_riboflavin" numeric,
  	"version_thiamin" numeric,
  	"version_vitamin_b6" numeric,
  	"version_vitamin_b12" numeric,
  	"version_biotin" numeric,
  	"version_pantothenic_acid" numeric,
  	"version_selenium" numeric,
  	"version_copper" numeric,
  	"version_manganese" numeric,
  	"version_chromium" numeric,
  	"version_molybdenum" numeric,
  	"version_iodine" numeric,
  	"version_chloride" numeric,
  	"version_small_piece_weight" numeric,
  	"version_medium_piece_weight" numeric,
  	"version_large_piece_weight" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__ingredient_nutritions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__ingredient_nutritions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "recipe_nutritions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipe_slug" varchar,
  	"recipe_name" varchar,
  	"recipe_slug_en" varchar,
  	"calories" numeric,
  	"protein" numeric,
  	"fat" numeric,
  	"saturated_fat" numeric,
  	"trans_fat" numeric,
  	"polyunsaturated_fat" numeric,
  	"monounsaturated_fat" numeric,
  	"cholesterol" numeric,
  	"carbohydrates" numeric,
  	"fiber" numeric,
  	"sugars" numeric,
  	"added_sugars" numeric,
  	"sodium" numeric,
  	"potassium" numeric,
  	"calcium" numeric,
  	"iron" numeric,
  	"vitamin_a" numeric,
  	"vitamin_c" numeric,
  	"vitamin_d" numeric,
  	"vitamin_e" numeric,
  	"vitamin_k" numeric,
  	"magnesium" numeric,
  	"zinc" numeric,
  	"phosphorus" numeric,
  	"folate" numeric,
  	"niacin" numeric,
  	"riboflavin" numeric,
  	"thiamin" numeric,
  	"vitamin_b6" numeric,
  	"vitamin_b12" numeric,
  	"biotin" numeric,
  	"pantothenic_acid" numeric,
  	"selenium" numeric,
  	"copper" numeric,
  	"manganese" numeric,
  	"chromium" numeric,
  	"molybdenum" numeric,
  	"iodine" numeric,
  	"chloride" numeric,
  	"last_calculated" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_recipe_nutritions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_recipe_nutritions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_recipe_slug" varchar,
  	"version_recipe_name" varchar,
  	"version_recipe_slug_en" varchar,
  	"version_calories" numeric,
  	"version_protein" numeric,
  	"version_fat" numeric,
  	"version_saturated_fat" numeric,
  	"version_trans_fat" numeric,
  	"version_polyunsaturated_fat" numeric,
  	"version_monounsaturated_fat" numeric,
  	"version_cholesterol" numeric,
  	"version_carbohydrates" numeric,
  	"version_fiber" numeric,
  	"version_sugars" numeric,
  	"version_added_sugars" numeric,
  	"version_sodium" numeric,
  	"version_potassium" numeric,
  	"version_calcium" numeric,
  	"version_iron" numeric,
  	"version_vitamin_a" numeric,
  	"version_vitamin_c" numeric,
  	"version_vitamin_d" numeric,
  	"version_vitamin_e" numeric,
  	"version_vitamin_k" numeric,
  	"version_magnesium" numeric,
  	"version_zinc" numeric,
  	"version_phosphorus" numeric,
  	"version_folate" numeric,
  	"version_niacin" numeric,
  	"version_riboflavin" numeric,
  	"version_thiamin" numeric,
  	"version_vitamin_b6" numeric,
  	"version_vitamin_b12" numeric,
  	"version_biotin" numeric,
  	"version_pantothenic_acid" numeric,
  	"version_selenium" numeric,
  	"version_copper" numeric,
  	"version_manganese" numeric,
  	"version_chromium" numeric,
  	"version_molybdenum" numeric,
  	"version_iodine" numeric,
  	"version_chloride" numeric,
  	"version_last_calculated" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__recipe_nutritions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__recipe_nutritions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"countries_id" integer,
  	"ingredient_faq_id" integer,
  	"ingredient_tags_id" integer,
  	"ingredients_id" integer,
  	"recipe_tags_id" integer,
  	"recipes_id" integer,
  	"ingredient_nutritions_id" integer,
  	"recipe_nutritions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "countries" ADD CONSTRAINT "countries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredient_faq" ADD CONSTRAINT "ingredient_faq_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredient_faq" ADD CONSTRAINT "ingredient_faq_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredient_tags_locales" ADD CONSTRAINT "ingredient_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredient_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_faq" ADD CONSTRAINT "ingredients_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_faq_locales" ADD CONSTRAINT "ingredients_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredients_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_video_urls" ADD CONSTRAINT "ingredients_video_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredients_locales" ADD CONSTRAINT "ingredients_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_ingredient_tags_fk" FOREIGN KEY ("ingredient_tags_id") REFERENCES "public"."ingredient_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_version_faq" ADD CONSTRAINT "_ingredients_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_version_faq_locales" ADD CONSTRAINT "_ingredients_v_version_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ingredients_v_version_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_version_video_urls" ADD CONSTRAINT "_ingredients_v_version_video_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v" ADD CONSTRAINT "_ingredients_v_parent_id_ingredients_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ingredients_v" ADD CONSTRAINT "_ingredients_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ingredients_v" ADD CONSTRAINT "_ingredients_v_version_published_by_id_users_id_fk" FOREIGN KEY ("version_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ingredients_v_locales" ADD CONSTRAINT "_ingredients_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_rels" ADD CONSTRAINT "_ingredients_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_rels" ADD CONSTRAINT "_ingredients_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ingredients_v_rels" ADD CONSTRAINT "_ingredients_v_rels_ingredient_tags_fk" FOREIGN KEY ("ingredient_tags_id") REFERENCES "public"."ingredient_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_tags_locales" ADD CONSTRAINT "recipe_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_media_youtube_urls" ADD CONSTRAINT "recipes_media_youtube_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_ingredients_locales" ADD CONSTRAINT "recipes_ingredients_locales_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes_ingredients_locales" ADD CONSTRAINT "recipes_ingredients_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_directions" ADD CONSTRAINT "recipes_directions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_directions_locales" ADD CONSTRAINT "recipes_directions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes_directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_locales" ADD CONSTRAINT "recipes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_recipe_tags_fk" FOREIGN KEY ("recipe_tags_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_media_youtube_urls" ADD CONSTRAINT "_recipes_v_version_media_youtube_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredients" ADD CONSTRAINT "_recipes_v_version_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredients_locales" ADD CONSTRAINT "_recipes_v_version_ingredients_locales_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredients_locales" ADD CONSTRAINT "_recipes_v_version_ingredients_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v_version_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_directions" ADD CONSTRAINT "_recipes_v_version_directions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_directions_locales" ADD CONSTRAINT "_recipes_v_version_directions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v_version_directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_parent_id_recipes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v_locales" ADD CONSTRAINT "_recipes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_recipe_tags_fk" FOREIGN KEY ("recipe_tags_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredient_nutritions" ADD CONSTRAINT "ingredient_nutritions_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ingredient_nutritions_v" ADD CONSTRAINT "_ingredient_nutritions_v_parent_id_ingredient_nutritions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ingredient_nutritions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ingredient_nutritions_v" ADD CONSTRAINT "_ingredient_nutritions_v_version_ingredient_id_ingredients_id_fk" FOREIGN KEY ("version_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipe_nutritions_v" ADD CONSTRAINT "_recipe_nutritions_v_parent_id_recipe_nutritions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipe_nutritions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredient_faq_fk" FOREIGN KEY ("ingredient_faq_id") REFERENCES "public"."ingredient_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredient_tags_fk" FOREIGN KEY ("ingredient_tags_id") REFERENCES "public"."ingredient_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipe_tags_fk" FOREIGN KEY ("recipe_tags_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredient_nutritions_fk" FOREIGN KEY ("ingredient_nutritions_id") REFERENCES "public"."ingredient_nutritions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipe_nutritions_fk" FOREIGN KEY ("recipe_nutritions_id") REFERENCES "public"."recipe_nutritions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "countries_image_idx" ON "countries" USING btree ("image_id");
  CREATE INDEX "countries_updated_at_idx" ON "countries" USING btree ("updated_at");
  CREATE INDEX "countries_created_at_idx" ON "countries" USING btree ("created_at");
  CREATE INDEX "ingredient_faq_ingredient_idx" ON "ingredient_faq" USING btree ("ingredient_id");
  CREATE INDEX "ingredient_faq_published_by_idx" ON "ingredient_faq" USING btree ("published_by_id");
  CREATE INDEX "ingredient_faq_updated_at_idx" ON "ingredient_faq" USING btree ("updated_at");
  CREATE INDEX "ingredient_faq_created_at_idx" ON "ingredient_faq" USING btree ("created_at");
  CREATE UNIQUE INDEX "ingredient_tags_slug_idx" ON "ingredient_tags" USING btree ("slug");
  CREATE INDEX "ingredient_tags_updated_at_idx" ON "ingredient_tags" USING btree ("updated_at");
  CREATE INDEX "ingredient_tags_created_at_idx" ON "ingredient_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "ingredient_tags_name_idx" ON "ingredient_tags_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "ingredient_tags_locales_locale_parent_id_unique" ON "ingredient_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ingredients_faq_order_idx" ON "ingredients_faq" USING btree ("_order");
  CREATE INDEX "ingredients_faq_parent_id_idx" ON "ingredients_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ingredients_faq_locales_locale_parent_id_unique" ON "ingredients_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ingredients_video_urls_order_idx" ON "ingredients_video_urls" USING btree ("_order");
  CREATE INDEX "ingredients_video_urls_parent_id_idx" ON "ingredients_video_urls" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ingredients_slug_idx" ON "ingredients" USING btree ("slug");
  CREATE INDEX "ingredients_image_idx" ON "ingredients" USING btree ("image_id");
  CREATE INDEX "ingredients_published_by_idx" ON "ingredients" USING btree ("published_by_id");
  CREATE INDEX "ingredients_updated_at_idx" ON "ingredients" USING btree ("updated_at");
  CREATE INDEX "ingredients_created_at_idx" ON "ingredients" USING btree ("created_at");
  CREATE INDEX "ingredients__status_idx" ON "ingredients" USING btree ("_status");
  CREATE UNIQUE INDEX "ingredients_name_idx" ON "ingredients_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "ingredients_locales_locale_parent_id_unique" ON "ingredients_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ingredients_rels_order_idx" ON "ingredients_rels" USING btree ("order");
  CREATE INDEX "ingredients_rels_parent_idx" ON "ingredients_rels" USING btree ("parent_id");
  CREATE INDEX "ingredients_rels_path_idx" ON "ingredients_rels" USING btree ("path");
  CREATE INDEX "ingredients_rels_media_id_idx" ON "ingredients_rels" USING btree ("media_id");
  CREATE INDEX "ingredients_rels_ingredient_tags_id_idx" ON "ingredients_rels" USING btree ("ingredient_tags_id");
  CREATE INDEX "_ingredients_v_version_faq_order_idx" ON "_ingredients_v_version_faq" USING btree ("_order");
  CREATE INDEX "_ingredients_v_version_faq_parent_id_idx" ON "_ingredients_v_version_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_ingredients_v_version_faq_locales_locale_parent_id_unique" ON "_ingredients_v_version_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_ingredients_v_version_video_urls_order_idx" ON "_ingredients_v_version_video_urls" USING btree ("_order");
  CREATE INDEX "_ingredients_v_version_video_urls_parent_id_idx" ON "_ingredients_v_version_video_urls" USING btree ("_parent_id");
  CREATE INDEX "_ingredients_v_parent_idx" ON "_ingredients_v" USING btree ("parent_id");
  CREATE INDEX "_ingredients_v_version_version_slug_idx" ON "_ingredients_v" USING btree ("version_slug");
  CREATE INDEX "_ingredients_v_version_version_image_idx" ON "_ingredients_v" USING btree ("version_image_id");
  CREATE INDEX "_ingredients_v_version_version_published_by_idx" ON "_ingredients_v" USING btree ("version_published_by_id");
  CREATE INDEX "_ingredients_v_version_version_updated_at_idx" ON "_ingredients_v" USING btree ("version_updated_at");
  CREATE INDEX "_ingredients_v_version_version_created_at_idx" ON "_ingredients_v" USING btree ("version_created_at");
  CREATE INDEX "_ingredients_v_version_version__status_idx" ON "_ingredients_v" USING btree ("version__status");
  CREATE INDEX "_ingredients_v_created_at_idx" ON "_ingredients_v" USING btree ("created_at");
  CREATE INDEX "_ingredients_v_updated_at_idx" ON "_ingredients_v" USING btree ("updated_at");
  CREATE INDEX "_ingredients_v_snapshot_idx" ON "_ingredients_v" USING btree ("snapshot");
  CREATE INDEX "_ingredients_v_published_locale_idx" ON "_ingredients_v" USING btree ("published_locale");
  CREATE INDEX "_ingredients_v_latest_idx" ON "_ingredients_v" USING btree ("latest");
  CREATE INDEX "_ingredients_v_autosave_idx" ON "_ingredients_v" USING btree ("autosave");
  CREATE INDEX "_ingredients_v_version_version_name_idx" ON "_ingredients_v_locales" USING btree ("version_name","_locale");
  CREATE UNIQUE INDEX "_ingredients_v_locales_locale_parent_id_unique" ON "_ingredients_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_ingredients_v_rels_order_idx" ON "_ingredients_v_rels" USING btree ("order");
  CREATE INDEX "_ingredients_v_rels_parent_idx" ON "_ingredients_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ingredients_v_rels_path_idx" ON "_ingredients_v_rels" USING btree ("path");
  CREATE INDEX "_ingredients_v_rels_media_id_idx" ON "_ingredients_v_rels" USING btree ("media_id");
  CREATE INDEX "_ingredients_v_rels_ingredient_tags_id_idx" ON "_ingredients_v_rels" USING btree ("ingredient_tags_id");
  CREATE UNIQUE INDEX "recipe_tags_slug_idx" ON "recipe_tags" USING btree ("slug");
  CREATE INDEX "recipe_tags_updated_at_idx" ON "recipe_tags" USING btree ("updated_at");
  CREATE INDEX "recipe_tags_created_at_idx" ON "recipe_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "recipe_tags_name_idx" ON "recipe_tags_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "recipe_tags_locales_locale_parent_id_unique" ON "recipe_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "recipes_media_youtube_urls_order_idx" ON "recipes_media_youtube_urls" USING btree ("_order");
  CREATE INDEX "recipes_media_youtube_urls_parent_id_idx" ON "recipes_media_youtube_urls" USING btree ("_parent_id");
  CREATE INDEX "recipes_ingredients_order_idx" ON "recipes_ingredients" USING btree ("_order");
  CREATE INDEX "recipes_ingredients_parent_id_idx" ON "recipes_ingredients" USING btree ("_parent_id");
  CREATE INDEX "recipes_ingredients_ingredient_idx" ON "recipes_ingredients_locales" USING btree ("ingredient_id","_locale");
  CREATE UNIQUE INDEX "recipes_ingredients_locales_locale_parent_id_unique" ON "recipes_ingredients_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "recipes_directions_order_idx" ON "recipes_directions" USING btree ("_order");
  CREATE INDEX "recipes_directions_parent_id_idx" ON "recipes_directions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "recipes_directions_locales_locale_parent_id_unique" ON "recipes_directions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "recipes_slug_idx" ON "recipes" USING btree ("slug");
  CREATE INDEX "recipes_updated_at_idx" ON "recipes" USING btree ("updated_at");
  CREATE INDEX "recipes_created_at_idx" ON "recipes" USING btree ("created_at");
  CREATE INDEX "recipes__status_idx" ON "recipes" USING btree ("_status");
  CREATE UNIQUE INDEX "recipes_locales_locale_parent_id_unique" ON "recipes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "recipes_rels_order_idx" ON "recipes_rels" USING btree ("order");
  CREATE INDEX "recipes_rels_parent_idx" ON "recipes_rels" USING btree ("parent_id");
  CREATE INDEX "recipes_rels_path_idx" ON "recipes_rels" USING btree ("path");
  CREATE INDEX "recipes_rels_media_id_idx" ON "recipes_rels" USING btree ("media_id");
  CREATE INDEX "recipes_rels_recipes_id_idx" ON "recipes_rels" USING btree ("recipes_id");
  CREATE INDEX "recipes_rels_users_id_idx" ON "recipes_rels" USING btree ("users_id");
  CREATE INDEX "recipes_rels_recipe_tags_id_idx" ON "recipes_rels" USING btree ("recipe_tags_id");
  CREATE INDEX "_recipes_v_version_media_youtube_urls_order_idx" ON "_recipes_v_version_media_youtube_urls" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_media_youtube_urls_parent_id_idx" ON "_recipes_v_version_media_youtube_urls" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_ingredients_order_idx" ON "_recipes_v_version_ingredients" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_ingredients_parent_id_idx" ON "_recipes_v_version_ingredients" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_ingredients_ingredient_idx" ON "_recipes_v_version_ingredients_locales" USING btree ("ingredient_id","_locale");
  CREATE UNIQUE INDEX "_recipes_v_version_ingredients_locales_locale_parent_id_uniq" ON "_recipes_v_version_ingredients_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_recipes_v_version_directions_order_idx" ON "_recipes_v_version_directions" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_directions_parent_id_idx" ON "_recipes_v_version_directions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_recipes_v_version_directions_locales_locale_parent_id_uniqu" ON "_recipes_v_version_directions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_recipes_v_parent_idx" ON "_recipes_v" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_version_version_slug_idx" ON "_recipes_v" USING btree ("version_slug");
  CREATE INDEX "_recipes_v_version_version_updated_at_idx" ON "_recipes_v" USING btree ("version_updated_at");
  CREATE INDEX "_recipes_v_version_version_created_at_idx" ON "_recipes_v" USING btree ("version_created_at");
  CREATE INDEX "_recipes_v_version_version__status_idx" ON "_recipes_v" USING btree ("version__status");
  CREATE INDEX "_recipes_v_created_at_idx" ON "_recipes_v" USING btree ("created_at");
  CREATE INDEX "_recipes_v_updated_at_idx" ON "_recipes_v" USING btree ("updated_at");
  CREATE INDEX "_recipes_v_snapshot_idx" ON "_recipes_v" USING btree ("snapshot");
  CREATE INDEX "_recipes_v_published_locale_idx" ON "_recipes_v" USING btree ("published_locale");
  CREATE INDEX "_recipes_v_latest_idx" ON "_recipes_v" USING btree ("latest");
  CREATE INDEX "_recipes_v_autosave_idx" ON "_recipes_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_recipes_v_locales_locale_parent_id_unique" ON "_recipes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_recipes_v_rels_order_idx" ON "_recipes_v_rels" USING btree ("order");
  CREATE INDEX "_recipes_v_rels_parent_idx" ON "_recipes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_rels_path_idx" ON "_recipes_v_rels" USING btree ("path");
  CREATE INDEX "_recipes_v_rels_media_id_idx" ON "_recipes_v_rels" USING btree ("media_id");
  CREATE INDEX "_recipes_v_rels_recipes_id_idx" ON "_recipes_v_rels" USING btree ("recipes_id");
  CREATE INDEX "_recipes_v_rels_users_id_idx" ON "_recipes_v_rels" USING btree ("users_id");
  CREATE INDEX "_recipes_v_rels_recipe_tags_id_idx" ON "_recipes_v_rels" USING btree ("recipe_tags_id");
  CREATE INDEX "ingredient_nutritions_ingredient_idx" ON "ingredient_nutritions" USING btree ("ingredient_id");
  CREATE INDEX "ingredient_nutritions_updated_at_idx" ON "ingredient_nutritions" USING btree ("updated_at");
  CREATE INDEX "ingredient_nutritions_created_at_idx" ON "ingredient_nutritions" USING btree ("created_at");
  CREATE INDEX "ingredient_nutritions__status_idx" ON "ingredient_nutritions" USING btree ("_status");
  CREATE INDEX "_ingredient_nutritions_v_parent_idx" ON "_ingredient_nutritions_v" USING btree ("parent_id");
  CREATE INDEX "_ingredient_nutritions_v_version_version_ingredient_idx" ON "_ingredient_nutritions_v" USING btree ("version_ingredient_id");
  CREATE INDEX "_ingredient_nutritions_v_version_version_updated_at_idx" ON "_ingredient_nutritions_v" USING btree ("version_updated_at");
  CREATE INDEX "_ingredient_nutritions_v_version_version_created_at_idx" ON "_ingredient_nutritions_v" USING btree ("version_created_at");
  CREATE INDEX "_ingredient_nutritions_v_version_version__status_idx" ON "_ingredient_nutritions_v" USING btree ("version__status");
  CREATE INDEX "_ingredient_nutritions_v_created_at_idx" ON "_ingredient_nutritions_v" USING btree ("created_at");
  CREATE INDEX "_ingredient_nutritions_v_updated_at_idx" ON "_ingredient_nutritions_v" USING btree ("updated_at");
  CREATE INDEX "_ingredient_nutritions_v_snapshot_idx" ON "_ingredient_nutritions_v" USING btree ("snapshot");
  CREATE INDEX "_ingredient_nutritions_v_published_locale_idx" ON "_ingredient_nutritions_v" USING btree ("published_locale");
  CREATE INDEX "_ingredient_nutritions_v_latest_idx" ON "_ingredient_nutritions_v" USING btree ("latest");
  CREATE INDEX "_ingredient_nutritions_v_autosave_idx" ON "_ingredient_nutritions_v" USING btree ("autosave");
  CREATE INDEX "recipe_nutritions_updated_at_idx" ON "recipe_nutritions" USING btree ("updated_at");
  CREATE INDEX "recipe_nutritions_created_at_idx" ON "recipe_nutritions" USING btree ("created_at");
  CREATE INDEX "recipe_nutritions__status_idx" ON "recipe_nutritions" USING btree ("_status");
  CREATE INDEX "_recipe_nutritions_v_parent_idx" ON "_recipe_nutritions_v" USING btree ("parent_id");
  CREATE INDEX "_recipe_nutritions_v_version_version_updated_at_idx" ON "_recipe_nutritions_v" USING btree ("version_updated_at");
  CREATE INDEX "_recipe_nutritions_v_version_version_created_at_idx" ON "_recipe_nutritions_v" USING btree ("version_created_at");
  CREATE INDEX "_recipe_nutritions_v_version_version__status_idx" ON "_recipe_nutritions_v" USING btree ("version__status");
  CREATE INDEX "_recipe_nutritions_v_created_at_idx" ON "_recipe_nutritions_v" USING btree ("created_at");
  CREATE INDEX "_recipe_nutritions_v_updated_at_idx" ON "_recipe_nutritions_v" USING btree ("updated_at");
  CREATE INDEX "_recipe_nutritions_v_snapshot_idx" ON "_recipe_nutritions_v" USING btree ("snapshot");
  CREATE INDEX "_recipe_nutritions_v_published_locale_idx" ON "_recipe_nutritions_v" USING btree ("published_locale");
  CREATE INDEX "_recipe_nutritions_v_latest_idx" ON "_recipe_nutritions_v" USING btree ("latest");
  CREATE INDEX "_recipe_nutritions_v_autosave_idx" ON "_recipe_nutritions_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_countries_id_idx" ON "payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX "payload_locked_documents_rels_ingredient_faq_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredient_faq_id");
  CREATE INDEX "payload_locked_documents_rels_ingredient_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredient_tags_id");
  CREATE INDEX "payload_locked_documents_rels_ingredients_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredients_id");
  CREATE INDEX "payload_locked_documents_rels_recipe_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("recipe_tags_id");
  CREATE INDEX "payload_locked_documents_rels_recipes_id_idx" ON "payload_locked_documents_rels" USING btree ("recipes_id");
  CREATE INDEX "payload_locked_documents_rels_ingredient_nutritions_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredient_nutritions_id");
  CREATE INDEX "payload_locked_documents_rels_recipe_nutritions_id_idx" ON "payload_locked_documents_rels" USING btree ("recipe_nutritions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "countries" CASCADE;
  DROP TABLE "ingredient_faq" CASCADE;
  DROP TABLE "ingredient_tags" CASCADE;
  DROP TABLE "ingredient_tags_locales" CASCADE;
  DROP TABLE "ingredients_faq" CASCADE;
  DROP TABLE "ingredients_faq_locales" CASCADE;
  DROP TABLE "ingredients_video_urls" CASCADE;
  DROP TABLE "ingredients" CASCADE;
  DROP TABLE "ingredients_locales" CASCADE;
  DROP TABLE "ingredients_rels" CASCADE;
  DROP TABLE "_ingredients_v_version_faq" CASCADE;
  DROP TABLE "_ingredients_v_version_faq_locales" CASCADE;
  DROP TABLE "_ingredients_v_version_video_urls" CASCADE;
  DROP TABLE "_ingredients_v" CASCADE;
  DROP TABLE "_ingredients_v_locales" CASCADE;
  DROP TABLE "_ingredients_v_rels" CASCADE;
  DROP TABLE "recipe_tags" CASCADE;
  DROP TABLE "recipe_tags_locales" CASCADE;
  DROP TABLE "recipes_media_youtube_urls" CASCADE;
  DROP TABLE "recipes_ingredients" CASCADE;
  DROP TABLE "recipes_ingredients_locales" CASCADE;
  DROP TABLE "recipes_directions" CASCADE;
  DROP TABLE "recipes_directions_locales" CASCADE;
  DROP TABLE "recipes" CASCADE;
  DROP TABLE "recipes_locales" CASCADE;
  DROP TABLE "recipes_rels" CASCADE;
  DROP TABLE "_recipes_v_version_media_youtube_urls" CASCADE;
  DROP TABLE "_recipes_v_version_ingredients" CASCADE;
  DROP TABLE "_recipes_v_version_ingredients_locales" CASCADE;
  DROP TABLE "_recipes_v_version_directions" CASCADE;
  DROP TABLE "_recipes_v_version_directions_locales" CASCADE;
  DROP TABLE "_recipes_v" CASCADE;
  DROP TABLE "_recipes_v_locales" CASCADE;
  DROP TABLE "_recipes_v_rels" CASCADE;
  DROP TABLE "ingredient_nutritions" CASCADE;
  DROP TABLE "_ingredient_nutritions_v" CASCADE;
  DROP TABLE "recipe_nutritions" CASCADE;
  DROP TABLE "_recipe_nutritions_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_ingredients_status";
  DROP TYPE "public"."enum__ingredients_v_version_status";
  DROP TYPE "public"."enum__ingredients_v_published_locale";
  DROP TYPE "public"."enum_recipes_ingredients_unit";
  DROP TYPE "public"."enum_recipes_status";
  DROP TYPE "public"."enum__recipes_v_version_ingredients_unit";
  DROP TYPE "public"."enum__recipes_v_version_status";
  DROP TYPE "public"."enum__recipes_v_published_locale";
  DROP TYPE "public"."enum_ingredient_nutritions_data_source";
  DROP TYPE "public"."enum_ingredient_nutritions_status";
  DROP TYPE "public"."enum__ingredient_nutritions_v_version_data_source";
  DROP TYPE "public"."enum__ingredient_nutritions_v_version_status";
  DROP TYPE "public"."enum__ingredient_nutritions_v_published_locale";
  DROP TYPE "public"."enum_recipe_nutritions_status";
  DROP TYPE "public"."enum__recipe_nutritions_v_version_status";
  DROP TYPE "public"."enum__recipe_nutritions_v_published_locale";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
