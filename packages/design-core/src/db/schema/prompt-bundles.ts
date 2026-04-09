import { pgTable, uuid, integer, jsonb, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { designProfiles } from './design-profiles';
import { projects } from './projects';

export const promptBundles = pgTable(
  'prompt_bundles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    designProfileId: uuid('design_profile_id')
      .notNull()
      .references(() => designProfiles.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    bundleJson: jsonb('bundle_json').notNull(),
    version: integer('version').default(1).notNull(),
    checksum: varchar('checksum', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('prompt_bundles_design_profile_id_idx').on(table.designProfileId),
    index('prompt_bundles_project_id_idx').on(table.projectId),
    index('prompt_bundles_created_at_idx').on(table.createdAt),
  ]
);
