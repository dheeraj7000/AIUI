/**
 * Unified design token import interface.
 *
 * Supports importing tokens from Figma, CSS custom properties,
 * Tokens Studio JSON, and Tailwind CSS configurations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateTokenInput {
  tokenKey: string;
  tokenType: 'color' | 'radius' | 'font' | 'spacing' | 'shadow' | 'elevation';
  tokenValue: string;
  description?: string;
}

export type ImportFormat = 'figma' | 'css' | 'tokens-studio' | 'tailwind' | 'auto';

export interface ImportResult {
  tokens: CreateTokenInput[];
  stats: Record<string, number>;
  warnings: string[];
  detectedFormat?: string;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { parseFigmaUrl, extractFigmaTokens } from './figma';
export type { FigmaExtractionResult } from './figma';

import { parseCssVariables as _parseCssVariables } from './css-vars';
import { parseTokensStudio as _parseTokensStudio } from './tokens-studio';
import { parseTailwindConfig as _parseTailwindConfig } from './tailwind-config';

export { parseCssVariables } from './css-vars';
export { parseTokensStudio } from './tokens-studio';
export { parseTailwindConfig } from './tailwind-config';

// ---------------------------------------------------------------------------
// Format detection
// ---------------------------------------------------------------------------

/**
 * Auto-detect the format of a token definition string.
 *
 * Detection heuristics (in order):
 *  1. Contains `:root` or CSS custom property declarations (`--`) -> css
 *  2. Valid JSON with nested `value` + `type` leaf objects -> tokens-studio
 *  3. Contains `theme` / `extend` with Tailwind category keys -> tailwind
 *  4. Fallback -> auto (will try all parsers)
 */
export function detectFormat(content: string): ImportFormat {
  const trimmed = content.trim();

  // 1. CSS custom properties
  if (/(?::root|[*])\s*\{/.test(trimmed) || /--[a-zA-Z][\w-]*\s*:/.test(trimmed)) {
    return 'css';
  }

  // 2-3. Try JSON-based formats
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      if (looksLikeTokensStudio(parsed as Record<string, unknown>)) {
        return 'tokens-studio';
      }
      if (looksLikeTailwind(parsed as Record<string, unknown>)) {
        return 'tailwind';
      }
    }
  } catch {
    // Not valid JSON — could be a JS config
    if (looksLikeTailwindJs(trimmed)) {
      return 'tailwind';
    }
  }

  return 'auto';
}

/** Check if a parsed JSON object looks like Tokens Studio format. */
function looksLikeTokensStudio(obj: Record<string, unknown>): boolean {
  // Walk up to 3 levels deep looking for {value, type} leaves
  return hasTokenLeaves(obj, 0);
}

function hasTokenLeaves(obj: Record<string, unknown>, depth: number): boolean {
  if (depth > 4) return false;
  for (const val of Object.values(obj)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const record = val as Record<string, unknown>;
      if ('value' in record && 'type' in record) return true;
      if (hasTokenLeaves(record, depth + 1)) return true;
    }
  }
  return false;
}

/** Check if a parsed JSON object looks like a Tailwind theme config. */
function looksLikeTailwind(obj: Record<string, unknown>): boolean {
  const tailwindCategories = new Set([
    'colors',
    'backgroundColor',
    'textColor',
    'borderColor',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'borderRadius',
    'spacing',
    'gap',
    'padding',
    'margin',
    'boxShadow',
    'dropShadow',
    'zIndex',
  ]);

  // Direct theme keys
  if (Object.keys(obj).some((k) => tailwindCategories.has(k))) return true;

  // Nested under theme or theme.extend
  const theme = obj['theme'] as Record<string, unknown> | undefined;
  if (typeof theme === 'object' && theme !== null) {
    if (Object.keys(theme).some((k) => tailwindCategories.has(k))) return true;
    const extend = theme['extend'] as Record<string, unknown> | undefined;
    if (typeof extend === 'object' && extend !== null) {
      if (Object.keys(extend).some((k) => tailwindCategories.has(k))) return true;
    }
  }

  return false;
}

/** Check if a JS string looks like a Tailwind config. */
function looksLikeTailwindJs(content: string): boolean {
  return (
    /(?:module\.exports|export\s+default)\s*=?\s*\{/.test(content) &&
    /(?:theme|colors|spacing|fontFamily|borderRadius|boxShadow)/.test(content)
  );
}

// ---------------------------------------------------------------------------
// Unified parser
// ---------------------------------------------------------------------------

/**
 * Parse design tokens from a string in the specified (or auto-detected) format.
 *
 * When format is 'auto', all non-Figma parsers are tried and the result
 * with the most extracted tokens is returned.
 *
 * Note: Figma import is not attempted via parseTokens because it requires
 * an async API call with authentication. Use `extractFigmaTokens` directly.
 */
export function parseTokens(content: string, format?: ImportFormat): ImportResult {
  const resolvedFormat = format && format !== 'auto' ? format : detectFormat(content);

  // Direct dispatch for known formats
  if (resolvedFormat === 'css') {
    return _parseCssVariables(content);
  }

  if (resolvedFormat === 'tokens-studio') {
    return _parseTokensStudio(content);
  }

  if (resolvedFormat === 'tailwind') {
    return _parseTailwindConfig(content);
  }

  if (resolvedFormat === 'figma') {
    return {
      tokens: [],
      stats: { total: 0 },
      warnings: [
        'Figma import requires API authentication. Use extractFigmaTokens(fileKey, accessToken) directly.',
      ],
    };
  }

  // Auto mode: try all parsers and pick the best result
  const results: ImportResult[] = [];

  try {
    const cssResult = _parseCssVariables(content);
    if (cssResult.tokens.length > 0) results.push(cssResult);
  } catch {
    // CSS parser failed, skip
  }

  try {
    const tsResult = _parseTokensStudio(content);
    if (tsResult.tokens.length > 0) results.push(tsResult);
  } catch {
    // Tokens Studio parser failed, skip
  }

  try {
    const twResult = _parseTailwindConfig(content);
    if (twResult.tokens.length > 0) results.push(twResult);
  } catch {
    // Tailwind parser failed, skip
  }

  if (results.length === 0) {
    return {
      tokens: [],
      stats: { total: 0 },
      warnings: [
        'Could not parse any tokens from the provided input. Tried: CSS, Tokens Studio, Tailwind.',
      ],
      detectedFormat: 'auto',
    };
  }

  // Return the result with the most tokens
  results.sort((a, b) => b.tokens.length - a.tokens.length);
  return results[0];
}
