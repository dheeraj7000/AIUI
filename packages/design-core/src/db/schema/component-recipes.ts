import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { componentTypeEnum } from './enums';
import { stylePacks } from './style-packs';

export const componentRecipes = pgTable(
  'component_recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: componentTypeEnum('type').notNull(),
    stylePackId: uuid('style_pack_id').references(() => stylePacks.id, {
      onDelete: 'cascade',
    }),
    previewUrl: text('preview_url'),
    codeTemplate: text('code_template').notNull(),
    jsonSchema: jsonb('json_schema').notNull(),
    aiUsageRules: text('ai_usage_rules'),
    variantsSchema: jsonb('variants_schema'),
    statesSchema: jsonb('states_schema'),
    composedOf: jsonb('composed_of'),
    tier: varchar('tier', { length: 20 }),
    guidelinesJson: jsonb('guidelines_json'),
    organizationId: uuid('organization_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('component_recipes_style_pack_id_idx').on(table.stylePackId),
    index('component_recipes_org_id_idx').on(table.organizationId),
  ]
);
