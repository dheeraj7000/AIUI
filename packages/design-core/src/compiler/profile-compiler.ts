/**
 * Design profile compiler: takes a project's selections and generates
 * a unified compiled_json document.
 */

import { createHash } from 'crypto';
import { eq, inArray, asc } from 'drizzle-orm';
import { stylePacks, componentRecipes, styleTokens } from '../db/schema';
import type { Database } from '../db';
import { resolveTokens, type TokenMap } from './token-resolver';
import { exportTokens } from '../operations/style-tokens';

export interface CompiledProfile {
  version: number;
  compiledAt: string;
  stylePack: {
    id: string;
    name: string;
    category: string | null;
  };
  tokens: TokenMap;
  components: Array<{
    id: string;
    name: string;
    type: string;
    codeTemplate: string;
    jsonSchema: unknown;
    aiUsageRules: string | null;
  }>;
  metadata: {
    tokenCount: number;
    componentCount: number;
    overrideCount: number;
    warnings: string[];
  };
  compiledHash: string;
  tokensHash: string;
}

/**
 * Compute a deterministic SHA-256 hash of a token map.
 * Keys are sorted to ensure determinism.
 */
function hashTokenMap(tokenMap: TokenMap): string {
  const sortedOuter = Object.keys(tokenMap).sort();
  const normalized: Record<string, Record<string, string>> = {};
  for (const type of sortedOuter) {
    const sortedInner = Object.keys(tokenMap[type]).sort();
    normalized[type] = {};
    for (const key of sortedInner) {
      normalized[type][key] = tokenMap[type][key];
    }
  }
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

/**
 * Compute the current tokens hash for a style pack directly from the DB.
 * This can be compared against a stored tokensHash to detect staleness.
 */
export async function computeTokensHash(db: Database, stylePackId: string): Promise<string> {
  const tokens = await db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenType: styleTokens.tokenType,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, stylePackId))
    .orderBy(asc(styleTokens.tokenType), asc(styleTokens.tokenKey));

  const grouped: TokenMap = {};
  for (const t of tokens) {
    if (!grouped[t.tokenType]) grouped[t.tokenType] = {};
    const shortKey = t.tokenKey.includes('.')
      ? t.tokenKey.substring(t.tokenKey.indexOf('.') + 1)
      : t.tokenKey;
    grouped[t.tokenType][shortKey] = t.tokenValue;
  }

  return hashTokenMap(grouped);
}

/**
 * Compile a design profile from its selections.
 *
 * @param db - Database connection
 * @param stylePackId - The selected style pack ID
 * @param selectedComponentIds - Array of component recipe IDs
 * @param overridesJson - Token overrides: { "color.primary": "#FF0000" }
 * @param currentVersion - Current version number (will be incremented)
 */
export async function compileProfile(
  db: Database,
  stylePackId: string,
  selectedComponentIds: string[],
  overridesJson: Record<string, string> = {},
  currentVersion: number = 0
): Promise<CompiledProfile> {
  // Fetch style pack
  const [pack] = await db
    .select({
      id: stylePacks.id,
      name: stylePacks.name,
      category: stylePacks.category,
    })
    .from(stylePacks)
    .where(eq(stylePacks.id, stylePackId));

  if (!pack) {
    throw new Error(`Style pack not found: ${stylePackId}`);
  }

  // Fetch base tokens (grouped by type)
  const baseTokens = await exportTokens(db, stylePackId);

  // Resolve tokens with overrides
  const { tokens, warnings } = resolveTokens(baseTokens, overridesJson);

  // Count total tokens
  let tokenCount = 0;
  for (const group of Object.values(tokens)) {
    tokenCount += Object.keys(group).length;
  }

  // Fetch selected component recipes
  const components =
    selectedComponentIds.length > 0
      ? await db
          .select({
            id: componentRecipes.id,
            name: componentRecipes.name,
            type: componentRecipes.type,
            codeTemplate: componentRecipes.codeTemplate,
            jsonSchema: componentRecipes.jsonSchema,
            aiUsageRules: componentRecipes.aiUsageRules,
          })
          .from(componentRecipes)
          .where(inArray(componentRecipes.id, selectedComponentIds))
      : [];

  // Compute hashes for staleness detection
  const tokensHash = hashTokenMap(baseTokens);
  const compiledHash = hashTokenMap(tokens);
  const compiledAt = new Date().toISOString();

  return {
    version: currentVersion + 1,
    compiledAt,
    stylePack: {
      id: pack.id,
      name: pack.name,
      category: pack.category,
    },
    tokens,
    components,
    metadata: {
      tokenCount,
      componentCount: components.length,
      overrideCount: Object.keys(overridesJson).length,
      warnings,
    },
    compiledHash,
    tokensHash,
  };
}
