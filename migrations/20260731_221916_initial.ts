import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_b_content_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum_pages_b_content_link_appearance" AS ENUM('primary', 'arrow');
  CREATE TYPE "public"."enum_pages_b_content_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_news_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_about_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_imggrid_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_games_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_table_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_b_spons_variant" AS ENUM('logos', 'detailed');
  CREATE TYPE "public"."enum_pages_b_spons_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum___pages_v_b_content_v_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum___pages_v_b_content_v_link_appearance" AS ENUM('primary', 'arrow');
  CREATE TYPE "public"."enum___pages_v_b_content_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_news_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_about_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_imggrid_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_games_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_table_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum___pages_v_b_spons_v_variant" AS ENUM('logos', 'detailed');
  CREATE TYPE "public"."enum___pages_v_b_spons_v_section_background" AS ENUM('primary', 'backgroundDark', 'texture', 'textureLight', 'white');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_news_related_cta_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum_news_related_cta_link_appearance" AS ENUM('primary', 'arrow');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_related_cta_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum__news_v_version_related_cta_link_appearance" AS ENUM('primary', 'arrow');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_teams_training_times_day" AS ENUM('mo', 'di', 'mi', 'do', 'fr', 'sa', 'so');
  CREATE TYPE "public"."enum_players_position" AS ENUM('torwart', 'linksaussen', 'rueckraum-links', 'rueckraum-mitte', 'rueckraum-rechts', 'rechtsaussen', 'kreislaeufer');
  CREATE TYPE "public"."enum_games_home_away" AS ENUM('home', 'away');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_navigation_items_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_items_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum_footer_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_member_card_link_type" AS ENUM('none', 'reference', 'custom');
  CREATE TYPE "public"."enum_highlight_banner_type" AS ENUM('game', 'event');
  CREATE TABLE "pages_b_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"subline" varchar,
  	"rich_text" jsonb,
  	"link_type" "enum_pages_b_content_link_type" DEFAULT 'none',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_b_content_link_appearance" DEFAULT 'primary',
  	"section_background" "enum_pages_b_content_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'News',
  	"team_id" integer,
  	"limit" numeric DEFAULT 4,
  	"show_all_link" boolean DEFAULT true,
  	"section_background" "enum_pages_b_news_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Über den Verein',
  	"subline" varchar,
  	"text" varchar,
  	"section_background" "enum_pages_b_about_section_background" DEFAULT 'backgroundDark',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_imggrid_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_b_imggrid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Mehr als Handball',
  	"subline" varchar,
  	"section_background" "enum_pages_b_imggrid_section_background" DEFAULT 'texture',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_games" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Nächste Spiele',
  	"subline" varchar,
  	"team_id" integer,
  	"max_per_column" numeric DEFAULT 3,
  	"active" boolean DEFAULT true,
  	"section_background" "enum_pages_b_games_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"team_id" integer,
  	"headline" varchar,
  	"section_background" "enum_pages_b_table_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_b_spons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Sponsoren',
  	"subline" varchar,
  	"variant" "enum_pages_b_spons_variant" DEFAULT 'logos',
  	"limit" numeric,
  	"section_background" "enum_pages_b_spons_section_background" DEFAULT 'textureLight',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "__pages_v_b_content_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"subline" varchar,
  	"rich_text" jsonb,
  	"link_type" "enum___pages_v_b_content_v_link_type" DEFAULT 'none',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___pages_v_b_content_v_link_appearance" DEFAULT 'primary',
  	"section_background" "enum___pages_v_b_content_v_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_news_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'News',
  	"team_id" integer,
  	"limit" numeric DEFAULT 4,
  	"show_all_link" boolean DEFAULT true,
  	"section_background" "enum___pages_v_b_news_v_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_about_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Über den Verein',
  	"subline" varchar,
  	"text" varchar,
  	"section_background" "enum___pages_v_b_about_v_section_background" DEFAULT 'backgroundDark',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_imggrid_v_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_b_imggrid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Mehr als Handball',
  	"subline" varchar,
  	"section_background" "enum___pages_v_b_imggrid_v_section_background" DEFAULT 'texture',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_games_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Nächste Spiele',
  	"subline" varchar,
  	"team_id" integer,
  	"max_per_column" numeric DEFAULT 3,
  	"active" boolean DEFAULT true,
  	"section_background" "enum___pages_v_b_games_v_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_table_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"team_id" integer,
  	"headline" varchar,
  	"section_background" "enum___pages_v_b_table_v_section_background" DEFAULT 'primary',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_b_spons_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Sponsoren',
  	"subline" varchar,
  	"variant" "enum___pages_v_b_spons_v_variant" DEFAULT 'logos',
  	"limit" numeric,
  	"section_background" "enum___pages_v_b_spons_v_section_background" DEFAULT 'textureLight',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "news_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"category_id" integer,
  	"team_id" integer,
  	"author_name" varchar,
  	"author_role" varchar,
  	"author_avatar_id" integer,
  	"body" jsonb,
  	"related_cta_link_type" "enum_news_related_cta_link_type" DEFAULT 'none',
  	"related_cta_link_new_tab" boolean,
  	"related_cta_link_url" varchar,
  	"related_cta_link_label" varchar,
  	"related_cta_link_appearance" "enum_news_related_cta_link_appearance" DEFAULT 'primary',
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_time" numeric,
  	"manual_reading_time" boolean DEFAULT false,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "_news_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_category_id" integer,
  	"version_team_id" integer,
  	"version_author_name" varchar,
  	"version_author_role" varchar,
  	"version_author_avatar_id" integer,
  	"version_body" jsonb,
  	"version_related_cta_link_type" "enum__news_v_version_related_cta_link_type" DEFAULT 'none',
  	"version_related_cta_link_new_tab" boolean,
  	"version_related_cta_link_url" varchar,
  	"version_related_cta_link_label" varchar,
  	"version_related_cta_link_appearance" "enum__news_v_version_related_cta_link_appearance" DEFAULT 'primary',
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_time" numeric,
  	"version_manual_reading_time" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "news_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "teams_training_times" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_teams_training_times_day" NOT NULL,
  	"time_from" varchar NOT NULL,
  	"time_to" varchar NOT NULL,
  	"location" varchar DEFAULT 'Sporthalle Lauda'
  );
  
  CREATE TABLE "teams_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"liga" varchar,
  	"team_image_id" integer,
  	"team_image_caption" varchar,
  	"introduction_text" varchar,
  	"handball_net_team_id" varchar,
  	"handball_net_tournament_id" varchar,
  	"show_next_games" boolean DEFAULT true,
  	"show_table" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"slug" varchar NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"number" numeric,
  	"position" "enum_players_position",
  	"photo_id" integer,
  	"team_id" integer NOT NULL,
  	"stats_games_played" numeric,
  	"stats_goals" numeric,
  	"stats_two_minutes" numeric,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "games" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"team_id" integer NOT NULL,
  	"home_away" "enum_games_home_away" DEFAULT 'home' NOT NULL,
  	"opponent" varchar NOT NULL,
  	"opponent_logo_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"venue" varchar DEFAULT 'Sporthalle Lauda',
  	"result_score_for" numeric,
  	"result_score_against" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"description" varchar,
  	"website" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
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
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_portrait_url" varchar,
  	"sizes_portrait_width" numeric,
  	"sizes_portrait_height" numeric,
  	"sizes_portrait_mime_type" varchar,
  	"sizes_portrait_filesize" numeric,
  	"sizes_portrait_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
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
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer
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
  	"pages_id" integer,
  	"news_id" integer,
  	"news_categories_id" integer,
  	"teams_id" integer,
  	"players_id" integer,
  	"games_id" integer,
  	"sponsors_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"redirects_id" integer
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
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'ETSV Lauda Handball' NOT NULL,
  	"site_description" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"address_street" varchar,
  	"address_zip" varchar,
  	"address_city" varchar,
  	"social_links_instagram" varchar,
  	"social_links_facebook" varchar,
  	"main_club_url" varchar,
  	"membership_url" varchar,
  	"handball_net_club_id" varchar DEFAULT 'handball4all.baden.570',
  	"logos_logo_id" integer,
  	"logos_logo_inverted_id" integer,
  	"logos_favicon_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_items_children_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_items_link_type" DEFAULT 'none',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_card_image_id" integer,
  	"member_card_pre_headline" varchar DEFAULT 'ETSV Lauda',
  	"member_card_headline" varchar DEFAULT 'Jetzt Mitglied werden',
  	"member_card_link_type" "enum_footer_member_card_link_type" DEFAULT 'none',
  	"member_card_link_new_tab" boolean,
  	"member_card_link_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"news_id" integer,
  	"teams_id" integer
  );
  
  CREATE TABLE "highlight_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT false,
  	"type" "enum_highlight_banner_type" DEFAULT 'game',
  	"game_id" integer,
  	"event_pre_headline" varchar,
  	"event_headline" varchar,
  	"event_date" timestamp(3) with time zone,
  	"event_location" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_b_content" ADD CONSTRAINT "pages_b_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_news" ADD CONSTRAINT "pages_b_news_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_b_news" ADD CONSTRAINT "pages_b_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_about" ADD CONSTRAINT "pages_b_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_imggrid_images" ADD CONSTRAINT "pages_b_imggrid_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_b_imggrid_images" ADD CONSTRAINT "pages_b_imggrid_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_b_imggrid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_imggrid" ADD CONSTRAINT "pages_b_imggrid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_games" ADD CONSTRAINT "pages_b_games_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_b_games" ADD CONSTRAINT "pages_b_games_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_table" ADD CONSTRAINT "pages_b_table_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_b_table" ADD CONSTRAINT "pages_b_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_b_spons" ADD CONSTRAINT "pages_b_spons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_content_v" ADD CONSTRAINT "__pages_v_b_content_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_news_v" ADD CONSTRAINT "__pages_v_b_news_v_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_b_news_v" ADD CONSTRAINT "__pages_v_b_news_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_about_v" ADD CONSTRAINT "__pages_v_b_about_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_imggrid_v_images" ADD CONSTRAINT "__pages_v_b_imggrid_v_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_b_imggrid_v_images" ADD CONSTRAINT "__pages_v_b_imggrid_v_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_b_imggrid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_imggrid_v" ADD CONSTRAINT "__pages_v_b_imggrid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_games_v" ADD CONSTRAINT "__pages_v_b_games_v_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_b_games_v" ADD CONSTRAINT "__pages_v_b_games_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_table_v" ADD CONSTRAINT "__pages_v_b_table_v_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_b_table_v" ADD CONSTRAINT "__pages_v_b_table_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_b_spons_v" ADD CONSTRAINT "__pages_v_b_spons_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_category_id_news_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."news_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_author_avatar_id_media_id_fk" FOREIGN KEY ("author_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_tags" ADD CONSTRAINT "_news_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_category_id_news_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."news_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_team_id_teams_id_fk" FOREIGN KEY ("version_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_author_avatar_id_media_id_fk" FOREIGN KEY ("version_author_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams_training_times" ADD CONSTRAINT "teams_training_times_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams_contacts" ADD CONSTRAINT "teams_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams" ADD CONSTRAINT "teams_team_image_id_media_id_fk" FOREIGN KEY ("team_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teams" ADD CONSTRAINT "teams_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "games" ADD CONSTRAINT "games_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "games" ADD CONSTRAINT "games_opponent_logo_id_media_id_fk" FOREIGN KEY ("opponent_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_categories_fk" FOREIGN KEY ("news_categories_id") REFERENCES "public"."news_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_games_fk" FOREIGN KEY ("games_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logos_logo_id_media_id_fk" FOREIGN KEY ("logos_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logos_logo_inverted_id_media_id_fk" FOREIGN KEY ("logos_logo_inverted_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logos_favicon_id_media_id_fk" FOREIGN KEY ("logos_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_member_card_image_id_media_id_fk" FOREIGN KEY ("member_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "highlight_banner" ADD CONSTRAINT "highlight_banner_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_b_content_order_idx" ON "pages_b_content" USING btree ("_order");
  CREATE INDEX "pages_b_content_parent_id_idx" ON "pages_b_content" USING btree ("_parent_id");
  CREATE INDEX "pages_b_content_path_idx" ON "pages_b_content" USING btree ("_path");
  CREATE INDEX "pages_b_news_order_idx" ON "pages_b_news" USING btree ("_order");
  CREATE INDEX "pages_b_news_parent_id_idx" ON "pages_b_news" USING btree ("_parent_id");
  CREATE INDEX "pages_b_news_path_idx" ON "pages_b_news" USING btree ("_path");
  CREATE INDEX "pages_b_news_team_idx" ON "pages_b_news" USING btree ("team_id");
  CREATE INDEX "pages_b_about_order_idx" ON "pages_b_about" USING btree ("_order");
  CREATE INDEX "pages_b_about_parent_id_idx" ON "pages_b_about" USING btree ("_parent_id");
  CREATE INDEX "pages_b_about_path_idx" ON "pages_b_about" USING btree ("_path");
  CREATE INDEX "pages_b_imggrid_images_order_idx" ON "pages_b_imggrid_images" USING btree ("_order");
  CREATE INDEX "pages_b_imggrid_images_parent_id_idx" ON "pages_b_imggrid_images" USING btree ("_parent_id");
  CREATE INDEX "pages_b_imggrid_images_image_idx" ON "pages_b_imggrid_images" USING btree ("image_id");
  CREATE INDEX "pages_b_imggrid_order_idx" ON "pages_b_imggrid" USING btree ("_order");
  CREATE INDEX "pages_b_imggrid_parent_id_idx" ON "pages_b_imggrid" USING btree ("_parent_id");
  CREATE INDEX "pages_b_imggrid_path_idx" ON "pages_b_imggrid" USING btree ("_path");
  CREATE INDEX "pages_b_games_order_idx" ON "pages_b_games" USING btree ("_order");
  CREATE INDEX "pages_b_games_parent_id_idx" ON "pages_b_games" USING btree ("_parent_id");
  CREATE INDEX "pages_b_games_path_idx" ON "pages_b_games" USING btree ("_path");
  CREATE INDEX "pages_b_games_team_idx" ON "pages_b_games" USING btree ("team_id");
  CREATE INDEX "pages_b_table_order_idx" ON "pages_b_table" USING btree ("_order");
  CREATE INDEX "pages_b_table_parent_id_idx" ON "pages_b_table" USING btree ("_parent_id");
  CREATE INDEX "pages_b_table_path_idx" ON "pages_b_table" USING btree ("_path");
  CREATE INDEX "pages_b_table_team_idx" ON "pages_b_table" USING btree ("team_id");
  CREATE INDEX "pages_b_spons_order_idx" ON "pages_b_spons" USING btree ("_order");
  CREATE INDEX "pages_b_spons_parent_id_idx" ON "pages_b_spons" USING btree ("_parent_id");
  CREATE INDEX "pages_b_spons_path_idx" ON "pages_b_spons" USING btree ("_path");
  CREATE INDEX "pages_title_idx" ON "pages" USING btree ("title");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_news_id_idx" ON "pages_rels" USING btree ("news_id");
  CREATE INDEX "pages_rels_teams_id_idx" ON "pages_rels" USING btree ("teams_id");
  CREATE INDEX "__pages_v_b_content_v_order_idx" ON "__pages_v_b_content_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_content_v_parent_id_idx" ON "__pages_v_b_content_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_content_v_path_idx" ON "__pages_v_b_content_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_news_v_order_idx" ON "__pages_v_b_news_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_news_v_parent_id_idx" ON "__pages_v_b_news_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_news_v_path_idx" ON "__pages_v_b_news_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_news_v_team_idx" ON "__pages_v_b_news_v" USING btree ("team_id");
  CREATE INDEX "__pages_v_b_about_v_order_idx" ON "__pages_v_b_about_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_about_v_parent_id_idx" ON "__pages_v_b_about_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_about_v_path_idx" ON "__pages_v_b_about_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_imggrid_v_images_order_idx" ON "__pages_v_b_imggrid_v_images" USING btree ("_order");
  CREATE INDEX "__pages_v_b_imggrid_v_images_parent_id_idx" ON "__pages_v_b_imggrid_v_images" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_imggrid_v_images_image_idx" ON "__pages_v_b_imggrid_v_images" USING btree ("image_id");
  CREATE INDEX "__pages_v_b_imggrid_v_order_idx" ON "__pages_v_b_imggrid_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_imggrid_v_parent_id_idx" ON "__pages_v_b_imggrid_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_imggrid_v_path_idx" ON "__pages_v_b_imggrid_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_games_v_order_idx" ON "__pages_v_b_games_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_games_v_parent_id_idx" ON "__pages_v_b_games_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_games_v_path_idx" ON "__pages_v_b_games_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_games_v_team_idx" ON "__pages_v_b_games_v" USING btree ("team_id");
  CREATE INDEX "__pages_v_b_table_v_order_idx" ON "__pages_v_b_table_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_table_v_parent_id_idx" ON "__pages_v_b_table_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_table_v_path_idx" ON "__pages_v_b_table_v" USING btree ("_path");
  CREATE INDEX "__pages_v_b_table_v_team_idx" ON "__pages_v_b_table_v" USING btree ("team_id");
  CREATE INDEX "__pages_v_b_spons_v_order_idx" ON "__pages_v_b_spons_v" USING btree ("_order");
  CREATE INDEX "__pages_v_b_spons_v_parent_id_idx" ON "__pages_v_b_spons_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_b_spons_v_path_idx" ON "__pages_v_b_spons_v" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_title_idx" ON "_pages_v" USING btree ("version_title");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_news_id_idx" ON "_pages_v_rels" USING btree ("news_id");
  CREATE INDEX "_pages_v_rels_teams_id_idx" ON "_pages_v_rels" USING btree ("teams_id");
  CREATE INDEX "news_tags_order_idx" ON "news_tags" USING btree ("_order");
  CREATE INDEX "news_tags_parent_id_idx" ON "news_tags" USING btree ("_parent_id");
  CREATE INDEX "news_title_idx" ON "news" USING btree ("title");
  CREATE INDEX "news_cover_image_idx" ON "news" USING btree ("cover_image_id");
  CREATE INDEX "news_category_idx" ON "news" USING btree ("category_id");
  CREATE INDEX "news_team_idx" ON "news" USING btree ("team_id");
  CREATE INDEX "news_author_author_avatar_idx" ON "news" USING btree ("author_avatar_id");
  CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_meta_meta_image_idx" ON "news" USING btree ("meta_image_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "news_rels_order_idx" ON "news_rels" USING btree ("order");
  CREATE INDEX "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
  CREATE INDEX "news_rels_path_idx" ON "news_rels" USING btree ("path");
  CREATE INDEX "news_rels_pages_id_idx" ON "news_rels" USING btree ("pages_id");
  CREATE INDEX "news_rels_news_id_idx" ON "news_rels" USING btree ("news_id");
  CREATE INDEX "news_rels_teams_id_idx" ON "news_rels" USING btree ("teams_id");
  CREATE INDEX "_news_v_version_tags_order_idx" ON "_news_v_version_tags" USING btree ("_order");
  CREATE INDEX "_news_v_version_tags_parent_id_idx" ON "_news_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_title_idx" ON "_news_v" USING btree ("version_title");
  CREATE INDEX "_news_v_version_version_cover_image_idx" ON "_news_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_news_v_version_version_category_idx" ON "_news_v" USING btree ("version_category_id");
  CREATE INDEX "_news_v_version_version_team_idx" ON "_news_v" USING btree ("version_team_id");
  CREATE INDEX "_news_v_version_author_version_author_avatar_idx" ON "_news_v" USING btree ("version_author_avatar_id");
  CREATE INDEX "_news_v_version_version_published_at_idx" ON "_news_v" USING btree ("version_published_at");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_meta_version_meta_image_idx" ON "_news_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "_news_v_rels_order_idx" ON "_news_v_rels" USING btree ("order");
  CREATE INDEX "_news_v_rels_parent_idx" ON "_news_v_rels" USING btree ("parent_id");
  CREATE INDEX "_news_v_rels_path_idx" ON "_news_v_rels" USING btree ("path");
  CREATE INDEX "_news_v_rels_pages_id_idx" ON "_news_v_rels" USING btree ("pages_id");
  CREATE INDEX "_news_v_rels_news_id_idx" ON "_news_v_rels" USING btree ("news_id");
  CREATE INDEX "_news_v_rels_teams_id_idx" ON "_news_v_rels" USING btree ("teams_id");
  CREATE UNIQUE INDEX "news_categories_slug_idx" ON "news_categories" USING btree ("slug");
  CREATE INDEX "news_categories_updated_at_idx" ON "news_categories" USING btree ("updated_at");
  CREATE INDEX "news_categories_created_at_idx" ON "news_categories" USING btree ("created_at");
  CREATE INDEX "teams_training_times_order_idx" ON "teams_training_times" USING btree ("_order");
  CREATE INDEX "teams_training_times_parent_id_idx" ON "teams_training_times" USING btree ("_parent_id");
  CREATE INDEX "teams_contacts_order_idx" ON "teams_contacts" USING btree ("_order");
  CREATE INDEX "teams_contacts_parent_id_idx" ON "teams_contacts" USING btree ("_parent_id");
  CREATE INDEX "teams_name_idx" ON "teams" USING btree ("name");
  CREATE INDEX "teams_team_image_idx" ON "teams" USING btree ("team_image_id");
  CREATE UNIQUE INDEX "teams_slug_idx" ON "teams" USING btree ("slug");
  CREATE INDEX "teams_meta_meta_image_idx" ON "teams" USING btree ("meta_image_id");
  CREATE INDEX "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX "players_photo_idx" ON "players" USING btree ("photo_id");
  CREATE INDEX "players_team_idx" ON "players" USING btree ("team_id");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE INDEX "games_team_idx" ON "games" USING btree ("team_id");
  CREATE INDEX "games_opponent_logo_idx" ON "games" USING btree ("opponent_logo_id");
  CREATE INDEX "games_date_idx" ON "games" USING btree ("date");
  CREATE INDEX "games_updated_at_idx" ON "games" USING btree ("updated_at");
  CREATE INDEX "games_created_at_idx" ON "games" USING btree ("created_at");
  CREATE INDEX "sponsors_logo_idx" ON "sponsors" USING btree ("logo_id");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_news_id_idx" ON "redirects_rels" USING btree ("news_id");
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
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_news_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("news_categories_id");
  CREATE INDEX "payload_locked_documents_rels_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("teams_id");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_games_id_idx" ON "payload_locked_documents_rels" USING btree ("games_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logos_logos_logo_idx" ON "site_settings" USING btree ("logos_logo_id");
  CREATE INDEX "site_settings_logos_logos_logo_inverted_idx" ON "site_settings" USING btree ("logos_logo_inverted_id");
  CREATE INDEX "site_settings_logos_logos_favicon_idx" ON "site_settings" USING btree ("logos_favicon_id");
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_pages_id_idx" ON "navigation_rels" USING btree ("pages_id");
  CREATE INDEX "navigation_rels_news_id_idx" ON "navigation_rels" USING btree ("news_id");
  CREATE INDEX "navigation_rels_teams_id_idx" ON "navigation_rels" USING btree ("teams_id");
  CREATE INDEX "footer_links_order_idx" ON "footer_links" USING btree ("_order");
  CREATE INDEX "footer_links_parent_id_idx" ON "footer_links" USING btree ("_parent_id");
  CREATE INDEX "footer_member_card_member_card_image_idx" ON "footer" USING btree ("member_card_image_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_news_id_idx" ON "footer_rels" USING btree ("news_id");
  CREATE INDEX "footer_rels_teams_id_idx" ON "footer_rels" USING btree ("teams_id");
  CREATE INDEX "highlight_banner_game_idx" ON "highlight_banner" USING btree ("game_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_b_content" CASCADE;
  DROP TABLE "pages_b_news" CASCADE;
  DROP TABLE "pages_b_about" CASCADE;
  DROP TABLE "pages_b_imggrid_images" CASCADE;
  DROP TABLE "pages_b_imggrid" CASCADE;
  DROP TABLE "pages_b_games" CASCADE;
  DROP TABLE "pages_b_table" CASCADE;
  DROP TABLE "pages_b_spons" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "__pages_v_b_content_v" CASCADE;
  DROP TABLE "__pages_v_b_news_v" CASCADE;
  DROP TABLE "__pages_v_b_about_v" CASCADE;
  DROP TABLE "__pages_v_b_imggrid_v_images" CASCADE;
  DROP TABLE "__pages_v_b_imggrid_v" CASCADE;
  DROP TABLE "__pages_v_b_games_v" CASCADE;
  DROP TABLE "__pages_v_b_table_v" CASCADE;
  DROP TABLE "__pages_v_b_spons_v" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "news_tags" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "news_rels" CASCADE;
  DROP TABLE "_news_v_version_tags" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_rels" CASCADE;
  DROP TABLE "news_categories" CASCADE;
  DROP TABLE "teams_training_times" CASCADE;
  DROP TABLE "teams_contacts" CASCADE;
  DROP TABLE "teams" CASCADE;
  DROP TABLE "players" CASCADE;
  DROP TABLE "games" CASCADE;
  DROP TABLE "sponsors" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "footer_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "highlight_banner" CASCADE;
  DROP TYPE "public"."enum_pages_b_content_link_type";
  DROP TYPE "public"."enum_pages_b_content_link_appearance";
  DROP TYPE "public"."enum_pages_b_content_section_background";
  DROP TYPE "public"."enum_pages_b_news_section_background";
  DROP TYPE "public"."enum_pages_b_about_section_background";
  DROP TYPE "public"."enum_pages_b_imggrid_section_background";
  DROP TYPE "public"."enum_pages_b_games_section_background";
  DROP TYPE "public"."enum_pages_b_table_section_background";
  DROP TYPE "public"."enum_pages_b_spons_variant";
  DROP TYPE "public"."enum_pages_b_spons_section_background";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum___pages_v_b_content_v_link_type";
  DROP TYPE "public"."enum___pages_v_b_content_v_link_appearance";
  DROP TYPE "public"."enum___pages_v_b_content_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_news_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_about_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_imggrid_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_games_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_table_v_section_background";
  DROP TYPE "public"."enum___pages_v_b_spons_v_variant";
  DROP TYPE "public"."enum___pages_v_b_spons_v_section_background";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_news_related_cta_link_type";
  DROP TYPE "public"."enum_news_related_cta_link_appearance";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_related_cta_link_type";
  DROP TYPE "public"."enum__news_v_version_related_cta_link_appearance";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_teams_training_times_day";
  DROP TYPE "public"."enum_players_position";
  DROP TYPE "public"."enum_games_home_away";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_navigation_items_children_link_type";
  DROP TYPE "public"."enum_navigation_items_link_type";
  DROP TYPE "public"."enum_footer_links_link_type";
  DROP TYPE "public"."enum_footer_member_card_link_type";
  DROP TYPE "public"."enum_highlight_banner_type";`);
}
