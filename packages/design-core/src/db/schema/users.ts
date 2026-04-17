import { pgTable, uuid, varchar, text, timestamp, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

export interface OnboardingState {
  walkthroughCompletedAt?: string | null;
  walkthroughDismissedAt?: string | null;
  walkthroughSteps?: Record<string, boolean>;
  checklistDismissedAt?: string | null;
  checklistSteps?: {
    pack_browsed?: boolean;
    project_created?: boolean;
    component_added?: boolean;
    api_key_created?: boolean;
  };
}

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),
    cognitoSub: varchar('cognito_sub', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    onboardingState: jsonb('onboarding_state').$type<OnboardingState>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_cognito_sub_idx').on(table.cognitoSub),
  ]
);
