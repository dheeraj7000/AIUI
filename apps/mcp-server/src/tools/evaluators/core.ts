/**
 * Shared primitives for the project-aware taste evaluators
 * (typography / color palette / visual density). Each evaluator stays
 * focused on its domain; these helpers handle token loading + classification
 * + scoring math so the per-domain code is small and testable.
 */

import { eq } from 'drizzle-orm';
import { styleTokens } from '@aiui/design-core';
import type { Database } from '@aiui/design-core';

export type Severity = 'info' | 'warning' | 'error';

export interface EvaluatorIssue {
  code: string; // stable id like 'typography.scale.unknown-size'
  severity: Severity;
  message: string;
  location?: { line?: number; col?: number; snippet?: string };
  suggestion?: string;
}

export interface EvaluatorResult {
  /** 0–100 — higher is better. */
  score: number;
  /** Project-specific summary metrics (counts, ratios) for the LLM to reason over. */
  metrics: Record<string, number>;
  /** Token alignment summary so the LLM can see what the project expects. */
  expected: Record<string, string[]>;
  /** What the code actually used, normalized. */
  observed: Record<string, string[]>;
  issues: EvaluatorIssue[];
  /** One-paragraph natural-language summary for chat output. */
  summary: string;
}

/**
 * Load the project's tokens grouped by `tokenType`. Used by every
 * evaluator to know what the project considers "approved".
 */
export async function loadProjectTokens(
  db: Database,
  projectId: string
): Promise<Record<string, Array<{ key: string; value: string }>>> {
  const rows = await db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenType: styleTokens.tokenType,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, projectId));

  const grouped: Record<string, Array<{ key: string; value: string }>> = {};
  for (const r of rows) {
    if (!grouped[r.tokenType]) grouped[r.tokenType] = [];
    grouped[r.tokenType].push({ key: r.tokenKey, value: r.tokenValue });
  }
  return grouped;
}

/**
 * Lower-case set of approved token *values* for a type, used for
 * "is this value in the token set" lookups.
 */
export function approvedValueSet(
  tokens: Record<string, Array<{ key: string; value: string }>>,
  type: string
): Set<string> {
  return new Set((tokens[type] ?? []).map((t) => t.value.toLowerCase()));
}

/**
 * Compute a 0–100 score from issues. Errors cost 20, warnings cost 5,
 * info costs 1. Caller can adjust by passing weights.
 */
export function scoreFromIssues(
  issues: EvaluatorIssue[],
  weights: { error?: number; warning?: number; info?: number } = {}
): number {
  const w = { error: 20, warning: 5, info: 1, ...weights };
  let s = 100;
  for (const i of issues) {
    if (i.severity === 'error') s -= w.error;
    else if (i.severity === 'warning') s -= w.warning;
    else s -= w.info;
  }
  return Math.max(0, Math.min(100, s));
}

/**
 * Match every Tailwind utility / arbitrary value in `code` whose prefix
 * is in `prefixes`. Returns each occurrence as `{ prefix, value, isArbitrary }`.
 *
 * - `bg-primary`     → { prefix: 'bg-', value: 'primary',  isArbitrary: false }
 * - `text-[14px]`    → { prefix: 'text-', value: '14px',   isArbitrary: true }
 *
 * The prefixes can be exact (`text-`) or include open-ended sub-prefixes;
 * the matcher prefers the longest prefix from `prefixes` so e.g.
 * `border-x-[2px]` matches `border-x-` not `border-`.
 */
export function matchClasses(
  code: string,
  prefixes: string[]
): Array<{ prefix: string; value: string; isArbitrary: boolean }> {
  const sorted = [...prefixes].sort((a, b) => b.length - a.length); // longest first
  const out: Array<{ prefix: string; value: string; isArbitrary: boolean }> = [];

  // Generic utility: prefix-followed-by-non-bracket, e.g. `bg-primary`, `text-lg`
  const utilRe = /(?<![A-Za-z0-9_-])([a-z][a-z0-9-]*-)([a-z][a-z0-9_-]*)(?!\[)/g;
  // Arbitrary: prefix-followed-by-bracket, e.g. `bg-[#FF5733]`
  const arbRe = /(?<![A-Za-z0-9_-])([a-z][a-z0-9-]*-)\[([^\]\s]+)\]/g;

  for (const re of [utilRe, arbRe] as const) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const fullPrefix = m[1];
      // Find the longest configured prefix that's a prefix-of-or-equal-to fullPrefix
      const matchingPrefix = sorted.find((p) => fullPrefix === p || fullPrefix.startsWith(p));
      if (!matchingPrefix) continue;
      out.push({
        prefix: matchingPrefix,
        value: m[2],
        isArbitrary: re === arbRe,
      });
    }
  }
  return out;
}

/**
 * Pick distinct values (preserving insertion order) for terse summaries.
 */
export function distinct<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}
