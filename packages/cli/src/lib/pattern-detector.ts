import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

export type PatternType =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'font-size'
  | 'font'
  | 'shadow'
  | 'z-index'
  | 'opacity'
  | 'border-width'
  | 'other';

export interface Pattern {
  /** The hardcoded value, e.g. "#FF5733", "20px", "0.875rem". */
  value: string;
  /** Best-guess token type based on Tailwind prefix context. */
  type: PatternType;
  /** Total occurrences across the scanned codebase. */
  count: number;
  /** File paths (relative to scan root) where this pattern appears. */
  files: string[];
  /** Distinct Tailwind prefixes seen with this value (e.g. ['bg', 'text']). */
  contexts: string[];
  /** Suggested semantic name based on type + context (purely a hint). */
  suggestedName: string;
}

/**
 * Hardcoded values that are too generic to be design tokens.
 *
 * - `0`, `0px`, `0rem` — semantically meaningless; "no spacing"
 * - `auto`, `none`, `inherit`, `initial`, `transparent`, `currentcolor` — keywords
 * - `100%`, `50%` — common layout primitives
 * - `9999px`, `999px` — pill / rounded-full sentinels
 * - `1px` — hairline border, almost always intentional standalone
 * - `#fff`, `#ffffff`, `#000`, `#000000` — pure white/black are too generic to flag
 */
const TRIVIAL_VALUES = new Set([
  '0',
  '0px',
  '0rem',
  '0em',
  '0%',
  'auto',
  'none',
  'inherit',
  'initial',
  'unset',
  'transparent',
  'currentcolor',
  '100%',
  '50%',
  '9999px',
  '999px',
  '1px',
  '#fff',
  '#ffffff',
  '#000',
  '#000000',
]);

/**
 * Tailwind prefixes grouped by the token type they typically map to.
 * Order matters — longer / more-specific prefixes first so we don't
 * mismatch e.g. `border-width` against `border-`.
 */
const PREFIX_TO_TYPE: Array<[string, PatternType]> = [
  // Border width: only when the value parses as a length without a slash
  ['border-x-', 'border-width'],
  ['border-y-', 'border-width'],
  ['border-t-', 'border-width'],
  ['border-r-', 'border-width'],
  ['border-b-', 'border-width'],
  ['border-l-', 'border-width'],

  ['rounded-tl-', 'radius'],
  ['rounded-tr-', 'radius'],
  ['rounded-bl-', 'radius'],
  ['rounded-br-', 'radius'],
  ['rounded-t-', 'radius'],
  ['rounded-r-', 'radius'],
  ['rounded-b-', 'radius'],
  ['rounded-l-', 'radius'],
  ['rounded-', 'radius'],

  ['shadow-', 'shadow'],

  ['font-', 'font'], // family
  ['leading-', 'spacing'], // line-height — close enough
  ['tracking-', 'spacing'], // letter-spacing — close enough

  ['z-', 'z-index'],
  ['opacity-', 'opacity'],

  // Color-bearing prefixes
  ['bg-', 'color'],
  ['text-', 'color'], // disambiguated below for px/rem → font-size
  ['border-', 'color'], // disambiguated below for px → border-width
  ['ring-', 'color'],
  ['from-', 'color'],
  ['to-', 'color'],
  ['via-', 'color'],
  ['outline-', 'color'],
  ['decoration-', 'color'],
  ['caret-', 'color'],
  ['accent-', 'color'],
  ['fill-', 'color'],
  ['stroke-', 'color'],
  ['placeholder-', 'color'],

  // Spacing-bearing prefixes
  ['p-', 'spacing'],
  ['px-', 'spacing'],
  ['py-', 'spacing'],
  ['pt-', 'spacing'],
  ['pr-', 'spacing'],
  ['pb-', 'spacing'],
  ['pl-', 'spacing'],
  ['m-', 'spacing'],
  ['mx-', 'spacing'],
  ['my-', 'spacing'],
  ['mt-', 'spacing'],
  ['mr-', 'spacing'],
  ['mb-', 'spacing'],
  ['ml-', 'spacing'],
  ['gap-', 'spacing'],
  ['gap-x-', 'spacing'],
  ['gap-y-', 'spacing'],
  ['space-x-', 'spacing'],
  ['space-y-', 'spacing'],
  ['w-', 'spacing'],
  ['h-', 'spacing'],
  ['min-w-', 'spacing'],
  ['min-h-', 'spacing'],
  ['max-w-', 'spacing'],
  ['max-h-', 'spacing'],
  ['top-', 'spacing'],
  ['bottom-', 'spacing'],
  ['left-', 'spacing'],
  ['right-', 'spacing'],
  ['inset-', 'spacing'],
  ['translate-x-', 'spacing'],
  ['translate-y-', 'spacing'],
];

const COLOR_VALUE_RE =
  /^(?:#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|oklab\([^)]+\))$/i;
const LENGTH_VALUE_RE = /^-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)$/;
const NUMBER_VALUE_RE = /^-?\d+(?:\.\d+)?$/;

function normalizeValue(value: string, type: PatternType): string {
  if (type === 'color') {
    let v = value.toLowerCase();
    // Expand 3-digit hex to 6-digit so #abc and #aabbcc collapse
    if (/^#[0-9a-f]{3}$/.test(v)) {
      v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
    }
    return v;
  }
  return value;
}

