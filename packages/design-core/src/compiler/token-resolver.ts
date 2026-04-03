/**
 * Token resolver: merges base style pack tokens with profile overrides.
 */

export interface TokenMap {
  [type: string]: {
    [name: string]: string;
  };
}

export interface ResolveResult {
  tokens: TokenMap;
  warnings: string[];
}

/**
 * Resolve tokens by merging base tokens with overrides.
 *
 * @param baseTokens - Grouped tokens from the style pack: { "color": { "primary": "#000" }, ... }
 * @param overrides - Token overrides keyed by full path: { "color.primary": "#FF0000" }
 * @returns Merged token map and any warnings about unknown override keys
 */
export function resolveTokens(
  baseTokens: TokenMap,
  overrides: Record<string, string> = {}
): ResolveResult {
  // Deep clone base tokens
  const merged: TokenMap = {};
  for (const [type, tokens] of Object.entries(baseTokens)) {
    merged[type] = { ...tokens };
  }

  const warnings: string[] = [];

  // Apply overrides
  for (const [fullKey, value] of Object.entries(overrides)) {
    const dotIndex = fullKey.indexOf('.');
    if (dotIndex === -1) {
      warnings.push(`Invalid override key format: "${fullKey}" (expected "type.name")`);
      continue;
    }

    const type = fullKey.substring(0, dotIndex);
    const name = fullKey.substring(dotIndex + 1);

    if (!merged[type]) {
      warnings.push(`Unknown token type in override: "${fullKey}"`);
      continue;
    }

    if (!(name in merged[type])) {
      warnings.push(`Override key "${fullKey}" does not exist in base tokens`);
    }

    // Apply override regardless (allow adding new tokens via overrides)
    merged[type][name] = value;
  }

  return { tokens: merged, warnings };
}
