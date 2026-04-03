import { eq, sql } from 'drizzle-orm';
import { organizations, organizationMembers } from '../db/schema';
import type { Database } from '../db';

/**
 * Generate a URL-friendly slug from a name.
 * Lowercases, replaces spaces with hyphens, strips special characters,
 * and appends a short random suffix for uniqueness.
 */
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Create a new organization and add the owner as an 'owner' member in a single transaction.
 */
export async function createOrganization(db: Database, input: { name: string; ownerId: string }) {
  const slug = generateSlug(input.name);

  const result = await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({
        name: input.name,
        slug,
      })
      .returning();

    await tx.insert(organizationMembers).values({
      organizationId: org.id,
      userId: input.ownerId,
      role: 'owner',
    });

    return org;
  });

  return result;
}

/**
 * Fetch a single organization by ID, including its member count.
 */
export async function getOrganization(db: Database, orgId: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      memberCount: sql<number>`cast(count(${organizationMembers.id}) as int)`,
    })
    .from(organizations)
    .leftJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizations.id, orgId))
    .groupBy(organizations.id);

  return org ?? null;
}

/**
 * List all organizations where a user is a member.
 */
export async function listUserOrganizations(db: Database, userId: string) {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));

  return rows;
}

/**
 * Update an organization's name and/or plan.
 */
export async function updateOrganization(
  db: Database,
  orgId: string,
  data: { name?: string; plan?: 'free' | 'pro' | 'enterprise' }
) {
  const [updated] = await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId))
    .returning();

  return updated ?? null;
}

/**
 * Delete an organization by ID.
 * Organization members are cascade-deleted by the FK constraint.
 */
export async function deleteOrganization(db: Database, orgId: string) {
  const [deleted] = await db.delete(organizations).where(eq(organizations.id, orgId)).returning();

  return deleted ?? null;
}
