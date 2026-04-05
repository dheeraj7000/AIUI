import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { stylePacks } from './style-packs';
import { users } from './users';

/**
 * Published packs in the marketplace — discoverable and installable by anyone.
 */
export const packRegistry = pgTable(
  'pack_registry',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stylePackId: uuid('style_pack_id')
      .notNull()
      .references(() => stylePacks.id, { onDelete: 'cascade' }),
    namespace: varchar('namespace', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    publishedBy: uuid('published_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    version: varchar('version', { length: 20 }).notNull().default('1.0.0'),
    description: text('description'),
    downloads: integer('downloads').notNull().default(0),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('0'),
    ratingsCount: integer('ratings_count').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_pack_namespace_slug').on(table.namespace, table.slug),
    index('idx_pack_downloads').on(table.downloads),
  ]
);

/**
 * User ratings for marketplace packs (one rating per user per pack).
 */
export const packRatings = pgTable(
  'pack_ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    packRegistryId: uuid('pack_registry_id')
      .notNull()
      .references(() => packRegistry.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(), // 1-5
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('idx_rating_pack_user').on(table.packRegistryId, table.userId)]
);
