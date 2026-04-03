import { eq, and, ilike, desc, asc, type SQL } from 'drizzle-orm';
import { stylePacks } from '../schema/style-packs';
import type { Database } from '../index';

export interface StylePackListFilters {
  search?: string;
  category?: string;
  isPublic?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Build a query for listing style packs scoped to an organization.
 * Returns a prepared query — call `.execute()` or pass to `db.execute()`.
 */
export function buildStylePackListQuery(
  db: Database,
  organizationId: string,
  filters: StylePackListFilters = {}
) {
  const conditions: SQL[] = [eq(stylePacks.organizationId, organizationId)];

  if (filters.search) {
    conditions.push(ilike(stylePacks.name, `%${filters.search}%`));
  }

  if (filters.category) {
    conditions.push(eq(stylePacks.category, filters.category));
  }

  if (filters.isPublic !== undefined) {
    conditions.push(eq(stylePacks.isPublic, filters.isPublic));
  }

  const sortColumn =
    filters.sortBy === 'name'
      ? stylePacks.name
      : filters.sortBy === 'updatedAt'
        ? stylePacks.updatedAt
        : stylePacks.createdAt;

  const orderFn = filters.sortOrder === 'asc' ? asc : desc;

  return db
    .select()
    .from(stylePacks)
    .where(and(...conditions))
    .orderBy(orderFn(sortColumn))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

/**
 * Find a single style pack by ID, scoped to an organization.
 */
export function buildStylePackByIdQuery(db: Database, organizationId: string, stylePackId: string) {
  return db
    .select()
    .from(stylePacks)
    .where(and(eq(stylePacks.id, stylePackId), eq(stylePacks.organizationId, organizationId)))
    .limit(1);
}

/**
 * Find a style pack by slug (global uniqueness).
 */
export function buildStylePackBySlugQuery(db: Database, slug: string) {
  return db.select().from(stylePacks).where(eq(stylePacks.slug, slug)).limit(1);
}
