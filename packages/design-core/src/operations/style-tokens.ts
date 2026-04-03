import { eq, and, asc, count } from 'drizzle-orm';
import { styleTokens, stylePacks, designProfiles } from '../db/schema';
import type { Database } from '../db';
import type {
  CreateTokenInput,
  UpdateTokenInput,
  ListTokensInput,
} from '../validation/style-token';

/**
 * Invalidate all design profiles that reference a given style pack.
 * Sets compilationValid = false so downstream consumers know the
 * compiled profile may be stale.
 */
async function invalidateProfilesForPack(db: Database, stylePackId: string): Promise<void> {
  await db
    .update(designProfiles)
    .set({ compilationValid: false, updatedAt: new Date() })
    .where(eq(designProfiles.stylePackId, stylePackId));
}

/**
 * Create a single style token within a style pack.
 * Throws on duplicate tokenKey within the same pack (unique index).
 */
export async function createToken(db: Database, stylePackId: string, data: CreateTokenInput) {
  // Verify the style pack exists
  const [pack] = await db
    .select({ id: stylePacks.id })
    .from(stylePacks)
    .where(eq(stylePacks.id, stylePackId))
    .limit(1);

  if (!pack) {
    return { error: 'style_pack_not_found' as const };
  }

  try {
    const [token] = await db
      .insert(styleTokens)
      .values({
        stylePackId,
        tokenKey: data.tokenKey,
        tokenType: data.tokenType,
        tokenValue: data.tokenValue,
        description: data.description,
      })
      .returning();

    await invalidateProfilesForPack(db, stylePackId);

    return { data: token };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('style_tokens_pack_key_idx')) {
      return { error: 'duplicate_token_key' as const };
    }
    throw err;
  }
}

/**
 * Fetch a single token by ID, verifying it belongs to the given style pack.
 */
export async function getToken(db: Database, tokenId: string, stylePackId: string) {
  const [token] = await db
    .select()
    .from(styleTokens)
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.stylePackId, stylePackId)));

  return token ?? null;
}

/**
 * List all tokens for a style pack with optional tokenType filter.
 */
export async function listTokens(db: Database, stylePackId: string, filters: ListTokensInput) {
  const conditions = [eq(styleTokens.stylePackId, stylePackId)];

  if (filters.tokenType) {
    conditions.push(eq(styleTokens.tokenType, filters.tokenType));
  }

  const whereClause = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.select().from(styleTokens).where(whereClause).orderBy(asc(styleTokens.tokenKey)),
    db.select({ total: count() }).from(styleTokens).where(whereClause),
  ]);

  return { data, total: totalResult[0]?.total ?? 0 };
}

/**
 * Update a token's value or description.
 */
export async function updateToken(
  db: Database,
  tokenId: string,
  stylePackId: string,
  data: UpdateTokenInput
) {
  const [updated] = await db
    .update(styleTokens)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.stylePackId, stylePackId)))
    .returning();

  if (updated) {
    await invalidateProfilesForPack(db, stylePackId);
  }

  return updated ?? null;
}

/**
 * Delete a token by ID, verifying it belongs to the given style pack.
 */
export async function deleteToken(db: Database, tokenId: string, stylePackId: string) {
  const [deleted] = await db
    .delete(styleTokens)
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.stylePackId, stylePackId)))
    .returning();

  if (deleted) {
    await invalidateProfilesForPack(db, stylePackId);
  }

  return deleted ?? null;
}

/**
 * Bulk import tokens into a style pack, skipping duplicates.
 */
export async function bulkImportTokens(
  db: Database,
  stylePackId: string,
  tokens: CreateTokenInput[]
) {
  // Verify the style pack exists
  const [pack] = await db
    .select({ id: stylePacks.id })
    .from(stylePacks)
    .where(eq(stylePacks.id, stylePackId))
    .limit(1);

  if (!pack) {
    return { error: 'style_pack_not_found' as const };
  }

  // Get existing token keys for this pack
  const existing = await db
    .select({ tokenKey: styleTokens.tokenKey })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, stylePackId));

  const existingKeys = new Set(existing.map((t) => t.tokenKey));

  const toInsert = tokens.filter((t) => !existingKeys.has(t.tokenKey));
  const skipped = tokens.length - toInsert.length;

  if (toInsert.length > 0) {
    await db.insert(styleTokens).values(
      toInsert.map((t) => ({
        stylePackId,
        tokenKey: t.tokenKey,
        tokenType: t.tokenType,
        tokenValue: t.tokenValue,
        description: t.description,
      }))
    );

    await invalidateProfilesForPack(db, stylePackId);
  }

  return {
    data: {
      created: toInsert.length,
      skipped,
      errors: [] as string[],
    },
  };
}

/**
 * Export all tokens grouped by tokenType into structured JSON.
 * Output: { "color": { "primary": "#000" }, "radius": { "sm": "4px" } }
 */
export async function exportTokens(db: Database, stylePackId: string) {
  const tokens = await db
    .select()
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, stylePackId))
    .orderBy(asc(styleTokens.tokenKey));

  const grouped: Record<string, Record<string, string>> = {};

  for (const token of tokens) {
    if (!grouped[token.tokenType]) {
      grouped[token.tokenType] = {};
    }
    // Strip the type prefix from the key: "color.primary" → "primary"
    const shortKey = token.tokenKey.includes('.')
      ? token.tokenKey.substring(token.tokenKey.indexOf('.') + 1)
      : token.tokenKey;
    grouped[token.tokenType][shortKey] = token.tokenValue;
  }

  return grouped;
}
