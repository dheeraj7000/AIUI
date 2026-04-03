/**
 * Merges two token maps. Overrides win on conflict.
 *
 * @param base      - The base token map
 * @param overrides - Tokens that override the base
 * @returns A new merged token map
 */
export function mergeTokens(
  base: Record<string, string>,
  overrides: Record<string, string>
): Record<string, string> {
  return { ...base, ...overrides };
}

/**
 * Reduces an array of token maps from left to right,
 * with later maps overriding earlier ones.
 *
 * @param tokenMaps - Ordered list of token maps to merge
 * @returns A single merged token map
 */
export function mergeMultiple(tokenMaps: Record<string, string>[]): Record<string, string> {
  return tokenMaps.reduce<Record<string, string>>((acc, current) => mergeTokens(acc, current), {});
}
