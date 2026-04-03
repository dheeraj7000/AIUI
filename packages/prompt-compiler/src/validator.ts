import type { MergedTokenMap } from './types';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  tokenPaths: string[];
  suggestion?: string;
}

export type ValidationRule = (tokens: MergedTokenMap) => ValidationIssue[];

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  checkedAt: string;
}

// --- Color utilities ---

function parseHexToRgb(hex: string): [number, number, number] | null {
  const match = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return null;
  const val = parseInt(match[1], 16);
  return [(val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Individual checkers ---

/** WCAG AA contrast ratio check for foreground/background color pairs. */
export const checkContrast: ValidationRule = (tokens) => {
  const issues: ValidationIssue[] = [];

  const fgKeys = ['color.foreground', 'color.primary'];
  const bgKeys = ['color.background'];

  for (const fgKey of fgKeys) {
    const fgVal = tokens[fgKey];
    if (typeof fgVal !== 'string') continue;
    const fgRgb = parseHexToRgb(fgVal);
    if (!fgRgb) continue;

    for (const bgKey of bgKeys) {
      const bgVal = tokens[bgKey];
      if (typeof bgVal !== 'string') continue;
      const bgRgb = parseHexToRgb(bgVal);
      if (!bgRgb) continue;

      const fgLum = relativeLuminance(...fgRgb);
      const bgLum = relativeLuminance(...bgRgb);
      const ratio = contrastRatio(fgLum, bgLum);

      if (ratio < 4.5) {
        issues.push({
          severity: 'error',
          code: 'CONTRAST_AA_FAIL',
          message: `Contrast ratio ${ratio.toFixed(2)}:1 between "${fgKey}" (${fgVal}) and "${bgKey}" (${bgVal}) fails WCAG AA (requires 4.5:1)`,
          tokenPaths: [fgKey, bgKey],
          suggestion: `Darken "${fgKey}" or lighten "${bgKey}" to achieve at least 4.5:1 contrast ratio`,
        });
      }
    }
  }

  return issues;
};

/** Check for incompatible font pairings. */
const DECORATIVE_FONTS = new Set([
  'Pacifico',
  'Lobster',
  'Dancing Script',
  'Caveat',
  'Satisfy',
  'Great Vibes',
  'Permanent Marker',
  'Indie Flower',
  'Shadows Into Light',
]);

export const checkFontPairing: ValidationRule = (tokens) => {
  const issues: ValidationIssue[] = [];
  const heading = tokens['font.heading'];
  const body = tokens['font.body'];

  if (typeof heading !== 'string' || typeof body !== 'string') return issues;

  if (heading === body) {
    issues.push({
      severity: 'info',
      code: 'IDENTICAL_FONTS',
      message: `Heading and body fonts are both "${heading}". Consider using different fonts for visual hierarchy.`,
      tokenPaths: ['font.heading', 'font.body'],
    });
  }

  if (DECORATIVE_FONTS.has(heading) && DECORATIVE_FONTS.has(body)) {
    issues.push({
      severity: 'warning',
      code: 'DECORATIVE_PAIR',
      message: `Both heading ("${heading}") and body ("${body}") are decorative fonts, which reduces readability`,
      tokenPaths: ['font.heading', 'font.body'],
      suggestion:
        'Use a decorative font for headings only; pair with a clean sans-serif for body text',
    });
  }

  return issues;
};

/** Check spacing scale consistency. */
function parseNumericValue(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;
  const match = val.match(/^(-?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export const checkSpacingScale: ValidationRule = (tokens) => {
  const issues: ValidationIssue[] = [];

  const unitVal = tokens['spacing.unit'];
  const unitNum = parseNumericValue(unitVal);

  if (unitNum !== null && unitNum <= 0) {
    issues.push({
      severity: 'error',
      code: 'INVALID_SPACING_UNIT',
      message: `spacing.unit is ${unitVal}, must be a positive value`,
      tokenPaths: ['spacing.unit'],
      suggestion: 'Set spacing.unit to a positive value like "4px"',
    });
  }

  // Collect all spacing tokens with numeric values
  const spacingEntries: { key: string; value: number }[] = [];
  for (const [key, val] of Object.entries(tokens)) {
    if (key.startsWith('spacing.') && key !== 'spacing.unit') {
      const num = parseNumericValue(val);
      if (num !== null) spacingEntries.push({ key, value: num });
    }
  }

  spacingEntries.sort((a, b) => a.value - b.value);

  for (let i = 1; i < spacingEntries.length; i++) {
    const prev = spacingEntries[i - 1];
    const curr = spacingEntries[i];
    const gap = curr.value - prev.value;
    const expectedStep = i > 1 ? spacingEntries[1].value - spacingEntries[0].value : gap;

    if (expectedStep > 0 && gap > expectedStep * 2) {
      issues.push({
        severity: 'warning',
        code: 'SPACING_GAP',
        message: `Large gap in spacing scale between "${prev.key}" (${prev.value}) and "${curr.key}" (${curr.value})`,
        tokenPaths: [prev.key, curr.key],
        suggestion: 'Add intermediate spacing values for a smoother scale progression',
      });
    }
  }

  return issues;
};

/** Check radius scale consistency. */
export const checkRadiusScale: ValidationRule = (tokens) => {
  const issues: ValidationIssue[] = [];
  const sizes = ['radius.sm', 'radius.md', 'radius.lg'] as const;
  const values: { key: string; num: number }[] = [];

  for (const key of sizes) {
    const val = tokens[key];
    const num = parseNumericValue(val);
    if (num !== null) values.push({ key, num });
  }

  // Check ordering
  for (let i = 1; i < values.length; i++) {
    if (values[i].num < values[i - 1].num) {
      issues.push({
        severity: 'error',
        code: 'RADIUS_INVERTED',
        message: `Radius scale is inverted: "${values[i - 1].key}" (${values[i - 1].num}) > "${values[i].key}" (${values[i].num})`,
        tokenPaths: [values[i - 1].key, values[i].key],
        suggestion: `Ensure ${sizes[0]} < ${sizes[1]} < ${sizes[2]}`,
      });
    }
  }

  // Check extreme ratios
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1].num > 0) {
      const ratio = values[i].num / values[i - 1].num;
      if (ratio > 4) {
        issues.push({
          severity: 'warning',
          code: 'RADIUS_EXTREME_RATIO',
          message: `Extreme ratio (${ratio.toFixed(1)}x) between "${values[i - 1].key}" and "${values[i].key}"`,
          tokenPaths: [values[i - 1].key, values[i].key],
          suggestion: 'Keep radius scale ratios below 4x for visual consistency',
        });
      }
    }
  }

  return issues;
};

// --- Main validator ---

const DEFAULT_RULES: ValidationRule[] = [
  checkContrast,
  checkFontPairing,
  checkSpacingScale,
  checkRadiusScale,
];

/**
 * Validate a merged token map for design conflicts and accessibility issues.
 */
export function validateTokens(
  tokens: MergedTokenMap,
  rules: ValidationRule[] = DEFAULT_RULES
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const rule of rules) {
    issues.push(...rule(tokens));
  }

  // Sort: errors first, then warnings, then info
  const severityOrder: Record<ValidationSeverity, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
    checkedAt: new Date().toISOString(),
  };
}
