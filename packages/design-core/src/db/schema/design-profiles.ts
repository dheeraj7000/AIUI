import {
  pgTable,
  uuid,
  varchar,
  integer,
  jsonb,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { stylePacks } from './style-packs';
import { projects } from './projects';

export const designProfiles = pgTable(
  'design_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    version: integer('version').default(1).notNull(),
    stylePackId: uuid('style_pack_id').references(() => stylePacks.id, {
      onDelete: 'cascade',
    }),
    overridesJson: jsonb('overrides_json'),
    selectedComponents: jsonb('selected_components').default([]).notNull(),
    compiledJson: jsonb('compiled_json'),
    compiledHash: varchar('compiled_hash', { length: 64 }),
    lastCompiledAt: timestamp('last_compiled_at'),
    tokensHash: varchar('tokens_hash', { length: 64 }),
    compilationValid: boolean('compilation_valid').default(true).notNull(),
    voiceToneJson: jsonb('voice_tone_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('design_profiles_project_id_idx').on(table.projectId),
    index('design_profiles_style_pack_id_idx').on(table.stylePackId),
    index('design_profiles_created_at_idx').on(table.createdAt),
  ]
);
