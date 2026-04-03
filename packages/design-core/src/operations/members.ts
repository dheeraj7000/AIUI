import { eq, and } from 'drizzle-orm';
import { organizationMembers } from '../db/schema';
import type { Database } from '../db';
import { canChangeRole, canRemoveMember, type OrgRole } from '../lib/permissions';

/**
 * Update a member's role within an organization.
 * Enforces permission hierarchy: actor can only assign roles below their own level.
 */
export async function updateMemberRole(
  db: Database,
  orgId: string,
  userId: string,
  newRole: OrgRole,
  actorRole: OrgRole
) {
  if (!canChangeRole(actorRole, newRole)) {
    return { error: 'insufficient_permissions' as const };
  }

  // Get the target member to check their current role
  const [target] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId))
    );

  if (!target) {
    return { error: 'member_not_found' as const };
  }

  // Cannot change the owner's role
  if (target.role === 'owner') {
    return { error: 'cannot_modify_owner' as const };
  }

  const [updated] = await db
    .update(organizationMembers)
    .set({ role: newRole })
    .where(eq(organizationMembers.id, target.id))
    .returning();

  return { data: updated };
}

/**
 * Remove a member from an organization.
 * Cannot remove the owner. Actor must have higher role than target.
 */
export async function removeMember(
  db: Database,
  orgId: string,
  userId: string,
  actorRole: OrgRole
) {
  // Get the target member
  const [target] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId))
    );

  if (!target) {
    return { error: 'member_not_found' as const };
  }

  if (target.role === 'owner') {
    return { error: 'cannot_remove_owner' as const };
  }

  if (!canRemoveMember(actorRole, target.role as OrgRole)) {
    return { error: 'insufficient_permissions' as const };
  }

  const [deleted] = await db
    .delete(organizationMembers)
    .where(eq(organizationMembers.id, target.id))
    .returning();

  return { data: deleted };
}
