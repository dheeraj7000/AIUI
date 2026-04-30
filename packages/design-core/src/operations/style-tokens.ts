import { eq, and, asc, count } from 'drizzle-orm';
import { styleTokens, projects, designProfiles } from '../db/schema';
import type { Database } from '../db';
import type {
  CreateTokenInput,
  UpdateTokenInput,
  ListTokensInput,
} from '../validation/style-token';

/**
 * Mark a project's design profile(s) as needing recompilation.
 * Called whenever a token changes so consumers know cached snapshots are stale.
 */
async function invalidateProfilesForProject(db: Database, projectId: string): Promise<void> {
  await db
    .update(designProfiles)
    .set({ compilationValid: false, updatedAt: new Date() })
    .where(eq(designProfiles.projectId, projectId));
}

/**
 * Create a single token under a project.
 * Throws on duplicate tokenKey within the same project (unique index).
 */
export async function createToken(db: Database, projectId: string, data: CreateTokenInput) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { error: 'project_not_found' as const };
  }

  try {
    const [token] = await db
      .insert(styleTokens)
      .values({
        projectId,
        tokenKey: data.tokenKey,
        tokenType: data.tokenType,
        tokenValue: data.tokenValue,
        description: data.description,
      })
      .returning();

    await invalidateProfilesForProject(db, projectId);

    return { data: token };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('style_tokens_project_key_idx')) {
      return { error: 'duplicate_token_key' as const };
    }
    throw err;
  }
}

export async function getToken(db: Database, tokenId: string, projectId: string) {
  const [token] = await db
    .select()
    .from(styleTokens)
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.projectId, projectId)));

  return token ?? null;
}

export async function listTokens(db: Database, projectId: string, filters: ListTokensInput) {
  const conditions = [eq(styleTokens.projectId, projectId)];

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

export async function updateToken(
  db: Database,
  tokenId: string,
  projectId: string,
  data: UpdateTokenInput
) {
  const [updated] = await db
    .update(styleTokens)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.projectId, projectId)))
    .returning();

  if (updated) {
    await invalidateProfilesForProject(db, projectId);
  }

  return updated ?? null;
}

export async function deleteToken(db: Database, tokenId: string, projectId: string) {
  const [deleted] = await db
    .delete(styleTokens)
    .where(and(eq(styleTokens.id, tokenId), eq(styleTokens.projectId, projectId)))
    .returning();

  if (deleted) {
    await invalidateProfilesForProject(db, projectId);
  }

  return deleted ?? null;
}

export async function bulkImportTokens(
  db: Database,
  projectId: string,
  tokens: CreateTokenInput[]
) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { error: 'project_not_found' as const };
  }

  const existing = await db
    .select({ tokenKey: styleTokens.tokenKey })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, projectId));

  const existingKeys = new Set(existing.map((t) => t.tokenKey));

  const toInsert = tokens.filter((t) => !existingKeys.has(t.tokenKey));
  const skipped = tokens.length - toInsert.length;

  if (toInsert.length > 0) {
    await db.insert(styleTokens).values(
      toInsert.map((t) => ({
        projectId,
        tokenKey: t.tokenKey,
        tokenType: t.tokenType,
        tokenValue: t.tokenValue,
        description: t.description,
      }))
    );

    await invalidateProfilesForProject(db, projectId);
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
 * Export all tokens for a project, grouped by token type.
 * Output: { "color": { "primary": "#000" }, "radius": { "sm": "4px" } }
 */
export async function exportTokens(db: Database, projectId: string) {
  const tokens = await db
    .select()
    .from(styleTokens)
    .where(eq(styleTokens.projectId, projectId))
    .orderBy(asc(styleTokens.tokenKey));

  const grouped: Record<string, Record<string, string>> = {};

  for (const token of tokens) {
    if (!grouped[token.tokenType]) {
      grouped[token.tokenType] = {};
    }
    const shortKey = token.tokenKey.includes('.')
      ? token.tokenKey.substring(token.tokenKey.indexOf('.') + 1)
      : token.tokenKey;
    grouped[token.tokenType][shortKey] = token.tokenValue;
  }

  return grouped;
}
