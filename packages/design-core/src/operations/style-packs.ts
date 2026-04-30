import { eq, and, or, isNull, ilike, asc, desc, sql, count } from 'drizzle-orm';
import { stylePacks, styleTokens } from '../db/schema';
import type { Database } from '../db';
import type {
  CreateStylePackInput,
  ListStylePacksInput,
  UpdateStylePackInput,
} from '../validation/style-pack';

/**
 * Generate a URL-friendly slug from a name.
 * Lowercases, replaces spaces with hyphens, strips special characters.
 */
function toSlugBase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique slug, appending -2, -3, etc. for duplicates.
 */
async function generateUniqueSlug(db: Database, name: string): Promise<string> {
  const base = toSlugBase(name);
  let candidate = base;
  let suffix = 1;

  while (true) {
    const [existing] = await db
      .select({ id: stylePacks.id })
      .from(stylePacks)
      .where(eq(stylePacks.slug, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/**
 * Create a new style pack with a unique slug derived from the name.
 */
export async function createStylePack(
  db: Database,
  data: CreateStylePackInput,
  organizationId: string
) {
  const slug = await generateUniqueSlug(db, data.name);

  const [stylePack] = await db
    .insert(stylePacks)
    .values({
      name: data.name,
      slug,
      category: data.category ?? 'general',
      description: data.description,
      version: data.version ?? '1.0.0',
      previewUrl: data.previewUrl,
      isPublic: data.isPublic ?? false,
      organizationId,
    })
    .returning();

  return stylePack;
}

/**
 * Fetch a single style pack by ID, including a count of its tokens.
 */
export async function getStylePack(db: Database, id: string) {
  const [result] = await db
    .select({
      id: stylePacks.id,
      name: stylePacks.name,
      slug: stylePacks.slug,
      category: stylePacks.category,
      description: stylePacks.description,
      version: stylePacks.version,
      previewUrl: stylePacks.previewUrl,
      isPublic: stylePacks.isPublic,
      organizationId: stylePacks.organizationId,
      createdAt: stylePacks.createdAt,
      updatedAt: stylePacks.updatedAt,
      tokenCount: sql<number>`cast(count(${styleTokens.id}) as int)`,
    })
    .from(stylePacks)
    .leftJoin(styleTokens, eq(stylePacks.id, styleTokens.stylePackId))
    .where(eq(stylePacks.id, id))
    .groupBy(stylePacks.id);

  return result ?? null;
}

/**
 * List style packs for an organization with filtering, sorting, and pagination.
 * Returns both the data rows and a total count for pagination metadata.
 */
export async function listStylePacks(
  db: Database,
  organizationId: string,
  filters: ListStylePacksInput
) {
  // Include the user's org-owned packs AND seeded system packs (org_id IS NULL).
  // Without the IS NULL branch, every fresh signup sees an empty list because
  // all 6 seeded packs have organization_id = NULL.
  const orgScope = or(
    eq(stylePacks.organizationId, organizationId),
    isNull(stylePacks.organizationId)
  );
  const conditions = orgScope ? [orgScope] : [];

  if (filters.search) {
    conditions.push(ilike(stylePacks.name, `%${filters.search}%`));
  }

  if (filters.category) {
    conditions.push(eq(stylePacks.category, filters.category));
  }

  const whereClause = and(...conditions);

  const sortColumn =
    filters.sortBy === 'name'
      ? stylePacks.name
      : filters.sortBy === 'updatedAt'
        ? stylePacks.updatedAt
        : stylePacks.createdAt;

  const orderFn = filters.sortOrder === 'asc' ? asc : desc;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(stylePacks)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(filters.limit)
      .offset(filters.offset),
    db.select({ total: count() }).from(stylePacks).where(whereClause),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    data,
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < total,
    },
  };
}

/**
 * Update a style pack's fields. Re-generates the slug if the name changes.
 */
export async function updateStylePack(db: Database, id: string, data: UpdateStylePackInput) {
  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  // Re-generate slug if the name is changing
  if (data.name) {
    updates.slug = await generateUniqueSlug(db, data.name);
  }

  const [updated] = await db
    .update(stylePacks)
    .set(updates)
    .where(eq(stylePacks.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a style pack by ID.
 * Style tokens are cascade-deleted by the FK constraint.
 */
export async function deleteStylePack(db: Database, id: string) {
  const [deleted] = await db.delete(stylePacks).where(eq(stylePacks.id, id)).returning();

  return deleted ?? null;
}
