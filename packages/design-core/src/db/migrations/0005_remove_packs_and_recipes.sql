-- Scope cut: drop the entire style-pack and component-recipe surface.
-- Tokens become project-scoped (style_tokens.project_id -> projects.id).
--
-- Destructive: any data in style_packs, component_recipes, and existing
-- style_tokens rows is lost. The seeded packs/recipes are gone (no more
-- seed script), and a fresh project is now seeded with the inline default
-- token set in @aiui/design-core (DEFAULT_PROJECT_TOKENS) at init time.

-- 1. Drop FK columns on dependent tables before dropping their parents.
ALTER TABLE "design_profiles" DROP COLUMN IF EXISTS "style_pack_id";--> statement-breakpoint
ALTER TABLE "design_profiles" DROP COLUMN IF EXISTS "selected_components";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "active_style_pack_id";--> statement-breakpoint

-- 2. Wipe the old style_tokens table (its FK pointed at style_packs which
--    is being dropped). Re-create it scoped to projects.
DROP TABLE IF EXISTS "style_tokens" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "component_recipes" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "style_packs" CASCADE;--> statement-breakpoint

CREATE TABLE "style_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "token_key" varchar(255) NOT NULL,
  "token_type" "token_category" NOT NULL,
  "token_value" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "style_tokens_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX "style_tokens_project_key_idx" ON "style_tokens" USING btree ("project_id","token_key");--> statement-breakpoint
CREATE INDEX "style_tokens_project_id_idx" ON "style_tokens" USING btree ("project_id");
