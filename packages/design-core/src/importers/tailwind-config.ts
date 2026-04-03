/**
 * Tailwind CSS configuration parser.
 *
 * Extracts design tokens from a Tailwind config's theme / theme.extend object.
 */

import type { ImportResult } from './index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateTokenInput {
  tokenKey: string;
  tokenType: 'color' | 'radius' | 'font' | 'spacing' | 'shadow' | 'elevation';
  tokenValue: string;
  description?: string;
}

type TokenType = CreateTokenInput['tokenType'];

// ---------------------------------------------------------------------------
// Token key pattern
// ---------------------------------------------------------------------------

const TOKEN_KEY_REGEX = /^[a-z]+\.[a-z][a-zA-Z0-9.-]*$/;

// ---------------------------------------------------------------------------
// Tailwind category -> AIUI token type
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, { type: TokenType; prefix: string }> = {
  colors: { type: 'color', prefix: 'color' },
  backgroundColor: { type: 'color', prefix: 'color' },
  textColor: { type: 'color', prefix: 'color' },
  borderColor: { type: 'color', prefix: 'color' },
  fontFamily: { type: 'font', prefix: 'font' },
  fontSize: { type: 'font', prefix: 'font' },
  fontWeight: { type: 'font', prefix: 'font' },
  borderRadius: { type: 'radius', prefix: 'radius' },
  spacing: { type: 'spacing', prefix: 'spacing' },
  gap: { type: 'spacing', prefix: 'spacing' },
  padding: { type: 'spacing', prefix: 'spacing' },
  margin: { type: 'spacing', prefix: 'spacing' },
  boxShadow: { type: 'shadow', prefix: 'shadow' },
  dropShadow: { type: 'shadow', prefix: 'shadow' },
  zIndex: { type: 'elevation', prefix: 'elevation' },
};

// ---------------------------------------------------------------------------
// Key building
// ---------------------------------------------------------------------------

