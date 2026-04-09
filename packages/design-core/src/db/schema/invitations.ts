import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);

export const invitationRoleEnum = pgEnum('invitation_role', ['admin', 'member']);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: invitationRoleEnum('role').notNull(),
    token: text('token').notNull(),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),
    status: invitationStatusEnum('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('invitations_token_idx').on(table.token),
    uniqueIndex('invitations_org_email_idx').on(table.orgId, table.email),
    index('invitations_org_id_idx').on(table.orgId),
    index('invitations_status_expires_idx').on(table.status, table.expiresAt),
  ]
);
