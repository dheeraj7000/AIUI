import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  date,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { apiKeys } from './api-keys';

/**
 * Tracks individual usage events (tool calls, validations, compilations).
 */
export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    toolName: varchar('tool_name', { length: 100 }).notNull(),
    eventType: varchar('event_type', { length: 20 }).notNull(), // tool_call, validation, compilation
    creditsCost: integer('credits_cost').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_usage_org_date').on(table.organizationId, table.createdAt)]
);

/**
 * Monthly credit ledger per organization — tracks usage against tier limits.
 */
export const creditLedger = pgTable(
  'credit_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    creditsUsed: integer('credits_used').notNull().default(0),
    creditsLimit: integer('credits_limit').notNull(),
    tier: varchar('tier', { length: 20 }).notNull(),
  },
  (table) => [uniqueIndex('idx_ledger_org_period').on(table.organizationId, table.periodStart)]
);
