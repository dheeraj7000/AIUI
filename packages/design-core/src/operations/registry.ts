import { eq } from 'drizzle-orm';
import { stylePacks, styleTokens, componentRecipes } from '../db/schema';
import type { Database } from '../db';
import type { RegistryItem, RegistryIndexItem } from '../validation/registry';

/**
 * Serialize a style pack into a RegistryItem for the registry API.
 * Fetches the pack, its tokens, and associated component slugs.
 */
export async function serializePackForRegistry(
  db: Database,
  slug: string
): Promise<RegistryItem | null> {
  const [pack] = await db
    .select({
      id: stylePacks.id,
      name: stylePacks.name,
      slug: stylePacks.slug,
      version: stylePacks.version,
      category: stylePacks.category,
      description: stylePacks.description,
    })
    .from(stylePacks)
    .where(eq(stylePacks.slug, slug))
    .limit(1);

  if (!pack) return null;

  const tokens = await db
    .select({
      key: styleTokens.tokenKey,
      type: styleTokens.tokenType,
      value: styleTokens.tokenValue,
      description: styleTokens.description,
    })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, pack.id));

  const components = await db
    .select({ slug: componentRecipes.slug })
    .from(componentRecipes)
    .where(eq(componentRecipes.stylePackId, pack.id));

  return {
    name: pack.name,
    slug: pack.slug,
    version: pack.version ?? '1.0.0',
    category: pack.category ?? 'custom',
    description: pack.description ?? '',
    tokenCount: tokens.length,
    componentCount: components.length,
    tokens: tokens.map((t) => ({
      key: t.key,
      type: t.type,
      value: t.value,
      ...(t.description ? { description: t.description } : {}),
    })),
    componentSlugs: components.map((c) => c.slug),
  };
}

/**
 * Get all public packs as lightweight index items (no tokens).
 */
export async function getRegistryIndex(db: Database): Promise<RegistryIndexItem[]> {
  const packs = await db
    .select({
      id: stylePacks.id,
      name: stylePacks.name,
      slug: stylePacks.slug,
      version: stylePacks.version,
      category: stylePacks.category,
      description: stylePacks.description,
    })
    .from(stylePacks)
    .where(eq(stylePacks.isPublic, true));

  const results: RegistryIndexItem[] = [];

  for (const pack of packs) {
    const [tokenResult] = await db
      .select({ count: styleTokens.id })
      .from(styleTokens)
      .where(eq(styleTokens.stylePackId, pack.id));

    const [componentResult] = await db
      .select({ count: componentRecipes.id })
      .from(componentRecipes)
      .where(eq(componentRecipes.stylePackId, pack.id));

    results.push({
      name: pack.name,
      slug: pack.slug,
      version: pack.version ?? '1.0.0',
      category: pack.category ?? 'custom',
      description: pack.description ?? '',
      tokenCount: tokenResult ? 1 : 0, // Will be overridden below
      componentCount: componentResult ? 1 : 0,
    });
  }

  // Fix counts with proper aggregation
  for (const item of results) {
    const pack = packs.find((p) => p.slug === item.slug);
    if (!pack) continue;

    const tokens = await db
      .select({ id: styleTokens.id })
      .from(styleTokens)
      .where(eq(styleTokens.stylePackId, pack.id));

    const components = await db
      .select({ id: componentRecipes.id })
      .from(componentRecipes)
      .where(eq(componentRecipes.stylePackId, pack.id));

    item.tokenCount = tokens.length;
    item.componentCount = components.length;
  }

  return results;
}
