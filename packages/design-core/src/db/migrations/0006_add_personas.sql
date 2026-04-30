-- Personas: reusable user-perspective definitions attached to a project.
-- Drives critique_for_persona and any future persona-grounded MCP tool.
--
-- Mirrors the studioDraft.shape fields so existing data can be migrated
-- into a default persona row when the user first creates one.

CREATE TABLE IF NOT EXISTS "personas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "name" varchar(120) NOT NULL,
  "audience" text,
  "job_to_be_done" text,
  "emotional_state" text,
  "emotion_after_use" jsonb,
  "brand_personality" jsonb,
  "anti_references" jsonb,
  "constraints" jsonb,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "personas_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint

CREATE INDEX "personas_project_id_idx" ON "personas" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personas_project_name_idx" ON "personas" USING btree ("project_id","name");
