CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"credits_limit" integer NOT NULL,
	"tier" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_registry_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"style_pack_id" uuid NOT NULL,
	"namespace" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"published_by" uuid NOT NULL,
	"version" varchar(20) DEFAULT '1.0.0' NOT NULL,
	"description" text,
	"downloads" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"ratings_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"organization_id" uuid NOT NULL,
	"tool_name" varchar(100) NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"credits_cost" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_ratings" ADD CONSTRAINT "pack_ratings_pack_registry_id_pack_registry_id_fk" FOREIGN KEY ("pack_registry_id") REFERENCES "public"."pack_registry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_ratings" ADD CONSTRAINT "pack_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_registry" ADD CONSTRAINT "pack_registry_style_pack_id_style_packs_id_fk" FOREIGN KEY ("style_pack_id") REFERENCES "public"."style_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_registry" ADD CONSTRAINT "pack_registry_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_ledger_org_period" ON "credit_ledger" USING btree ("organization_id","period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_rating_pack_user" ON "pack_ratings" USING btree ("pack_registry_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_pack_namespace_slug" ON "pack_registry" USING btree ("namespace","slug");--> statement-breakpoint
CREATE INDEX "idx_pack_downloads" ON "pack_registry" USING btree ("downloads");--> statement-breakpoint
CREATE INDEX "idx_usage_org_date" ON "usage_events" USING btree ("organization_id","created_at");