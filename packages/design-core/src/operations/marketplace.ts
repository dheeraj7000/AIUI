import { eq, and, desc, sql } from 'drizzle-orm';
import { packRegistry, packRatings, stylePacks } from '../db/schema';
import type { Database } from '../db';
import type { PublishPackInput, SearchPacksInput } from '../validation/marketplace';

/**
 * Publish a style pack to the marketplace.
 */
export async function publishPack(
  db: Database,
  userId: string,
  input: PublishPackInput
): Promise<{ id: string; namespace: string; slug: string; version: string }> {
  // Get the style pack to derive the slug
  const [pack] = await db
    .select({ slug: stylePacks.slug, version: stylePacks.version })
    .from(stylePacks)
    .where(eq(stylePacks.id, input.stylePackId))
    .limit(1);

  if (!pack) throw new Error('Style pack not found');

  const [entry] = await db
    .insert(packRegistry)
    .values({
      stylePackId: input.stylePackId,
      namespace: input.namespace,
      slug: pack.slug,
      publishedBy: userId,
      version: pack.version ?? '1.0.0',
      description: input.description ?? null,
    })
    .returning({
      id: packRegistry.id,
      namespace: packRegistry.namespace,
      slug: packRegistry.slug,
      version: packRegistry.version,
    });

  return entry;
}

/**
 * Search the marketplace with filters and sorting.
 */
export async function searchPacks(
  db: Database,
  input: SearchPacksInput
): Promise<{
  results: Array<{
    namespace: string;
    slug: string;
    version: string;
    description: string | null;
    downloads: number;
    averageRating: string | null;
    ratingsCount: number;
  }>;
  total: number;
}> {
  let query = db
    .select({
      namespace: packRegistry.namespace,
      slug: packRegistry.slug,
      version: packRegistry.version,
      description: packRegistry.description,
      downloads: packRegistry.downloads,
      averageRating: packRegistry.averageRating,
      ratingsCount: packRegistry.ratingsCount,
    })
    .from(packRegistry)
    .$dynamic();

  // Text search
  if (input.q) {
    const pattern = `%${input.q}%`;
    query = query.where(
      sql`(${packRegistry.slug} ILIKE ${pattern} OR ${packRegistry.description} ILIKE ${pattern})`
    );
  }

  // Sorting
  switch (input.sort) {
    case 'downloads':
      query = query.orderBy(desc(packRegistry.downloads));
      break;
    case 'rating':
      query = query.orderBy(desc(packRegistry.averageRating));
      break;
    case 'newest':
      query = query.orderBy(desc(packRegistry.publishedAt));
      break;
  }

  // Count total before pagination
  const countResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(packRegistry);
  const total = countResult[0]?.count ?? 0;

  // Paginate
  const results = await query.limit(input.limit).offset(input.offset);

  return { results, total };
}

/**
 * Get a marketplace pack by namespace/slug and increment downloads.
 */
export async function getMarketplacePack(
  db: Database,
  namespace: string,
  slug: string
): Promise<{
  namespace: string;
  slug: string;
  version: string;
  description: string | null;
  downloads: number;
  stylePackId: string;
} | null> {
  const [entry] = await db
    .select({
      namespace: packRegistry.namespace,
      slug: packRegistry.slug,
      version: packRegistry.version,
      description: packRegistry.description,
      downloads: packRegistry.downloads,
      stylePackId: packRegistry.stylePackId,
    })
    .from(packRegistry)
    .where(and(eq(packRegistry.namespace, namespace), eq(packRegistry.slug, slug)))
    .limit(1);

  if (!entry) return null;

  // Increment downloads
  await db
    .update(packRegistry)
    .set({ downloads: sql`${packRegistry.downloads} + 1` })
    .where(and(eq(packRegistry.namespace, namespace), eq(packRegistry.slug, slug)));

  return entry;
}

/**
 * Rate a marketplace pack (upsert — one rating per user).
 */
export async function ratePack(
  db: Database,
  userId: string,
  packRegistryId: string,
  score: number
): Promise<void> {
  // Upsert rating
  await db
    .insert(packRatings)
    .values({ packRegistryId, userId, score })
    .onConflictDoUpdate({
      target: [packRatings.packRegistryId, packRatings.userId],
      set: { score },
    });

  // Recalculate average
  const [stats] = await db
    .select({
      avg: sql<string>`round(avg(${packRatings.score}), 2)`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(packRatings)
    .where(eq(packRatings.packRegistryId, packRegistryId));

  await db
    .update(packRegistry)
    .set({
      averageRating: stats.avg ?? '0',
      ratingsCount: stats.count ?? 0,
    })
    .where(eq(packRegistry.id, packRegistryId));
}
