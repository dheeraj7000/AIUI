/**
 * Role-based access control helpers for organization members.
 */

export type OrgRole = 'owner' | 'admin' | 'member';

/** Numeric hierarchy: higher value = more privilege. */
export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
} as const;

/**
 * Whether the role can manage members (invite, remove, change roles).
 * Allowed: owner, admin.
 */
export function canManageMembers(role: OrgRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

/**
 * Whether the role can delete the organization.
 * Allowed: owner only.
 */
export function canDeleteOrg(role: OrgRole): boolean {
  return role === 'owner';
}

/**
 * Whether the role can update organization settings (name, plan, etc.).
 * Allowed: owner, admin.
 */
export function canUpdateOrg(role: OrgRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

/**
 * Whether the actor can assign a given target role.
 * An actor can only assign roles strictly below their own level.
 */
export function canChangeRole(actorRole: OrgRole, targetRole: OrgRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Whether the actor can remove a member with the given role.
 * An actor can only remove members strictly below their own level.
 */
export function canRemoveMember(actorRole: OrgRole, targetRole: OrgRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}
