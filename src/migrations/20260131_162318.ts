import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ingredients_locales" ADD COLUMN "short_description" varchar;
  ALTER TABLE "_ingredients_v_locales" ADD COLUMN "version_short_description" varchar;
  ALTER TABLE "recipes_locales" ADD COLUMN "short_description" varchar;
  ALTER TABLE "_recipes_v_locales" ADD COLUMN "version_short_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ingredients_locales" DROP COLUMN "short_description";
  ALTER TABLE "_ingredients_v_locales" DROP COLUMN "version_short_description";
  ALTER TABLE "recipes_locales" DROP COLUMN "short_description";
  ALTER TABLE "_recipes_v_locales" DROP COLUMN "version_short_description";`)
}
