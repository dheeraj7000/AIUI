import { pgTable, uuid, varchar, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { stylePacks } from './style-packs';

export const designProfiles = pgTable(
  'design_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    version: integer('version').default(1).notNull(),
    stylePackId: uuid('style_pack_id').references(() => stylePacks.id, {
      onDelete: 'cascade',
    }),
    overridesJson: jsonb('overrides_json'),
    selectedComponents: jsonb('selected_components').default([]).notNull(),
    compiledJson: jsonb('compiled_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('design_profiles_project_id_idx').on(table.projectId),
    index('design_profiles_style_pack_id_idx').on(table.stylePackId),
  ]
);
