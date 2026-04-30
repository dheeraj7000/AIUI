import type { Database } from '@aiui/design-core';
import {
  createProjectWithDefaults,
  ensureUserWorkspace,
  getUserWorkspace,
  projects,
} from '@aiui/design-core';
import { eq } from 'drizzle-orm';

/**
 * Post-signup provisioning: make sure a newly created user has a workspace
 * and one starter project so the dashboard isn't an empty husk.
 *
 * Idempotent — re-running on an existing account is a no-op. This matters
 * for OAuth flows that may re-land on the callback after provisioning.
 */
export interface BootstrapResult {
  organizationId: string;
  projectSlug: string | null;
}

export async function bootstrapNewUser(
  db: Database,
  params: { userId: string; displayName: string }
): Promise<BootstrapResult> {
  const workspaceName = `${params.displayName}'s workspace`;
  const organizationId = await ensureUserWorkspace(db, params.userId, workspaceName);

  // Look up an existing project for the workspace — if one exists we skip
  // the starter-project creation to keep this helper idempotent.
  const [existing] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .limit(1);

  if (existing) {
    return { organizationId, projectSlug: existing.slug };
  }

  // Seed a starter project so the dashboard lands on something useful.
  // Swallow failures — the account still works, the user can hit
  // "New project" from the dashboard to try again.
  try {
    const result = await createProjectWithDefaults(db, {
      orgId: organizationId,
      name: 'My first project',
      description: 'Default project created on signup. Rename or replace anytime.',
      frameworkTarget: 'nextjs-tailwind',
    });
    return { organizationId, projectSlug: result.project.slug };
  } catch (err) {
    console.error('[bootstrap] starter project creation failed:', err);
    return { organizationId, projectSlug: null };
  }
}

export async function ensureBootstrap(
  db: Database,
  params: { userId: string; displayName: string }
): Promise<BootstrapResult> {
  const existing = await getUserWorkspace(db, params.userId);
  if (existing) {
    const [proj] = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.organizationId, existing.organizationId))
      .limit(1);
    return {
      organizationId: existing.organizationId,
      projectSlug: proj?.slug ?? null,
    };
  }
  return bootstrapNewUser(db, params);
}
