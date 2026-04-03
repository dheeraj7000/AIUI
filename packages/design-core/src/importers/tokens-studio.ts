/**
 * Tokens Studio (formerly Figma Tokens) JSON parser.
 *
 * Supports both nested and flat JSON formats exported by Tokens Studio.
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

/** A single Tokens Studio token leaf node. */
interface TokensStudioLeaf {
  value: string | number | Record<string, unknown>;
  type: string;
  description?: string;
}

/** Recursive structure for nested format. */
type TokensStudioNode = TokensStudioLeaf | { [key: string]: TokensStudioNode }; // eslint-disable-line @typescript-eslint/no-unused-vars

// ---------------------------------------------------------------------------
// Token key pattern
// ---------------------------------------------------------------------------

const TOKEN_KEY_REGEX = /^[a-z]+\.[a-z][a-zA-Z0-9.-]*$/;

// ---------------------------------------------------------------------------
// Type mapping: Tokens Studio type -> AIUI token type
// ---------------------------------------------------------------------------

const TYPE_MAP: Record<string, TokenType> = {
  color: 'color',
  spacing: 'spacing',
  borderRadius: 'radius',
  borderradius: 'radius',
  'border-radius': 'radius',
  fontFamilies: 'font',
  fontfamilies: 'font',
  fontFamily: 'font',
  fontfamily: 'font',
  'font-family': 'font',
  boxShadow: 'shadow',
  boxshadow: 'shadow',
  'box-shadow': 'shadow',
  sizing: 'spacing',
  dimension: 'spacing',
  opacity: 'elevation',
};

/** Map a Tokens Studio type string to an AIUI token type. Returns null if unmappable. */
function mapTokenType(tsType: string): TokenType | null {
  return TYPE_MAP[tsType] ?? TYPE_MAP[tsType.toLowerCase()] ?? null;
}

/** Infer the AIUI type prefix from the token type. */
function typePrefix(tokenType: TokenType): string {
  switch (tokenType) {
    case 'color':
      return 'color';
    case 'spacing':
      return 'spacing';
    case 'radius':
      return 'radius';
    case 'font':
      return 'font';
    case 'shadow':
      return 'shadow';
    case 'elevation':
      return 'elevation';
  }
}

// ---------------------------------------------------------------------------
// Key sanitization
// ---------------------------------------------------------------------------

/**
 * Convert a path like ["global", "colors", "primary"] or a flat key like
 * "colors.primary" into a valid AIUI token key.
 */
