CREATE TYPE "public"."asset_type" AS ENUM('logo', 'font', 'icon', 'illustration', 'screenshot', 'brand-media');--> statement-breakpoint
CREATE TYPE "public"."component_type" AS ENUM('hero', 'pricing', 'faq', 'footer', 'header', 'cta', 'testimonial', 'feature', 'contact', 'card', 'navigation');--> statement-breakpoint
CREATE TYPE "public"."framework_target" AS ENUM('nextjs-tailwind', 'react-tailwind');--> statement-breakpoint
CREATE TYPE "public"."org_plan" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('style_pack', 'component_recipe', 'asset');--> statement-breakpoint
CREATE TYPE "public"."token_category" AS ENUM('color', 'radius', 'font', 'spacing', 'shadow', 'elevation');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"organization_id" uuid,
	"type" "asset_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"storage_key" text NOT NULL,
	"public_url" text,
	"size_bytes" integer NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" "component_type" NOT NULL,
	"style_pack_id" uuid,
	"preview_url" text,
	"code_template" text NOT NULL,
	"json_schema" jsonb NOT NULL,
	"ai_usage_rules" text,
	"organization_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"style_pack_id" uuid,
	"overrides_json" jsonb,
	"selected_components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"compiled_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"plan" "org_plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"framework_target" "framework_target" DEFAULT 'nextjs-tailwind' NOT NULL,
	"active_style_pack_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_profile_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"bundle_json" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"checksum" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"resource_type" "resource_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "style_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(50) DEFAULT '1.0.0' NOT NULL,
	"preview_url" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "style_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"style_pack_id" uuid NOT NULL,
	"token_key" varchar(255) NOT NULL,
	"token_type" "token_category" NOT NULL,
	"token_value" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"cognito_sub" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_recipes" ADD CONSTRAINT "component_recipes_style_pack_id_style_packs_id_fk" FOREIGN KEY ("style_pack_id") REFERENCES "public"."style_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_profiles" ADD CONSTRAINT "design_profiles_style_pack_id_style_packs_id_fk" FOREIGN KEY ("style_pack_id") REFERENCES "public"."style_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_bundles" ADD CONSTRAINT "prompt_bundles_design_profile_id_design_profiles_id_fk" FOREIGN KEY ("design_profile_id") REFERENCES "public"."design_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "style_tokens" ADD CONSTRAINT "style_tokens_style_pack_id_style_packs_id_fk" FOREIGN KEY ("style_pack_id") REFERENCES "public"."style_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_project_id_idx" ON "assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "assets_org_id_idx" ON "assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "component_recipes_style_pack_id_idx" ON "component_recipes" USING btree ("style_pack_id");--> statement-breakpoint
CREATE INDEX "component_recipes_org_id_idx" ON "component_recipes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "design_profiles_project_id_idx" ON "design_profiles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "design_profiles_style_pack_id_idx" ON "design_profiles" USING btree ("style_pack_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_members_org_user_idx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "org_members_org_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_org_slug_idx" ON "projects" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "projects_org_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "prompt_bundles_design_profile_id_idx" ON "prompt_bundles" USING btree ("design_profile_id");--> statement-breakpoint
CREATE INDEX "prompt_bundles_project_id_idx" ON "prompt_bundles" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_tags_unique_idx" ON "resource_tags" USING btree ("tag_id","resource_id","resource_type");--> statement-breakpoint
CREATE INDEX "resource_tags_tag_id_idx" ON "resource_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "resource_tags_resource_id_idx" ON "resource_tags" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "style_packs_slug_idx" ON "style_packs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "style_packs_org_id_idx" ON "style_packs" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "style_tokens_pack_key_idx" ON "style_tokens" USING btree ("style_pack_id","token_key");--> statement-breakpoint
CREATE INDEX "style_tokens_pack_id_idx" ON "style_tokens" USING btree ("style_pack_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_category_idx" ON "tags" USING btree ("name","category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_cognito_sub_idx" ON "users" USING btree ("cognito_sub");