import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_matchday_posts_status" AS ENUM('vorschlag', 'freigegeben', 'verworfen');
  CREATE TYPE "public"."enum_matchday_posts_post_type" AS ENUM('heim', 'auswaerts', 'gemischt');
  CREATE TYPE "public"."enum_matchday_posts_variant" AS ENUM('standard', 'bildOverlay');
  CREATE TABLE "matchday_post_games" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"home_team" varchar NOT NULL,
  	"away_team" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar NOT NULL,
  	"venue" varchar,
  	"league" varchar,
  	"is_own_home" boolean DEFAULT true,
  	"source_game_id" varchar
  );
  
  CREATE TABLE "matchday_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_matchday_posts_status" DEFAULT 'vorschlag' NOT NULL,
  	"post_type" "enum_matchday_posts_post_type" DEFAULT 'heim' NOT NULL,
  	"badge_text" varchar,
  	"matchday_date_from" timestamp(3) with time zone,
  	"matchday_date_to" timestamp(3) with time zone,
  	"variant" "enum_matchday_posts_variant" DEFAULT 'standard' NOT NULL,
  	"overlay_image_id" integer,
  	"overlay_title" varchar,
  	"caption" varchar,
  	"source_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "matchday_posts_id" integer;
  ALTER TABLE "matchday_post_games" ADD CONSTRAINT "matchday_post_games_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matchday_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matchday_posts" ADD CONSTRAINT "matchday_posts_overlay_image_id_media_id_fk" FOREIGN KEY ("overlay_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "matchday_post_games_order_idx" ON "matchday_post_games" USING btree ("_order");
  CREATE INDEX "matchday_post_games_parent_id_idx" ON "matchday_post_games" USING btree ("_parent_id");
  CREATE INDEX "matchday_posts_title_idx" ON "matchday_posts" USING btree ("title");
  CREATE INDEX "matchday_posts_status_idx" ON "matchday_posts" USING btree ("status");
  CREATE INDEX "matchday_posts_post_type_idx" ON "matchday_posts" USING btree ("post_type");
  CREATE INDEX "matchday_posts_matchday_matchday_date_from_idx" ON "matchday_posts" USING btree ("matchday_date_from");
  CREATE INDEX "matchday_posts_overlay_image_idx" ON "matchday_posts" USING btree ("overlay_image_id");
  CREATE UNIQUE INDEX "matchday_posts_source_key_idx" ON "matchday_posts" USING btree ("source_key");
  CREATE INDEX "matchday_posts_updated_at_idx" ON "matchday_posts" USING btree ("updated_at");
  CREATE INDEX "matchday_posts_created_at_idx" ON "matchday_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_matchday_posts_fk" FOREIGN KEY ("matchday_posts_id") REFERENCES "public"."matchday_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_matchday_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("matchday_posts_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matchday_post_games" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "matchday_posts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "matchday_post_games" CASCADE;
  DROP TABLE "matchday_posts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_matchday_posts_fk";
  
  DROP INDEX "payload_locked_documents_rels_matchday_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "matchday_posts_id";
  DROP TYPE "public"."enum_matchday_posts_status";
  DROP TYPE "public"."enum_matchday_posts_post_type";
  DROP TYPE "public"."enum_matchday_posts_variant";`);
}
