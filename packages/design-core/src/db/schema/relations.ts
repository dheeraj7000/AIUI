import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';
import { organizationMembers } from './organization-members';
import { projects } from './projects';
import { styleTokens } from './style-tokens';
import { assets } from './assets';
import { designProfiles } from './design-profiles';
import { promptBundles } from './prompt-bundles';

// ── Users ──────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  organizationMembers: many(organizationMembers),
}));

// ── Organizations ──────────────────────────────────────────────────────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  assets: many(assets),
}));

// ── Organization Members ───────────────────────────────────────────────────
export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

// ── Projects ───────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  styleTokens: many(styleTokens),
  assets: many(assets),
  designProfiles: many(designProfiles),
  promptBundles: many(promptBundles),
}));

// ── Style Tokens ───────────────────────────────────────────────────────────
export const styleTokensRelations = relations(styleTokens, ({ one }) => ({
  project: one(projects, {
    fields: [styleTokens.projectId],
    references: [projects.id],
  }),
}));

// ── Assets ─────────────────────────────────────────────────────────────────
export const assetsRelations = relations(assets, ({ one }) => ({
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
}));

// ── Design Profiles ────────────────────────────────────────────────────────
export const designProfilesRelations = relations(designProfiles, ({ one, many }) => ({
  project: one(projects, {
    fields: [designProfiles.projectId],
    references: [projects.id],
  }),
  promptBundles: many(promptBundles),
}));

// ── Prompt Bundles ─────────────────────────────────────────────────────────
export const promptBundlesRelations = relations(promptBundles, ({ one }) => ({
  designProfile: one(designProfiles, {
    fields: [promptBundles.designProfileId],
    references: [designProfiles.id],
  }),
  project: one(projects, {
    fields: [promptBundles.projectId],
    references: [projects.id],
  }),
}));
