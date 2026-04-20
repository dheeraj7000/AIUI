import * as fs from 'node:fs';
import * as path from 'node:path';
import { checkTokenCompliance } from '@aiui/design-core';
import type {
  ComplianceResult,
  ComplianceViolation,
  ComplianceViolationType,
} from '@aiui/design-core';
import { extractTailwindViolations, runAllAccessibilityChecks } from '@aiui/mcp-server/detectors';

export interface ApprovedToken {
  tokenKey: string;
  tokenValue: string;
  tokenType: string;
}

export interface FileResult {
  filePath: string;
  result: ComplianceResult;
}

/** All 16 supported token types. */
const ALL_TOKEN_TYPES = [
  'color',
  'font',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'spacing',
  'radius',
  'shadow',
  'elevation',
  'z-index',
  'breakpoint',
  'opacity',
  'border-width',
  'animation',
  'transition',
] as const;

/**
 * Load tokens from a local .aiui/tokens.json file.
 *
 * Expected file format:
 * {
 *   "color": { "primary": "#3B82F6", "background": "#FFFFFF" },
 *   "font": { "heading": "Inter, sans-serif" },
 *   "radius": { "md": "8px" }
 * }
 *
 * Converts to Array<{ tokenKey, tokenValue, tokenType }> for checkTokenCompliance.
 */
export function loadLocalTokens(tokensPath: string): ApprovedToken[] {
  if (!fs.existsSync(tokensPath)) {
    throw new Error(
      `Token file not found: ${tokensPath}\n` +
        `Run "aiui sync" to generate .aiui/tokens.json, or pass --api-key to load tokens remotely.`
    );
  }

  const raw = fs.readFileSync(tokensPath, 'utf-8');
  let data: Record<string, unknown>;

  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid JSON in token file: ${tokensPath}`);
  }

  const tokens: ApprovedToken[] = [];

  for (const [tokenType, group] of Object.entries(data)) {
    if (group && typeof group === 'object' && !Array.isArray(group)) {
      for (const [key, value] of Object.entries(group as Record<string, unknown>)) {
        if (typeof value === 'string') {
          tokens.push({
            tokenKey: `${tokenType}.${key}`,
            tokenValue: value,
            tokenType,
          });
        }
      }
    }
  }

  if (tokens.length === 0) {
    throw new Error(
      `No tokens found in ${tokensPath}. Ensure the file contains token categories (${ALL_TOKEN_TYPES.join(', ')}).`
    );
  }

  return tokens;
}

/**
 * Load tokens from the AIUI remote API.
 */
export async function loadRemoteTokens(
  apiUrl: string,
  apiKey: string,
  projectSlug: string
): Promise<ApprovedToken[]> {
  const url = `${apiUrl}/api/projects/${projectSlug}/style-pack`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Failed to fetch tokens from API (HTTP ${res.status}): ${body || res.statusText}\n` +
        `URL: ${url}`
    );
  }

  const data = (await res.json()) as Record<string, unknown>;
  const tokens: ApprovedToken[] = [];

  // The API may return the same nested format as the local file,
  // or it may return a flat array. Handle both.
  if (Array.isArray(data)) {
    for (const item of data) {
      const t = item as Record<string, unknown>;
      if (
        typeof t.tokenKey === 'string' &&
        typeof t.tokenValue === 'string' &&
        typeof t.tokenType === 'string'
      ) {
        tokens.push({
          tokenKey: t.tokenKey,
          tokenValue: t.tokenValue,
          tokenType: t.tokenType,
        });
      }
    }
  } else if (typeof data === 'object' && data !== null) {
    // Handle nested format (same as local tokens)
    for (const [tokenType, group] of Object.entries(data)) {
      if (group && typeof group === 'object' && !Array.isArray(group)) {
        for (const [key, value] of Object.entries(group as Record<string, unknown>)) {
          if (typeof value === 'string') {
            tokens.push({
              tokenKey: `${tokenType}.${key}`,
              tokenValue: value,
              tokenType,
            });
          }
        }
      }
    }
  }

  if (tokens.length === 0) {
    throw new Error(`No tokens returned from API for project "${projectSlug}".`);
  }

  return tokens;
}

