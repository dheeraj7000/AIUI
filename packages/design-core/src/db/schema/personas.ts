import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';

/**
 * A reusable user persona attached to a project. Drives `critique_for_persona`
 * (and any future persona-grounded tool) so a single project can carry
 * multiple personas — e.g. "free user", "paid admin", "novice", "power user".
 *
 * `isDefault = true` marks one persona per project as the fallback when a
 * caller doesn't pass an explicit personaId.
 *
 * The fields mirror `studioDraft.shape` so existing shape data can be
 * migrated to a persona row when the user creates their first one.
 */
export const personas = pgTable(
  'personas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    audience: text('audience'),
    jobToBeDone: text('job_to_be_done'),
    emotionalState: text('emotional_state'),
    /** Project's desired emotion AFTER the user uses the surface. */
    emotionAfterUse: jsonb('emotion_after_use').$type<string[]>(),
    /** Brand voice descriptors (e.g. ["confident", "warm", "no-nonsense"]). */
    brandPersonality: jsonb('brand_personality').$type<string[]>(),
    /** Designs / brands the project explicitly wants NOT to feel like. */
    antiReferences: jsonb('anti_references').$type<string[]>(),
    /** Hard constraints (e.g. ["screen reader", "low bandwidth", "5-second decision"]). */
    constraints: jsonb('constraints').$type<string[]>(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('personas_project_id_idx').on(table.projectId),
    uniqueIndex('personas_project_name_idx').on(table.projectId, table.name),
  ]
);