function buildTokenKey(prefix: string, ...pathParts: string[]): string {
  // Flatten and camelCase join
  const segments = pathParts.filter(Boolean);
  if (segments.length === 0) return '';

  const camel = segments
    .map((seg, idx) => {
      // Handle numeric segments like "500" — just append directly
      if (/^\d+$/.test(seg)) return seg;
      const cleaned = seg.replace(/[^a-zA-Z0-9]/g, '');
      const lower = cleaned.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');

  if (!camel) return '';

  const key = `${prefix}.${camel}`;
  if (TOKEN_KEY_REGEX.test(key)) return key;

  const sanitized = key.replace(/[^a-zA-Z0-9.-]/g, '');
  return TOKEN_KEY_REGEX.test(sanitized) ? sanitized : '';
}

/** Ensure number-only spacing/radius values get a px suffix. */
function ensureUnit(value: string, tokenType: TokenType): string {
  if (tokenType === 'spacing' || tokenType === 'radius') {
    const trimmed = value.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return `${trimmed}px`;
    }
  }
  return value;
}

// ---------------------------------------------------------------------------
// JSON extraction from config strings
// ---------------------------------------------------------------------------

/**
 * Try to extract a usable theme object from a Tailwind config string.
 * Supports:
 *   - Raw JSON object
 *   - module.exports = { theme: { ... } }
 *   - export default { theme: { ... } }
 *   - Just the theme.extend or theme portion as JSON
 */
function extractThemeObject(input: string): Record<string, unknown> | null {
  const trimmed = input.trim();

  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Not pure JSON, continue
  }

  // Try to extract the object from a JS config: find the outermost { ... }
  // that likely contains the config
  const firstBrace = trimmed.indexOf('{');
  if (firstBrace === -1) return null;

  // Find the matching closing brace
  let depth = 0;
  let lastBrace = -1;
  for (let i = firstBrace; i < trimmed.length; i++) {
    if (trimmed[i] === '{') depth++;
    else if (trimmed[i] === '}') {
      depth--;
      if (depth === 0) {
        lastBrace = i;
        break;
      }
    }
  }

  if (lastBrace === -1) return null;

  let objectStr = trimmed.slice(firstBrace, lastBrace + 1);

  // Convert JS object literal to JSON:
  // 1. Add quotes around unquoted keys
  // 2. Convert single quotes to double quotes
  // 3. Remove trailing commas
  objectStr = objectStr
    // Convert single-quoted strings to double-quoted
    .replace(/'([^']*?)'/g, '"$1"')
    // Add quotes to unquoted keys (word chars followed by colon)
    .replace(/(?<=[{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '"$1":')
    // Remove trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1');

  try {
    const parsed = JSON.parse(objectStr);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Navigate into the theme object, preferring theme.extend, then theme,
 * then the root if it already looks like a theme.
 */
function resolveTheme(obj: Record<string, unknown>): Record<string, unknown> {
  // Check if it has a theme property
  if (typeof obj['theme'] === 'object' && obj['theme'] !== null) {
    const theme = obj['theme'] as Record<string, unknown>;
    // Prefer extend if present (merge later)
    if (typeof theme['extend'] === 'object' && theme['extend'] !== null) {
      // Merge theme base with extend (extend takes precedence)
      const base = { ...theme };
      delete base['extend'];
      const extend = theme['extend'] as Record<string, unknown>;
      return { ...base, ...extend };
    }
    return theme;
  }

  // Check if it has an extend property directly
  if (typeof obj['extend'] === 'object' && obj['extend'] !== null) {
    return obj['extend'] as Record<string, unknown>;
  }

  // Check if it looks like it IS a theme (has known categories)
  const knownKeys = Object.keys(CATEGORY_MAP);
  const hasKnownCategory = Object.keys(obj).some((k) => knownKeys.includes(k));
  if (hasKnownCategory) return obj;

  return obj;
}

// ---------------------------------------------------------------------------
// Recursive token extraction
// ---------------------------------------------------------------------------

function extractTokensFromCategory(
  value: unknown,
  category: { type: TokenType; prefix: string },
  parentPath: string[],
  tokens: CreateTokenInput[],
  seen: Set<string>,
  warnings: string[]
): void {
  if (value === null || value === undefined) return;

  // String value -> leaf token
  if (typeof value === 'string') {
    const tokenValue = ensureUnit(value, category.type);
    const key = buildTokenKey(category.prefix, ...parentPath);
    if (!key) {
      warnings.push(
        `Could not build valid token key for ${category.prefix}.${parentPath.join('.')}`
      );
      return;
    }
    if (seen.has(key)) return;
    seen.add(key);
    tokens.push({ tokenKey: key, tokenType: category.type, tokenValue });
    return;
  }

  // Number value -> leaf token
  if (typeof value === 'number') {
    const strVal = ensureUnit(String(value), category.type);
    const key = buildTokenKey(category.prefix, ...parentPath);
    if (!key) return;
    if (seen.has(key)) return;
    seen.add(key);
    tokens.push({ tokenKey: key, tokenType: category.type, tokenValue: strVal });
    return;
  }

  // Array value (font families)
  if (Array.isArray(value)) {
    if (category.type === 'font') {
      const familyStr = value.join(', ');
      const key = buildTokenKey(category.prefix, ...parentPath);
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      tokens.push({ tokenKey: key, tokenType: category.type, tokenValue: familyStr });
    } else {
      warnings.push(`Unexpected array value for ${category.prefix}.${parentPath.join('.')}`);
    }
    return;
  }

  // Object value -> recurse into nested keys
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const [childKey, childVal] of Object.entries(obj)) {
      extractTokensFromCategory(
        childVal,
        category,
        [...parentPath, childKey],
        tokens,
        seen,
        warnings
      );
    }
    return;
  }

  warnings.push(`Unexpected value type for ${category.prefix}.${parentPath.join('.')}`);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse a Tailwind CSS configuration and extract design tokens.
 *
 * Accepts either a full Tailwind config file (JS/TS module) or just the
 * theme object as JSON.
 */
export function parseTailwindConfig(input: string): ImportResult {
  const warnings: string[] = [];
  const tokens: CreateTokenInput[] = [];
  const seen = new Set<string>();

  const rootObj = extractThemeObject(input);
  if (!rootObj) {
    warnings.push('Could not parse Tailwind configuration object from input');
    return { tokens: [], stats: {}, warnings, detectedFormat: 'tailwind' };
  }

  const theme = resolveTheme(rootObj);

  // Iterate over known categories
  for (const [categoryKey, mapping] of Object.entries(CATEGORY_MAP)) {
    const categoryValue = theme[categoryKey];
    if (categoryValue === undefined || categoryValue === null) continue;

    if (typeof categoryValue !== 'object' || Array.isArray(categoryValue)) {
      // Top-level non-object (unusual for theme categories)
      extractTokensFromCategory(categoryValue, mapping, [], tokens, seen, warnings);
    } else {
      const obj = categoryValue as Record<string, unknown>;
      for (const [key, val] of Object.entries(obj)) {
        extractTokensFromCategory(val, mapping, [key], tokens, seen, warnings);
      }
    }
  }

  if (tokens.length === 0) {
    warnings.push('No recognizable design tokens found in Tailwind configuration');
  }

  // Build stats
  const stats: Record<string, number> = {};
  for (const token of tokens) {
    stats[token.tokenType] = (stats[token.tokenType] ?? 0) + 1;
  }
  stats['total'] = tokens.length;

  return { tokens, stats, warnings, detectedFormat: 'tailwind' };
}
