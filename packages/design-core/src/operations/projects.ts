import { eq, and, sql, desc } from 'drizzle-orm';
import { projects } from '../db/schema';
import type { Database } from '../db';
import type { CreateProjectInput, UpdateProjectInput } from '../validation/project';

/**
 * Generate a deterministic URL-safe slug from a name.
 * Lowercase, hyphens for spaces, no special chars, no random suffix.
 */
export function generateProjectSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Find a unique slug within an organization by appending -2, -3, etc. on collision.
 */
async function findUniqueSlug(db: Database, orgId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.organizationId, orgId), eq(projects.slug, slug)))
      .limit(1);

    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

/**
 * Create a new project with an auto-generated, collision-safe slug.
 */
export async function createProject(db: Database, input: CreateProjectInput) {
  const baseSlug = generateProjectSlug(input.name);
  const slug = await findUniqueSlug(db, input.orgId, baseSlug);

  const [project] = await db
    .insert(projects)
    .values({
      organizationId: input.orgId,
      name: input.name,
      slug,
      description: input.description,
      frameworkTarget: input.frameworkTarget,
    })
    .returning();

  return project;
}

/**
 * Fetch a single project by ID.
 */
export async function getProjectById(db: Database, id: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

  return project ?? null;
}

/**
 * List projects for an organization with pagination.
 */
export async function listProjects(
  db: Database,
  params: { orgId: string; limit?: number; offset?: number }
) {
  const { orgId, limit = 50, offset = 0 } = params;

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(projects)
    .where(eq(projects.organizationId, orgId));

  const total = countResult?.count ?? 0;

  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, orgId))
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return { projects: projectList, total };
}

/**
 * Update a project. If name changes, regenerate slug with collision handling.
 */
export async function updateProject(db: Database, id: string, data: UpdateProjectInput) {
  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  // If name is changing, regenerate slug
  if (data.name) {
    const [existing] = await db
      .select({ organizationId: projects.organizationId })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (existing) {
      const baseSlug = generateProjectSlug(data.name);
      updates.slug = await findUniqueSlug(db, existing.organizationId, baseSlug);
    }
  }

  const [updated] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();

  return updated ?? null;
}

/**
 * Delete a project by ID.
 */
export async function deleteProject(db: Database, id: string) {
  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();

  return deleted ?? null;
}
