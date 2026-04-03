import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { assetTypeEnum } from './enums';
import { projects } from './projects';

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id'),
    type: assetTypeEnum('type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 500 }).notNull(),
    mimeType: varchar('mime_type', { length: 255 }).notNull(),
    storageKey: text('storage_key').notNull(),
    publicUrl: text('public_url'),
    sizeBytes: integer('size_bytes').notNull(),
    metadataJson: jsonb('metadata_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('assets_project_id_idx').on(table.projectId),
    index('assets_org_id_idx').on(table.organizationId),
  ]
);
