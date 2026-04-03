/**
 * Design profile compiler: takes a project's selections and generates
 * a unified compiled_json document.
 */

import { eq, inArray } from 'drizzle-orm';
import { stylePacks, componentRecipes } from '../db/schema';
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

  return {
    version: currentVersion + 1,
    compiledAt: new Date().toISOString(),
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
  };
}
