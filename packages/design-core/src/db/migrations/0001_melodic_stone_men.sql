CREATE TYPE "public"."invitation_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'button';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'input';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'badge';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'avatar';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'tooltip';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'modal';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'dropdown';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'tabs';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'loader';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'toggle';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'checkbox';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'radio';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'select';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'textarea';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'switch';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'tag';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'alert';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'divider';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'skeleton';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'progress';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'table';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'sidebar';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'layout';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'page-template';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'breadcrumb';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'stepper';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'toolbar';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'accordion';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'dialog';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'popover';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'menu';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'toast';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'font-size';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'font-weight';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'line-height';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'letter-spacing';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'breakpoint';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'z-index';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'opacity';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'border-width';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'animation';--> statement-breakpoint
ALTER TYPE "public"."token_category" ADD VALUE 'transition';--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid,
	"name" varchar(255) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"scopes" jsonb DEFAULT '["mcp:read","mcp:write"]'::jsonb NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "invitation_role" NOT NULL,
	"token" text NOT NULL,
	"invited_by" uuid NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "component_recipes" ADD COLUMN "variants_schema" jsonb;--> statement-breakpoint
ALTER TABLE "component_recipes" ADD COLUMN "states_schema" jsonb;--> statement-breakpoint
ALTER TABLE "component_recipes" ADD COLUMN "composed_of" jsonb;--> statement-breakpoint
ALTER TABLE "component_recipes" ADD COLUMN "tier" varchar(20);--> statement-breakpoint
ALTER TABLE "component_recipes" ADD COLUMN "guidelines_json" jsonb;--> statement-breakpoint
ALTER TABLE "design_profiles" ADD COLUMN "compiled_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "design_profiles" ADD COLUMN "last_compiled_at" timestamp;--> statement-breakpoint
ALTER TABLE "design_profiles" ADD COLUMN "tokens_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "design_profiles" ADD COLUMN "compilation_valid" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "design_profiles" ADD COLUMN "voice_tone_json" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_org_id_idx" ON "api_keys" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_org_email_idx" ON "invitations" USING btree ("org_id","email");--> statement-breakpoint
CREATE INDEX "invitations_org_id_idx" ON "invitations" USING btree ("org_id");