/**
 * Refine the type based on the actual value. e.g., `text-[#fff]` is color,
 * but `text-[14px]` is font-size; `border-[2px]` is border-width, not color.
 */
function refineType(prefix: string, value: string, baseType: PatternType): PatternType {
  if (prefix === 'text-') {
    if (COLOR_VALUE_RE.test(value)) return 'color';
    if (LENGTH_VALUE_RE.test(value)) return 'font-size';
  }
  if (prefix === 'border-' || prefix.startsWith('border-')) {
    if (COLOR_VALUE_RE.test(value)) return 'color';
    if (LENGTH_VALUE_RE.test(value) && !value.endsWith('%')) return 'border-width';
  }
  if (prefix === 'z-' && NUMBER_VALUE_RE.test(value)) return 'z-index';
  if (prefix === 'opacity-' && NUMBER_VALUE_RE.test(value)) return 'opacity';
  return baseType;
}

function classifyPrefix(prefix: string, value: string): PatternType {
  for (const [p, t] of PREFIX_TO_TYPE) {
    if (prefix === p) {
      return refineType(prefix, value, t);
    }
  }
  // Unknown prefix — guess from value shape
  if (COLOR_VALUE_RE.test(value)) return 'color';
  if (LENGTH_VALUE_RE.test(value)) return 'spacing';
  return 'other';
}

function suggestName(type: PatternType, value: string, contexts: string[]): string {
  // Build a semantic-ish suggestion based on type. The user can rename.
  const prefix = type === 'color' ? 'color.brand' : type;
  const valueSlug = value
    .replace(/^#/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .slice(0, 16);
  const ctxHint = contexts[0] ? contexts[0].replace(/-$/, '') : '';
  return ctxHint && ctxHint !== type
    ? `${prefix}.${ctxHint}-${valueSlug}`
    : `${prefix}.${valueSlug}`;
}

export interface DetectPatternsOptions {
  /** Minimum occurrences to surface a pattern. Defaults to 3. */
  minCount?: number;
  /** Additional values to ignore (in addition to TRIVIAL_VALUES). */
  ignore?: string[];
  /** File glob to scan. Defaults to `src/**\/*.{tsx,jsx,ts,js,css,html}`. */
  glob?: string;
}

/**
 * Scan project files for repetitive arbitrary Tailwind values or hardcoded styles.
 *
 * Filtering rules (in order):
 * 1. Skip values in TRIVIAL_VALUES (or in opts.ignore)
 * 2. Skip values that wouldn't parse as a length / color / number (junk)
 * 3. Skip patterns appearing in fewer than minCount files (default 3)
 *
 * Each surfaced pattern includes its type (inferred from prefix context),
 * the distinct prefixes it was used with, and a suggested semantic name.
 */
export async function detectPatterns(
  cwd: string,
  opts: DetectPatternsOptions = {}
): Promise<Pattern[]> {
  const minCount = opts.minCount ?? 3;
  const userIgnore = new Set(opts.ignore ?? []);
  const ignored = new Set([...TRIVIAL_VALUES, ...userIgnore]);

  const files = await glob(opts.glob ?? 'src/**/*.{tsx,jsx,ts,js,css,html}', {
    cwd,
    absolute: true,
  });

  type Bucket = {
    count: number;
    files: Set<string>;
    contexts: Set<string>;
    type: PatternType;
  };
  const buckets: Record<string, Bucket> = {};

  // Match arbitrary Tailwind values: `prefix-[value]`. We capture the prefix
  // separately so we can disambiguate (text-[14px] vs text-[#fff]).
  const arbRe = /(?<![A-Za-z0-9_-])([a-z][a-z0-9-]*-)\[([^\]\s]+)\]/gi;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');

    let am: RegExpExecArray | null;
    while ((am = arbRe.exec(content)) !== null) {
      const prefix = am[1];
      const rawValue = am[2];

      if (ignored.has(rawValue.toLowerCase())) continue;

      const type = classifyPrefix(prefix, rawValue);
      const value = normalizeValue(rawValue, type);
      if (ignored.has(value)) continue;

      // Skip values that are gibberish (not a parseable token shape)
      const parseable =
        COLOR_VALUE_RE.test(value) || LENGTH_VALUE_RE.test(value) || NUMBER_VALUE_RE.test(value);
      if (!parseable) continue;

      const key = `${type}::${value}`;
      const bucket = (buckets[key] ??= {
        count: 0,
        files: new Set(),
        contexts: new Set(),
        type,
      });
      bucket.count++;
      bucket.files.add(path.relative(cwd, filePath));
      bucket.contexts.add(prefix);
    }
  }

  return Object.entries(buckets)
    .filter(([, b]) => b.count >= minCount)
    .map(([key, b]): Pattern => {
      const value = key.slice(key.indexOf('::') + 2);
      const contexts = Array.from(b.contexts).sort();
      return {
        value,
        type: b.type,
        count: b.count,
        files: Array.from(b.files),
        contexts,
        suggestedName: suggestName(b.type, value, contexts),
      };
    })
    .sort((a, b) => b.count - a.count);
}
