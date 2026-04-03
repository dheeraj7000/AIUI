import { pgTable, uuid, varchar, uniqueIndex } from 'drizzle-orm/pg-core';

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 255 }).notNull(),
  },
  (table) => [uniqueIndex('tags_name_category_idx').on(table.name, table.category)]
);
