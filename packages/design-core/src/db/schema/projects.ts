import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { frameworkTargetEnum } from './enums';
import { organizations } from './organizations';

/**
 * Shape of the Design Studio draft stored on each project. The client in
 * apps/web/src/app/studio/StudioClient.tsx debounces PUTs to
 * /api/projects/[id]/studio-draft so a closed-tab session can be restored
 * on next open. All fields optional — only `updatedAt` is always written.
 */
export type StudioDraftShape = {
  audience?: string;
  jobToBeDone?: string;
  emotionAfterUse?: string[];
  brandPersonality?: string[];
  antiReferences?: string[];
  updatedAt: string;
};

export type StudioDraft = {
  tokenOverrides?: Record<string, string>;
  // Pre-token discovery interview — see StudioClient.tsx "shape" step.
  // Flows into design-memory.md under `## Intent` via generateDesignMemory.
  shape?: StudioDraftShape;
  updatedAt: string;
};

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    frameworkTarget: frameworkTargetEnum('framework_target').default('nextjs-tailwind').notNull(),
    // Nullable Design Studio draft — see StudioDraft type above.
    studioDraft: jsonb('studio_draft').$type<StudioDraft>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('projects_org_slug_idx').on(table.organizationId, table.slug),
    index('projects_org_id_idx').on(table.organizationId),
  ]
);