function buildTokenKey(path: string[], tokenType: TokenType): string {
  const prefix = typePrefix(tokenType);

  // Filter out group names that are just type aliases (e.g. "colors", "spacing", "global")
  const typeAliases = new Set([
    'global',
    'core',
    'base',
    'semantic',
    'colors',
    'colour',
    'spacing',
    'radii',
    'borderRadius',
    'fontFamilies',
    'fontFamily',
    'fonts',
    'shadows',
    'boxShadow',
    'sizing',
    'dimension',
    'elevation',
    'opacity',
  ]);

  const segments = path.filter((s) => !typeAliases.has(s) && !typeAliases.has(s.toLowerCase()));

  if (segments.length === 0) {
    // Fallback: use last path element
    const last = path[path.length - 1];
    if (last) segments.push(last);
    else return '';
  }

  // camelCase join of segments
  const camel = segments
    .map((seg, idx) => {
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

// ---------------------------------------------------------------------------
// Value resolution
// ---------------------------------------------------------------------------

/**
 * Resolve `{references.like.this}` in token values by looking them up in
 * a flat map of resolved values.
 */
function resolveReferences(
  value: string,
  resolved: Map<string, string>,
  warnings: string[]
): string {
  return value.replace(/\{([^}]+)\}/g, (_match, ref: string) => {
    // Tokens Studio uses dot or slash separated paths
    const normalizedRef = ref.replace(/\//g, '.');
    const found = resolved.get(normalizedRef);
    if (found !== undefined) return found;

    // Try case-insensitive lookup
    const lowerRef = normalizedRef.toLowerCase();
    for (const [k, v] of resolved) {
      if (k.toLowerCase() === lowerRef) return v;
    }

    warnings.push(`Unresolved reference: {${ref}}`);
    return `{${ref}}`;
  });
}

/** Convert a Tokens Studio shadow value object to a CSS box-shadow string. */
function shadowValueToCss(val: Record<string, unknown>): string {
  const x = val['x'] ?? val['offsetX'] ?? 0;
  const y = val['y'] ?? val['offsetY'] ?? 0;
  const blur = val['blur'] ?? val['radius'] ?? 0;
  const spread = val['spread'] ?? 0;
  const color = val['color'] ?? 'rgba(0,0,0,0.1)';
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
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
// Format detection
// ---------------------------------------------------------------------------

function isTokenLeaf(obj: unknown): obj is TokensStudioLeaf {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return 'value' in record && 'type' in record;
}

// ---------------------------------------------------------------------------
// Tree walking
// ---------------------------------------------------------------------------

interface CollectedToken {
  path: string[];
  flatPath: string;
  leaf: TokensStudioLeaf;
}

function collectLeaves(node: unknown, path: string[], results: CollectedToken[]): void {
  if (isTokenLeaf(node)) {
    results.push({
      path: [...path],
      flatPath: path.join('.'),
      leaf: node as TokensStudioLeaf,
    });
    return;
  }

  if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      // Skip $-prefixed metadata keys
      if (key.startsWith('$')) continue;
      collectLeaves(child, [...path, key], results);
    }
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse a Tokens Studio JSON export (nested or flat format) and convert
 * to AIUI design tokens.
 */
export function parseTokensStudio(json: string): ImportResult {
  const warnings: string[] = [];
  const tokens: CreateTokenInput[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    warnings.push(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    return { tokens: [], stats: {}, warnings, detectedFormat: 'tokens-studio' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    warnings.push('Expected a JSON object at the top level');
    return { tokens: [], stats: {}, warnings, detectedFormat: 'tokens-studio' };
  }

  // Collect all leaf tokens
  const collected: CollectedToken[] = [];
  collectLeaves(parsed, [], collected);

  if (collected.length === 0) {
    warnings.push('No token definitions found in JSON');
    return { tokens: [], stats: {}, warnings, detectedFormat: 'tokens-studio' };
  }

  // First pass: build a resolved values map for reference resolution
  const resolvedValues = new Map<string, string>();
  for (const item of collected) {
    const val = item.leaf.value;
    if (typeof val === 'string' && !val.includes('{')) {
      resolvedValues.set(item.flatPath, val);
    } else if (typeof val === 'number') {
      resolvedValues.set(item.flatPath, String(val));
    }
  }

  // Second pass: resolve references and build tokens
  const seen = new Set<string>();

  for (const item of collected) {
    const tsType = item.leaf.type;
    const tokenType = mapTokenType(tsType);
    if (!tokenType) {
      warnings.push(`Unknown token type "${tsType}" at ${item.flatPath}`);
      continue;
    }

    // Resolve value
    let rawValue: string;
    const leafVal = item.leaf.value;
    if (typeof leafVal === 'object' && leafVal !== null) {
      // Shadow object
      if (tokenType === 'shadow') {
        if (Array.isArray(leafVal)) {
          rawValue = (leafVal as Record<string, unknown>[])
            .map((v) => shadowValueToCss(v))
            .join(', ');
        } else {
          rawValue = shadowValueToCss(leafVal as Record<string, unknown>);
        }
      } else {
        warnings.push(`Unexpected object value for type "${tsType}" at ${item.flatPath}`);
        continue;
      }
    } else if (typeof leafVal === 'number') {
      rawValue = String(leafVal);
    } else if (typeof leafVal === 'string') {
      rawValue = resolveReferences(leafVal, resolvedValues, warnings);
    } else {
      warnings.push(`Unexpected value type at ${item.flatPath}`);
      continue;
    }

    rawValue = ensureUnit(rawValue, tokenType);

    const key = buildTokenKey(item.path, tokenType);
    if (!key) {
      warnings.push(`Could not build valid token key for ${item.flatPath}`);
      continue;
    }

    if (seen.has(key)) continue;
    seen.add(key);

    tokens.push({
      tokenKey: key,
      tokenType,
      tokenValue: rawValue,
      ...(item.leaf.description ? { description: item.leaf.description } : {}),
    });
  }

  // Build stats
  const stats: Record<string, number> = {};
  for (const token of tokens) {
    stats[token.tokenType] = (stats[token.tokenType] ?? 0) + 1;
  }
  stats['total'] = tokens.length;

  return { tokens, stats, warnings, detectedFormat: 'tokens-studio' };
}