/**
 * Parse a simple glob pattern into a matching function.
 *
 * Supports:
 *   **              matches any number of directories
 *   *               matches any filename characters (no path separators)
 *   {a,b,c}         alternation
 *   .ext             literal dot + extension
 *
 * This is intentionally simple -- no external dependencies.
 */
function globToRegExp(pattern: string): RegExp {
  // Expand brace groups: "*.{tsx,jsx}" -> "(tsx|jsx)"
  let expanded = pattern;
  expanded = expanded.replace(/\{([^}]+)\}/g, (_match, group: string) => {
    const alternatives = group.split(',').map((s: string) => s.trim());
    return `(${alternatives.join('|')})`;
  });

  // Escape regex special chars (except * which we handle)
  let regexStr = '';
  let i = 0;
  while (i < expanded.length) {
    const ch = expanded[i];
    if (ch === '*' && expanded[i + 1] === '*') {
      // ** matches any path segment(s)
      if (expanded[i + 2] === '/' || expanded[i + 2] === '\\') {
        regexStr += '(?:.+[\\\\/])?';
        i += 3;
      } else {
        regexStr += '.*';
        i += 2;
      }
    } else if (ch === '*') {
      // * matches anything except path separator
      regexStr += '[^\\\\/]*';
      i += 1;
    } else if (ch === '?') {
      regexStr += '[^\\\\/]';
      i += 1;
    } else if (ch === '.' || ch === '+' || ch === '^' || ch === '$' || ch === '|') {
      // The alternation parens from brace expansion use | and () which should pass through
      if (ch === '|') {
        regexStr += '|';
      } else {
        regexStr += `\\${ch}`;
      }
      i += 1;
    } else if (ch === '(' || ch === ')') {
      regexStr += ch;
      i += 1;
    } else {
      regexStr += ch;
      i += 1;
    }
  }

  return new RegExp(`^${regexStr}$`);
}

/**
 * Check if a relative path matches any of the ignore patterns.
 */
function isIgnored(relativePath: string, ignorePatterns: string[]): boolean {
  for (const pattern of ignorePatterns) {
    // Simple substring/glob match for ignore patterns
    if (relativePath.includes(pattern)) {
      return true;
    }
    // Try as a glob pattern
    try {
      const re = globToRegExp(pattern);
      if (re.test(relativePath)) {
        return true;
      }
    } catch {
      // If the pattern is not a valid glob, just use the substring match above
    }
  }
  return false;
}

/**
 * Find files matching a glob pattern using recursive directory reading.
 * No external dependencies -- uses fs.readdirSync with recursive: true (Node 20+).
 */
