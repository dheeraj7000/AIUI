-- Additive audit fields for MCP dispatch logging on usage_events.
-- All columns are nullable so existing rows and non-MCP event types (web_write,
-- validation, compilation) remain valid. See
-- apps/mcp-server/src/lib/audit-wrapper.ts for the producer and
-- apps/web/src/app/api/audit-logs/route.ts for the consumer.
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "user_id" uuid;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "project_id" uuid;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "status" varchar(10);--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "duration_ms" integer;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "args_summary" jsonb;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
-- Onboarding state persistence for McpWalkthrough and OnboardingChecklist.
-- See apps/web/src/app/api/onboarding/route.ts.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_state" jsonb;
