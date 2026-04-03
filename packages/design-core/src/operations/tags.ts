import { eq, and, ilike, inArray, type SQL } from 'drizzle-orm';
import { tags, resourceTags } from '../db/schema';
import type { Database } from '../db';

/**
 * Normalize a tag name to lowercase.
 */
function normalizeName(name: string): string {
  return name.toLowerCase();
}

// ── Tag CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new tag. Name is normalized to lowercase.
 * The unique index on (name, category) prevents duplicates at the DB level.
 */
export async function createTag(db: Database, name: string, category: string) {
  const normalized = normalizeName(name);

  // Check uniqueness before insert to provide a friendly error
  const [existing] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.name, normalized), eq(tags.category, category)))
    .limit(1);

  if (existing) {
    throw new TagConflictError(`Tag "${normalized}" already exists in category "${category}"`);
  }

  const [tag] = await db.insert(tags).values({ name: normalized, category }).returning();

  return tag;
}

/**
 * Get a single tag by ID.
 */
export async function getTag(db: Database, id: string) {
  const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

  return tag ?? null;
}

/**
 * List tags with optional category filter and name search.
 */
export async function listTags(db: Database, filters: { category?: string; search?: string } = {}) {
  const conditions: SQL[] = [];

  if (filters.category) {
    conditions.push(eq(tags.category, filters.category));
  }

  if (filters.search) {
    conditions.push(ilike(tags.name, `%${filters.search}%`));
  }

  const query = db.select().from(tags);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

/**
 * Delete a tag by ID. Cascade on the FK removes all resource_tags rows.
 */
export async function deleteTag(db: Database, id: string) {
  const [deleted] = await db.delete(tags).where(eq(tags.id, id)).returning();

  return deleted ?? null;
}

// ── Tag Assignment ──────────────────────────────────────────────────────────

/**
 * Assign a tag to a resource. The unique index prevents duplicate assignments.
 */
export async function assignTag(
  db: Database,
  tagId: string,
  resourceId: string,
  resourceType: 'style_pack' | 'component_recipe' | 'asset'
) {
  // Check for duplicate assignment
  const [existing] = await db
    .select()
    .from(resourceTags)
    .where(
      and(
        eq(resourceTags.tagId, tagId),
        eq(resourceTags.resourceId, resourceId),
        eq(resourceTags.resourceType, resourceType)
      )
    )
    .limit(1);

  if (existing) {
    throw new TagConflictError('This tag is already assigned to the resource');
  }

  const [assignment] = await db
    .insert(resourceTags)
    .values({ tagId, resourceId, resourceType })
    .returning();

  return assignment;
}

/**
 * Remove a tag assignment from a resource.
 */
export async function removeTagAssignment(
  db: Database,
  tagId: string,
  resourceId: string,
  resourceType: 'style_pack' | 'component_recipe' | 'asset'
) {
  const [deleted] = await db
    .delete(resourceTags)
    .where(
      and(
        eq(resourceTags.tagId, tagId),
        eq(resourceTags.resourceId, resourceId),
        eq(resourceTags.resourceType, resourceType)
      )
    )
    .returning();

  return deleted ?? null;
}

/**
 * Fetch all tags assigned to a specific resource.
 */
export async function getTagsForResource(
  db: Database,
  resourceId: string,
  resourceType: 'style_pack' | 'component_recipe' | 'asset'
) {
  const rows = await db
    .select({
      id: tags.id,
      name: tags.name,
      category: tags.category,
      assignmentId: resourceTags.id,
    })
    .from(resourceTags)
    .innerJoin(tags, eq(resourceTags.tagId, tags.id))
    .where(
      and(eq(resourceTags.resourceId, resourceId), eq(resourceTags.resourceType, resourceType))
    );

  return rows;
}

/**
 * Fetch resource IDs that have ALL the given tags for a specific resource type.
 */
export async function getResourcesByTag(
  db: Database,
  tagIds: string[],
  resourceType: 'style_pack' | 'component_recipe' | 'asset'
) {
  if (tagIds.length === 0) return [];

  const rows = await db
    .select({ resourceId: resourceTags.resourceId })
    .from(resourceTags)
    .where(and(inArray(resourceTags.tagId, tagIds), eq(resourceTags.resourceType, resourceType)));

  return rows.map((r) => r.resourceId);
}

// ── Error class ─────────────────────────────────────────────────────────────

export class TagConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagConflictError';
  }
}
