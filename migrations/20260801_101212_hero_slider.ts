import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_b_hero_item_count" AS ENUM('3', '4', '5');
  CREATE TYPE "public"."enum___pages_v_b_hero_v_item_count" AS ENUM('3', '4', '5');
  CREATE TABLE "pages_b_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_count" "enum_pages_b_hero_item_count" DEFAULT '3',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_hero_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item_count" "enum___pages_v_b_hero_v_item_count" DEFAULT '3',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_b_hero" ADD CONSTRAINT "pages_b_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_hero_v" ADD CONSTRAINT "__pages_v_b_hero_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_b_hero_order_idx" ON "pages_b_hero" USING btree ("_order");
  CREATE INDEX "pages_b_hero_parent_id_idx" ON "pages_b_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_b_hero_path_idx" ON "pages_b_hero" USING btree ("_path");
  CREATE INDEX "__pages_v_b_hero_v_order_idx" ON "__pages_v_b_hero_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_hero_v_parent_id_idx" ON "__pages_v_b_hero_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_hero_v_path_idx" ON "__pages_v_b_hero_v" USING btree ("_path");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_b_hero" CASCADE;
  DROP TABLE "__pages_v_b_hero_v" CASCADE;
  DROP TYPE "public"."enum_pages_b_hero_item_count";
  DROP TYPE "public"."enum___pages_v_b_hero_v_item_count";`);
}
