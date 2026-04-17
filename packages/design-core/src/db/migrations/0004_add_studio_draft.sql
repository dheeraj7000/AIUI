-- Additive Design Studio draft persistence. Nullable jsonb so existing
-- rows remain valid. Shape is defined in
-- packages/design-core/src/db/schema/projects.ts (StudioDraft):
--   { packId?, selectedComponentIds?, tokenOverrides?, updatedAt }
-- Producer/consumer: apps/web/src/app/api/projects/[id]/studio-draft/route.ts
-- and apps/web/src/app/studio/StudioClient.tsx.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "studio_draft" jsonb;
