import { eq } from 'drizzle-orm';
import { projects, stylePacks, styleTokens } from '../db/schema';
import type { Database } from '../db';
import { resolveTokens, type TokenMap } from '../compiler/token-resolver';

export interface MergedStylePack {
  stylePackId: string;
  stylePackName: string;
  category: string | null;
  baseTokens: TokenMap;
  overrides: Record<string, string>;
  mergedTokens: TokenMap;
  warnings: string[];
}

/**
 * Assign a style pack to a project and optionally store token overrides.
 */
export async function assignStylePack(
  db: Database,
  projectId: string,
  stylePackId: string,
  tokenOverrides?: Record<string, string>
) {
  // Verify style pack exists
  const [pack] = await db
    .select({ id: stylePacks.id, name: stylePacks.name })
    .from(stylePacks)
    .where(eq(stylePacks.id, stylePackId))
    .limit(1);

  if (!pack) {
    throw new StylePackNotFoundError(stylePackId);
  }

  // Update project
  const [updated] = await db
    .update(projects)
    .set({
      activeStylePackId: stylePackId,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    throw new ProjectNotFoundError(projectId);
  }

  return { project: updated, tokenOverrides: tokenOverrides ?? null };
}

/**
 * Get the project's active style pack with merged tokens.
 */
export async function getProjectStylePack(
  db: Database,
  projectId: string,
  tokenOverrides: Record<string, string> = {}
): Promise<MergedStylePack | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

  if (!project || !project.activeStylePackId) return null;

  const [pack] = await db
    .select({ id: stylePacks.id, name: stylePacks.name, category: stylePacks.category })
    .from(stylePacks)
    .where(eq(stylePacks.id, project.activeStylePackId))
    .limit(1);

  if (!pack) return null;

  // Fetch base tokens grouped by type
  const tokens = await db
    .select({
      tokenType: styleTokens.tokenType,
      tokenKey: styleTokens.tokenKey,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, pack.id));

  const baseTokens: TokenMap = {};
  for (const t of tokens) {
    if (!baseTokens[t.tokenType]) baseTokens[t.tokenType] = {};
    baseTokens[t.tokenType][t.tokenKey] = t.tokenValue;
  }

  const { tokens: mergedTokens, warnings } = resolveTokens(baseTokens, tokenOverrides);

  return {
    stylePackId: pack.id,
    stylePackName: pack.name,
    category: pack.category,
    baseTokens,
    overrides: tokenOverrides,
    mergedTokens,
    warnings,
  };
}

export class StylePackNotFoundError extends Error {
  constructor(id: string) {
    super(`Style pack not found: ${id}`);
    this.name = 'StylePackNotFoundError';
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project not found: ${id}`);
    this.name = 'ProjectNotFoundError';
  }
}
