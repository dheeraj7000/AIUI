import { eq, sql } from 'drizzle-orm';
import type { Database } from '../db';
import { organizations, organizationMembers } from '../db/schema';

/**
 * Fetch the workspace row for display (name, createdAt).
 */
export async function getOrganization(db: Database, orgId: string) {
  const [row] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  return row ?? null;
}

/**
 * Look up the single workspace this user owns. Returns null if the user
 * hasn't been provisioned yet (pre-signup or signup race).
 */
export async function getUserWorkspace(db: Database, userId: string) {
  const [row] = await db
    .select({
      organizationId: organizationMembers.organizationId,
      name: organizations.name,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId))
    .limit(1);
  return row ?? null;
}

/**
 * Idempotent: make sure the user has a personal workspace. Called from
 * signup (and any code path that must tolerate a missing workspace).
 * Returns the organizationId.
 */
export async function ensureUserWorkspace(
  db: Database,
  userId: string,
  name = 'Personal workspace'
): Promise<string> {
  const existing = await getUserWorkspace(db, userId);
  if (existing) return existing.organizationId;

  const slug = `workspace-${userId.slice(0, 8)}`;
  return db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({ name, slug, createdAt: sql`now()` })
      .returning({ id: organizations.id });
    await tx.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'owner',
    });
    return org.id;
  });
}