export function findFiles(pattern: string, cwd: string, ignore: string[]): string[] {
  const regex = globToRegExp(pattern);

  // Always ignore these directories
  const defaultIgnore = ['node_modules', 'dist', '.next', '.turbo', '.git'];
  const allIgnore = [...defaultIgnore, ...ignore];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(cwd, { withFileTypes: true, recursive: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read directory "${cwd}": ${message}`, { cause: err });
  }

  const results: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    // Build the relative path from cwd
    // entry.parentPath is available in Node 20+ with recursive: true
    const parentDir = (entry as unknown as { parentPath?: string }).parentPath ?? '';
    const fullPath = path.join(parentDir, entry.name);
    const relativePath = path.relative(cwd, fullPath);

    // Normalize separators to forward slashes for matching
    const normalizedPath = relativePath.split(path.sep).join('/');

    // Check ignore patterns (including default ignores)
    if (allIgnore.some((ig) => normalizedPath.split('/').some((segment) => segment === ig))) {
      continue;
    }
    if (isIgnored(normalizedPath, ignore)) {
      continue;
    }

    // Test the glob pattern
    if (regex.test(normalizedPath)) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

/**
 * Extract CSS property values from source code for a given set of property names.
 * Returns matched values with line numbers. Skips var(--...) references.
 */
function extractCssValues(
  code: string,
  propertyPattern: RegExp
): Array<{ value: string; line: number }> {
  const results: Array<{ value: string; line: number }> = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    let match: RegExpExecArray | null;
    // Reset lastIndex for global regex
    propertyPattern.lastIndex = 0;
    while ((match = propertyPattern.exec(lineText)) !== null) {
      const value = (match[1] ?? '').trim();
      // Skip CSS custom property references — var(--anything) is never a violation
      if (!value || /^var\(--/.test(value)) continue;
      results.push({ value, line: i + 1 });
    }
  }
  return results;
}

/**
 * Extract @media breakpoint values from source code.
 * Matches min-width and max-width inside @media queries.
 */
function extractBreakpoints(code: string): Array<{ value: string; line: number }> {
  const results: Array<{ value: string; line: number }> = [];
  const lines = code.split('\n');
  const re = /@media[^{]*(?:min|max)-width:\s*([^)}\s,]+)/g;
  for (let i = 0; i < lines.length; i++) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(lines[i])) !== null) {
      const value = (match[1] ?? '').trim();
      if (!value || /^var\(--/.test(value)) continue;
      results.push({ value, line: i + 1 });
    }
  }
  return results;
}

/**
 * Configuration for extracting values of each additional token type.
 * Maps token type -> regex that captures the value (group 1).
 */
const TOKEN_EXTRACTORS: Array<{
  tokenType: ComplianceViolationType;
  extract: (code: string) => Array<{ value: string; line: number }>;
}> = [
  {
    tokenType: 'font-size',
    extract: (code) => extractCssValues(code, /font-size:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'font-weight',
    extract: (code) => extractCssValues(code, /font-weight:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'line-height',
    extract: (code) => extractCssValues(code, /line-height:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'letter-spacing',
    extract: (code) => extractCssValues(code, /letter-spacing:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'spacing',
    extract: (code) => extractCssValues(code, /(?:margin|padding|gap):\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'radius',
    extract: (code) => extractCssValues(code, /border-radius:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'border-width',
    extract: (code) => extractCssValues(code, /border(?:-width)?:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'z-index',
    extract: (code) => extractCssValues(code, /z-index:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'opacity',
    extract: (code) => extractCssValues(code, /opacity:\s*([^;}\n]+)/g),
  },
  {
    tokenType: 'breakpoint',
    extract: extractBreakpoints,
  },
];

/**
 * Build a Set of approved values for a given token type, lowercased and trimmed.
 */
function approvedValueSet(tokens: ApprovedToken[], tokenType: string): Set<string> {
  return new Set(
    tokens.filter((t) => t.tokenType === tokenType).map((t) => t.tokenValue.toLowerCase().trim())
  );
}

/**
 * For multi-value shorthand properties (e.g. margin: 8px 16px),
 * split into individual values and check each.
 */
function splitShorthandValues(raw: string): string[] {
  // Trim and split on whitespace, but keep function calls like rgb(...) together
  const values: string[] = [];
  let current = '';
  let depth = 0;
  for (const ch of raw) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) values.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) values.push(current.trim());
  return values;
}

/**
 * Scan a single file for token compliance violations.
 *
 * Runs the core color/font check via checkTokenCompliance, then performs
 * additional extraction for all 16 token types and appends violations.
 */
export function scanFile(filePath: string, tokens: ApprovedToken[]): FileResult {
  const code = fs.readFileSync(filePath, 'utf-8');

  // 1. Run existing core checks (color + font)
  const result = checkTokenCompliance(code, tokens);

  // 2. Run additional token-type checks
  const additionalViolations: ComplianceViolation[] = [];

  for (const { tokenType, extract } of TOKEN_EXTRACTORS) {
    const approved = approvedValueSet(tokens, tokenType);

    // Skip types that have no approved values defined
    if (approved.size === 0) continue;

    const usedValues = extract(code);
    for (const { value: rawValue, line } of usedValues) {
      // For shorthand properties (e.g. "8px 16px 8px 16px"), check each part
      const parts = splitShorthandValues(rawValue);
      for (const part of parts) {
        // Skip CSS custom property references
        if (/^var\(--/.test(part)) continue;
        // Skip CSS keywords that aren't concrete values (inherit, initial, etc.)
        if (/^(inherit|initial|unset|revert|auto|none|normal)$/i.test(part)) continue;

        if (!approved.has(part.toLowerCase())) {
          additionalViolations.push({
            type: tokenType,
            severity: 'warning',
            message: `Unauthorized ${tokenType} value "${part}" at line ${line}`,
            line,
            value: part,
            suggestion: `Replace with an approved ${tokenType} token value`,
          });
        }
      }
    }
  }

  if (additionalViolations.length > 0) {
    result.violations.push(...additionalViolations);
    result.compliant = result.violations.length === 0;

    // Recalculate score with all violations
    const errorCount = result.violations.filter((v) => v.severity === 'error').length;
    const warningCount = result.violations.filter((v) => v.severity === 'warning').length;
    result.score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);
  }

  return { filePath, result };
}

/**
 * Async variant that also runs Tailwind, accessibility, and anti-pattern
 * detectors imported from @aiui/mcp-server. The anti-pattern engine is
 * optional — if the module fails to resolve, its rules are skipped.
 */
export async function scanFileAsync(
  filePath: string,
  tokens: ApprovedToken[]
): Promise<FileResult> {
  // Reuse the existing sync pipeline for token-value checks
  const result = scanFile(filePath, tokens);
  const code = fs.readFileSync(filePath, 'utf-8');

  // Approved Tailwind classes — if any token happens to look like a utility
  // (e.g. "bg-primary") treat it as pre-approved.
  const approvedTailwind = new Set(
    tokens.filter((t) => t.tokenType === 'color').map((t) => t.tokenValue.toLowerCase())
  );
  for (const tv of extractTailwindViolations(code, approvedTailwind)) {
    result.result.violations.push({
      type: 'color',
      severity: 'warning',
      message:
        tv.kind === 'utility'
          ? `Tailwind utility "${tv.value}" uses a hardcoded palette color not in the approved token set`
          : `Tailwind arbitrary value "${tv.value}" bypasses the design token system`,
      line: tv.line,
      value: tv.value,
    });
  }

  // Accessibility checks (always on, warning-level).
  for (const a of runAllAccessibilityChecks(code)) {
    result.result.violations.push({
      // ComplianceViolationType doesn't include 'accessibility' — map to 'general'
      type: 'general' as ComplianceViolationType,
      severity: a.severity,
      message: `[a11y] ${a.message}`,
      line: a.line,
    });
  }

  // Recompute compliance + score with the appended violations
  result.result.compliant = result.result.violations.length === 0;
  const errorCount = result.result.violations.filter((v) => v.severity === 'error').length;
  const warningCount = result.result.violations.filter((v) => v.severity === 'warning').length;
  result.result.score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return result;
}

/**
 * Read a source line with optional surrounding context for CLI reporting.
 */
export function readFileSnippet(
  filePath: string,
  line: number,
  context = 1
): { lines: Array<{ n: number; text: string; isTarget: boolean }> } | null {
  try {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const start = Math.max(1, line - context);
    const end = Math.min(lines.length, line + context);
    const out: Array<{ n: number; text: string; isTarget: boolean }> = [];
    for (let i = start; i <= end; i++) {
      out.push({ n: i, text: lines[i - 1] ?? '', isTarget: i === line });
    }
    return { lines: out };
  } catch {
    return null;
  }
}
