import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const stylePacks = pgTable(
  'style_packs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    category: varchar('category', { length: 255 }).notNull(),
    description: text('description'),
    version: varchar('version', { length: 50 }).default('1.0.0').notNull(),
    previewUrl: text('preview_url'),
    isPublic: boolean('is_public').default(false).notNull(),
    organizationId: uuid('organization_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('style_packs_slug_idx').on(table.slug),
    index('style_packs_org_id_idx').on(table.organizationId),
  ]
);
