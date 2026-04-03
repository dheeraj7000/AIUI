import { pgTable, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { resourceTypeEnum } from './enums';
import { tags } from './tags';

export const resourceTags = pgTable(
  'resource_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    resourceId: uuid('resource_id').notNull(),
    resourceType: resourceTypeEnum('resource_type').notNull(),
  },
  (table) => [
    uniqueIndex('resource_tags_unique_idx').on(table.tagId, table.resourceId, table.resourceType),
    index('resource_tags_tag_id_idx').on(table.tagId),
    index('resource_tags_resource_id_idx').on(table.resourceId),
  ]
);
