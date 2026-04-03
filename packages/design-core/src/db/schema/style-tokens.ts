import { pgTable, uuid, varchar, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { tokenCategoryEnum } from './enums';
import { stylePacks } from './style-packs';

export const styleTokens = pgTable(
  'style_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stylePackId: uuid('style_pack_id')
      .notNull()
      .references(() => stylePacks.id, { onDelete: 'cascade' }),
    tokenKey: varchar('token_key', { length: 255 }).notNull(),
    tokenType: tokenCategoryEnum('token_type').notNull(),
    tokenValue: text('token_value').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('style_tokens_pack_key_idx').on(table.stylePackId, table.tokenKey),
    index('style_tokens_pack_id_idx').on(table.stylePackId),
  ]
);
