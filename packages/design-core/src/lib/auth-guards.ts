import { eq, and } from 'drizzle-orm';
import { organizationMembers } from '../db/schema';
import type { Database } from '../db';

/**
 * Check whether a user is a member of the given organization.
 * Returns true if a matching row exists in `organization_members`.
 */
export async function verifyOrgMembership(
  db: Database,
  userId: string,
  orgId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.userId, userId), eq(organizationMembers.organizationId, orgId))
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * Verify that a user has access to a resource by checking membership
 * in the organization that owns the resource.
 *
 * Generic for any resource that carries an `organizationId` column —
 * callers resolve the org id from the resource before calling this.
 */
export async function verifyResourceOwnership(
  db: Database,
  userId: string,
  resourceOrgId: string
): Promise<boolean> {
  return verifyOrgMembership(db, userId, resourceOrgId);
}
