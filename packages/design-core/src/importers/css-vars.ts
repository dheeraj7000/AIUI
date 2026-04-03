/**
 * CSS custom properties parser.
 *
 * Extracts design tokens from CSS :root { --name: value; } declarations.
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
// Token type detection from variable name
// ---------------------------------------------------------------------------

const TYPE_PATTERNS: Array<{ pattern: RegExp; type: TokenType; prefix: string }> = [
  {
    pattern:
      /(?:^|-)(?:color|bg|text|border-color|accent|foreground|background|surface|brand)(?:-|$)/i,
    type: 'color',
    prefix: 'color',
  },
  { pattern: /(?:^|-)(?:shadow|box-shadow)(?:-|$)/i, type: 'shadow', prefix: 'shadow' },
  { pattern: /(?:^|-)(?:radius|rounded|border-radius)(?:-|$)/i, type: 'radius', prefix: 'radius' },
  {
    pattern: /(?:^|-)(?:font|family|sans|serif|mono|typeface)(?:-|$)/i,
    type: 'font',
    prefix: 'font',
  },
  {
    pattern: /(?:^|-)(?:space|gap|padding|margin|spacing)(?:-|$)/i,
    type: 'spacing',
    prefix: 'spacing',
  },
];

/** Detect token type from a CSS variable name (without leading --). */
function detectTokenType(name: string): { type: TokenType; prefix: string } | null {
  for (const entry of TYPE_PATTERNS) {
    if (entry.pattern.test(name)) {
      return { type: entry.type, prefix: entry.prefix };
    }
  }
  return null;
}

/** Also detect type from the value itself as a fallback. */
function detectTypeFromValue(value: string): { type: TokenType; prefix: string } | null {
  const trimmed = value.trim();
  // Hex color
  if (/^#([0-9a-fA-F]{3,8})$/.test(trimmed)) return { type: 'color', prefix: 'color' };
  // Functional color
  if (/^(?:rgb|rgba|hsl|hsla|oklch)\s*\(/.test(trimmed)) return { type: 'color', prefix: 'color' };
  // Box shadow (contains offset pattern)
  if (/\d+px\s+\d+px/.test(trimmed)) return { type: 'shadow', prefix: 'shadow' };
  return null;
}

// ---------------------------------------------------------------------------
// CSS var name -> token key
// ---------------------------------------------------------------------------

/**
 * Convert a CSS custom property name to a valid token key.
 *
 * --color-primary       -> color.primary
 * --bg-surface          -> color.bgSurface
 * --font-sans           -> font.sans
 * --spacing-md          -> spacing.md
 */
function cssVarToTokenKey(name: string, prefix: string): string {
  // Remove the prefix if the variable name already starts with it
  let remainder = name;
  const lowerName = name.toLowerCase();
  const lowerPrefix = prefix.toLowerCase();

  // Check if name starts with a known type-like segment that matches the prefix
  // e.g. "color-primary" with prefix "color" => remainder is "primary"
  const prefixPatterns: Record<string, string[]> = {
    color: [
      'color',
      'bg',
      'text',
      'border-color',
      'accent',
      'foreground',
      'background',
      'surface',
      'brand',
    ],
    font: ['font', 'family', 'sans', 'serif', 'mono', 'typeface'],
    radius: ['radius', 'rounded', 'border-radius'],
    shadow: ['shadow', 'box-shadow'],
    spacing: ['space', 'gap', 'padding', 'margin', 'spacing'],
  };

  const candidates = prefixPatterns[lowerPrefix] ?? [lowerPrefix];
  for (const candidate of candidates) {
    if (lowerName === candidate) {
      // The name IS the prefix => use prefix.default or prefix.base
      remainder = 'default';
      break;
    }
    if (lowerName.startsWith(`${candidate}-`)) {
      remainder = name.slice(candidate.length + 1);
      break;
    }
  }

  // Convert kebab-case to camelCase
  const camel = remainder
    .split('-')
    .filter(Boolean)
    .map((part, idx) => {
      const lower = part.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');

  if (!camel) return '';

  const key = `${prefix}.${camel}`;
  if (TOKEN_KEY_REGEX.test(key)) return key;

  // Strip invalid chars
  const cleaned = key.replace(/[^a-zA-Z0-9.-]/g, '');
  return TOKEN_KEY_REGEX.test(cleaned) ? cleaned : '';
}

// ---------------------------------------------------------------------------
// CSS parsing
// ---------------------------------------------------------------------------

/**
 * Extract the content of :root or * blocks from CSS text.
 * Returns an array of block contents (just the inside of the braces).
 */
function extractRootBlocks(css: string): string[] {
  const blocks: string[] = [];
  // Match :root { ... } or * { ... } — supports nested selectors roughly by counting braces
  const rootPattern = /(?::root|\*)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = rootPattern.exec(css)) !== null) {
    const start = match.index + match[0].length;
    let depth = 1;
    let pos = start;
    while (pos < css.length && depth > 0) {
      if (css[pos] === '{') depth++;
      else if (css[pos] === '}') depth--;
      pos++;
    }
    if (depth === 0) {
      blocks.push(css.slice(start, pos - 1));
    }
  }

  return blocks;
}

/**
 * Parse CSS variable declarations from block content.
 * Returns pairs of [name (without --), value].
 */
function parseDeclarations(block: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  // Match --name: value; (value may span until the next ; or end of block)
  const declPattern = /--([a-zA-Z0-9][\w-]*)\s*:\s*([^;]+)/g;
  let match: RegExpExecArray | null;

  while ((match = declPattern.exec(block)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    if (name && value) {
      pairs.push([name, value]);
    }
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse CSS custom properties (variables) from `:root` or `*` scope and
 * convert them to design tokens.
 */
export function parseCssVariables(css: string): ImportResult {
  const warnings: string[] = [];
  const tokens: CreateTokenInput[] = [];
  const seen = new Set<string>();

  const blocks = extractRootBlocks(css);
  if (blocks.length === 0) {
    // Fallback: treat the whole input as a block if it contains -- declarations
    if (/--[a-zA-Z]/.test(css)) {
      blocks.push(css);
      warnings.push('No :root or * selector found; treating entire input as variable declarations');
    } else {
      warnings.push('No CSS custom property declarations found');
      return { tokens: [], stats: {}, warnings, detectedFormat: 'css' };
    }
  }

  for (const block of blocks) {
    const declarations = parseDeclarations(block);

    for (const [name, value] of declarations) {
      // Determine token type from name first, then from value
      const detected = detectTokenType(name) ?? detectTypeFromValue(value);
      if (!detected) {
        warnings.push(`Could not determine token type for --${name}: ${value}`);
        continue;
      }

      const key = cssVarToTokenKey(name, detected.prefix);
      if (!key) {
        warnings.push(`Could not build valid token key for --${name}`);
        continue;
      }

      if (seen.has(key)) continue;
      seen.add(key);

      tokens.push({
        tokenKey: key,
        tokenType: detected.type,
        tokenValue: value,
      });
    }
  }

  // Build stats
  const stats: Record<string, number> = {};
  for (const token of tokens) {
    stats[token.tokenType] = (stats[token.tokenType] ?? 0) + 1;
  }
  stats['total'] = tokens.length;

  return { tokens, stats, warnings, detectedFormat: 'css' };
}
