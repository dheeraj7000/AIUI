import * as fs from 'node:fs';
import * as path from 'node:path';
import { checkTokenCompliance } from '@aiui/design-core';
import type { ComplianceResult } from '@aiui/design-core';

export interface ApprovedToken {
  tokenKey: string;
  tokenValue: string;
  tokenType: string;
}

export interface FileResult {
  filePath: string;
  result: ComplianceResult;
}

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
      `No tokens found in ${tokensPath}. Ensure the file contains token categories (color, font, radius, etc.).`
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
 * Scan a single file for token compliance violations.
 */
export function scanFile(filePath: string, tokens: ApprovedToken[]): FileResult {
  const code = fs.readFileSync(filePath, 'utf-8');
  const result = checkTokenCompliance(code, tokens);
  return { filePath, result };
}
