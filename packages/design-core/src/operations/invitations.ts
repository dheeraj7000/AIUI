import { eq, and } from 'drizzle-orm';
import { organizationMembers } from '../db/schema';
import type { Database } from '../db';

// We need to import the invitations table — it will be created alongside this file
// and exported from schema/index.ts
import { invitations } from '../db/schema/invitations';

/**
 * Create a new invitation with a 7-day expiry.
 */
export async function createInvitation(
  db: Database,
  orgId: string,
  email: string,
  role: 'admin' | 'member',
  invitedBy: string
) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    const [invitation] = await db
      .insert(invitations)
      .values({
        orgId,
        email: email.toLowerCase(),
        role,
        token,
        invitedBy,
        status: 'pending',
        expiresAt,
      })
      .returning();

    return { data: invitation };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('invitations_org_email_idx')) {
      return { error: 'duplicate_invitation' as const };
    }
    throw err;
  }
}

/**
 * Accept an invitation: validate token/expiry, add member to org, mark accepted.
 */
export async function acceptInvitation(db: Database, token: string, userId: string) {
  const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token));

  if (!invitation) {
    return { error: 'not_found' as const };
  }

  if (invitation.status !== 'pending') {
    return { error: 'already_used' as const };
  }

  if (new Date() > invitation.expiresAt) {
    // Mark as expired
    await db
      .update(invitations)
      .set({ status: 'expired' })
      .where(eq(invitations.id, invitation.id));
    return { error: 'expired' as const };
  }

  // Transaction: add member + mark invitation accepted
  await db.transaction(async (tx) => {
    await tx.insert(organizationMembers).values({
      organizationId: invitation.orgId,
      userId,
      role: invitation.role,
    });

    await tx
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));
  });

  return { data: invitation };
}

/**
 * List pending invitations for an organization.
 */
export async function listPendingInvitations(db: Database, orgId: string) {
  return db
    .select()
    .from(invitations)
    .where(and(eq(invitations.orgId, orgId), eq(invitations.status, 'pending')));
}

/**
 * Revoke a pending invitation.
 */
export async function revokeInvitation(db: Database, invitationId: string) {
  const [updated] = await db
    .update(invitations)
    .set({ status: 'revoked' })
    .where(and(eq(invitations.id, invitationId), eq(invitations.status, 'pending')))
    .returning();

  return updated ?? null;
}
