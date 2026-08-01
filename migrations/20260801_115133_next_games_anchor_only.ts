import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_b_games" DROP COLUMN "section_background";
  ALTER TABLE "__pages_v_b_games_v" DROP COLUMN "section_background";
  DROP TYPE "public"."enum_pages_b_games_section_background";
  DROP TYPE "public"."enum___pages_v_b_games_v_section_background";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_b_games_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_games_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  ALTER TABLE "pages_b_games" ADD COLUMN "section_background" "enum_pages_b_games_section_background" DEFAULT 'primary';
  ALTER TABLE "__pages_v_b_games_v" ADD COLUMN "section_background" "enum___pages_v_b_games_v_section_background" DEFAULT 'primary';`)
}
