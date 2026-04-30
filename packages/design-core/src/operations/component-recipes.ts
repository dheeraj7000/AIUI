import { eq, and, or, isNull, ilike, desc, count } from 'drizzle-orm';
import { componentRecipes, stylePacks } from '../db/schema';
import type { Database } from '../db';
import type {
  CreateRecipeInput,
  ListRecipesInput,
  UpdateRecipeInput,
} from '../validation/component-recipe';

/**
 * Generate a URL-friendly slug from a name.
 * Lowercases, replaces spaces with hyphens, strips special characters,
 * and deduplicates consecutive hyphens.
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
      .select({ id: componentRecipes.id })
      .from(componentRecipes)
      .where(eq(componentRecipes.slug, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/**
 * Create a new component recipe with a unique slug derived from the name.
 */
export async function createRecipe(db: Database, data: CreateRecipeInput, organizationId: string) {
  const slug = await generateUniqueSlug(db, data.name);

  const [recipe] = await db
    .insert(componentRecipes)
    .values({
      name: data.name,
      slug,
      type: data.type,
      stylePackId: data.stylePackId,
      codeTemplate: data.codeTemplate,
      jsonSchema: data.jsonSchema,
      aiUsageRules: data.aiUsageRules,
      organizationId,
    })
    .returning();

  return recipe;
}

/**
 * Fetch a single component recipe by ID, including the style pack name.
 */
export async function getRecipe(db: Database, id: string) {
  const [result] = await db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      slug: componentRecipes.slug,
      type: componentRecipes.type,
      stylePackId: componentRecipes.stylePackId,
      previewUrl: componentRecipes.previewUrl,
      codeTemplate: componentRecipes.codeTemplate,
      jsonSchema: componentRecipes.jsonSchema,
      aiUsageRules: componentRecipes.aiUsageRules,
      organizationId: componentRecipes.organizationId,
      createdAt: componentRecipes.createdAt,
      updatedAt: componentRecipes.updatedAt,
      stylePackName: stylePacks.name,
    })
    .from(componentRecipes)
    .leftJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
    .where(eq(componentRecipes.id, id));

  return result ?? null;
}

/**
 * List component recipes for an organization with filtering and pagination.
 * Returns both the data rows and a total count for pagination metadata.
 */
export async function listRecipes(db: Database, organizationId: string, filters: ListRecipesInput) {
  // Include the user's org-owned recipes AND seeded system recipes (org_id IS NULL).
  // Without the IS NULL branch, every fresh signup sees an empty list because
  // all 57 seeded recipes have organization_id = NULL.
  const orgScope = or(
    eq(componentRecipes.organizationId, organizationId),
    isNull(componentRecipes.organizationId)
  );
  const conditions = orgScope ? [orgScope] : [];

  if (filters.search) {
    conditions.push(ilike(componentRecipes.name, `%${filters.search}%`));
  }

  if (filters.type) {
    conditions.push(eq(componentRecipes.type, filters.type));
  }

  if (filters.stylePackId) {
    conditions.push(eq(componentRecipes.stylePackId, filters.stylePackId));
  }

  const whereClause = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(componentRecipes)
      .where(whereClause)
      .orderBy(desc(componentRecipes.createdAt))
      .limit(filters.limit)
      .offset(filters.offset),
    db.select({ total: count() }).from(componentRecipes).where(whereClause),
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
 * Update a component recipe's fields. Re-generates the slug if the name changes.
 */
export async function updateRecipe(db: Database, id: string, data: UpdateRecipeInput) {
  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  // Re-generate slug if the name is changing
  if (data.name) {
    updates.slug = await generateUniqueSlug(db, data.name);
  }

  const [updated] = await db
    .update(componentRecipes)
    .set(updates)
    .where(eq(componentRecipes.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a component recipe by ID.
 */
export async function deleteRecipe(db: Database, id: string) {
  const [deleted] = await db
    .delete(componentRecipes)
    .where(eq(componentRecipes.id, id))
    .returning();

  return deleted ?? null;
}
