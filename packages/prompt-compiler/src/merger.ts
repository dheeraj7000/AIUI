import type { TokenMap, TokenValue, MergedTokenMap, MergeOptions, MergeResult } from './types';
import { tokenMapSchema } from './types';

/**
 * Default tokens injected when `applyDefaults` is true and keys are missing.
 */
export const DEFAULT_TOKENS: TokenMap = {
  'font.heading': 'Inter',
  'font.body': 'Inter',
  'color.primary': '#2563eb',
  'color.background': '#ffffff',
  'color.foreground': '#0f172a',
  'radius.sm': '4px',
  'radius.md': '8px',
  'radius.lg': '16px',
  'spacing.unit': '4px',
  'shadow.sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'shadow.md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  'shadow.lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  'font-size.base': '16px',
  'font-size.sm': '14px',
  'font-size.lg': '18px',
  'font-size.xl': '24px',
  'font-size.2xl': '30px',
  'font-size.3xl': '36px',
  'font-size.4xl': '48px',
  'font-weight.normal': '400',
  'font-weight.medium': '500',
  'font-weight.semibold': '600',
  'font-weight.bold': '700',
  'line-height.tight': '1.25',
  'line-height.normal': '1.5',
  'line-height.relaxed': '1.75',
  'letter-spacing.tight': '-0.025em',
  'letter-spacing.normal': '0em',
  'letter-spacing.wide': '0.025em',
  'breakpoint.sm': '640px',
  'breakpoint.md': '768px',
  'breakpoint.lg': '1024px',
  'breakpoint.xl': '1280px',
  'z-index.dropdown': '1000',
  'z-index.sticky': '1020',
  'z-index.fixed': '1030',
  'z-index.modal-backdrop': '1040',
  'z-index.modal': '1050',
  'z-index.popover': '1060',
  'z-index.tooltip': '1070',
  'opacity.disabled': '0.5',
  'opacity.hover': '0.8',
  'opacity.overlay': '0.75',
  'border-width.thin': '1px',
  'border-width.medium': '2px',
  'border-width.thick': '4px',
  'animation.fast': '150ms',
  'animation.normal': '300ms',
  'animation.slow': '500ms',
  'transition.default': '150ms ease-in-out',
  'transition.slow': '300ms ease-in-out',
};

const REF_PREFIX = '$ref:';
const DEFAULT_MAX_REF_DEPTH = 3;

/**
 * Attempt to coerce a string to a number or boolean if appropriate.
 */
function coerceValue(value: TokenValue): TokenValue {
  if (typeof value !== 'string') return value;
  // Boolean coercion
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Numeric coercion — only pure numeric strings
  const trimmed = value.trim();
  if (trimmed !== '' && !isNaN(Number(trimmed)) && !/\s/.test(trimmed)) {
    // Don't coerce hex colors, CSS values, etc.
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
  }
  return value;
}

/**
 * Resolve $ref:token.path references in a token map.
 * Throws on circular references or unresolvable chains.
 */
function resolveRefs(tokens: TokenMap, maxDepth: number, warnings: string[]): TokenMap {
  const resolved: TokenMap = { ...tokens };
  const resolving = new Set<string>();

  function resolve(key: string, depth: number): TokenValue {
    const value = resolved[key];
    if (typeof value !== 'string' || !value.startsWith(REF_PREFIX)) {
      return value;
    }

    const refPath = value.slice(REF_PREFIX.length);

    if (resolving.has(key)) {
      throw new Error(`Circular $ref detected: "${key}" -> "$ref:${refPath}" forms a cycle`);
    }

    if (depth > maxDepth) {
      throw new Error(`$ref resolution exceeded max depth (${maxDepth}) at key "${key}"`);
    }

    if (!(refPath in resolved)) {
      warnings.push(
        `Unresolvable $ref at "${key}": target "${refPath}" not found; keeping raw value`
      );
      return value;
    }

    resolving.add(key);
    const resolvedValue = resolve(refPath, depth + 1);
    resolving.delete(key);

    resolved[key] = resolvedValue;
    return resolvedValue;
  }

  for (const key of Object.keys(resolved)) {
    const value = resolved[key];
    if (typeof value === 'string' && value.startsWith(REF_PREFIX)) {
      resolve(key, 1);
    }
  }

  return resolved;
}

/**
 * Merge base pack tokens with project overrides, producing a validated MergedTokenMap.
 *
 * Features:
 * - Override precedence: overrides win over base
 * - $ref:token.path resolution with cycle detection
 * - Type coercion (string "12" -> number 12)
 * - Default token injection for missing required keys
 * - Zod validation of the final output
 */
export function mergeTokens(
  basePack: TokenMap,
  overrides: TokenMap,
  options: MergeOptions = {}
): MergeResult {
  const {
    applyDefaults = true,
    strict = false,
    maxRefDepth = DEFAULT_MAX_REF_DEPTH,
    coerceTypes = true,
  } = options;

  const warnings: string[] = [];

  // Strict mode: warn about override keys not in base
  if (strict) {
    for (const key of Object.keys(overrides)) {
      if (!(key in basePack)) {
        warnings.push(`Strict mode: override key "${key}" not found in base tokens`);
      }
    }
  }

  // Step 1: Merge — overrides win
  let merged: TokenMap = { ...basePack, ...overrides };

  // Step 2: Apply defaults for missing required tokens
  if (applyDefaults) {
    for (const [key, value] of Object.entries(DEFAULT_TOKENS)) {
      if (!(key in merged)) {
        merged[key] = value;
        warnings.push(`Default applied for missing token: "${key}"`);
      }
    }
  }

  // Step 3: Resolve $ref references
  merged = resolveRefs(merged, maxRefDepth, warnings);

  // Step 4: Type coercion
  if (coerceTypes) {
    for (const [key, value] of Object.entries(merged)) {
      merged[key] = coerceValue(value);
    }
  }

  // Step 5: Validate with Zod
  const parsed = tokenMapSchema.parse(merged);

  // Brand as MergedTokenMap
  const tokens = parsed as MergedTokenMap;

  return { tokens, warnings };
}
