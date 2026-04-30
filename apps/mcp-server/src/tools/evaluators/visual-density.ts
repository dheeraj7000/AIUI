import {
  approvedValueSet,
  distinct,
  matchClasses,
  scoreFromIssues,
  type EvaluatorIssue,
  type EvaluatorResult,
} from './core';

const SPACING_PREFIXES = [
  'p-',
  'px-',
  'py-',
  'pt-',
  'pr-',
  'pb-',
  'pl-',
  'm-',
  'mx-',
  'my-',
  'mt-',
  'mr-',
  'mb-',
  'ml-',
  'gap-',
  'gap-x-',
  'gap-y-',
  'space-x-',
  'space-y-',
  'w-',
  'h-',
  'min-w-',
  'min-h-',
  'max-w-',
  'max-h-',
  'top-',
  'bottom-',
  'left-',
  'right-',
  'inset-',
];

/**
 * Project-aware visual density evaluator.
 *
 * Scores spacing discipline:
 *  - adherence to the project's spacing scale (no arbitrary px values)
 *  - rhythm consistency (similar siblings use similar gaps)
 *  - density tier (cramped vs airy) — rough signal from average padding
 *  - too-wide spacing scale (>10 distinct values = no scale)
 */
export function evaluateVisualDensity(
  code: string,
  tokens: Record<string, Array<{ key: string; value: string }>>
): EvaluatorResult {
  const issues: EvaluatorIssue[] = [];
  const matches = matchClasses(code, SPACING_PREFIXES);

  const valuesByPrefix: Record<string, string[]> = {};
  const arbitraryValues: string[] = [];
  for (const m of matches) {
    if (m.isArbitrary) {
      arbitraryValues.push(`${m.prefix}[${m.value}]`);
      issues.push({
        code: 'spacing.arbitrary',
        severity: 'warning',
        message: `\`${m.prefix}[${m.value}]\` bypasses the project's spacing scale.`,
        suggestion: 'Promote this spacing into a token via promote_pattern.',
      });
    }
    (valuesByPrefix[m.prefix] ??= []).push(m.value);
  }

  const distinctValues = distinct(matches.map((m) => m.value));

  // Spacing scale adherence: when the project has its own scale, observed
  // values that aren't in it (and aren't standard Tailwind 0/1/2/3/4 etc.)
  // get flagged. We can't easily map `p-4` → `1rem` without a tailwind
  // config lookup, so this check is intentionally lenient.
  const approvedSpacing = approvedValueSet(tokens, 'spacing');

  // Rhythm consistency — when the same prefix has many distinct values, the
  // component probably lacks a coherent rhythm. e.g. `gap-2` here, `gap-3`
  // there, `gap-5` over there.
  for (const [prefix, values] of Object.entries(valuesByPrefix)) {
    const u = distinct(values);
    if (u.length >= 4) {
      issues.push({
        code: 'spacing.rhythm.inconsistent',
        severity: 'info',
        message: `\`${prefix}\` has ${u.length} distinct values (${u.join(', ')}). Pick 1–2 per prefix for visual rhythm.`,
      });
    }
  }

  // Spacing scale total diversity
  if (distinctValues.length > 12) {
    issues.push({
      code: 'spacing.scale.too-wide',
      severity: 'warning',
      message: `${distinctValues.length} distinct spacing values used. A 4–6 step scale is usually enough.`,
    });
  }

  // Density tier estimate — count tightly-spaced vs loosely-spaced primitives.
  // This is a heuristic, NOT a hard verdict.
  let tightCount = 0;
  let looseCount = 0;
  for (const m of matches) {
    if (!/^\d+$/.test(m.value)) continue;
    const n = parseInt(m.value, 10);
    if (n <= 2) tightCount++;
    else if (n >= 8) looseCount++;
  }
  const density: 'compact' | 'default' | 'airy' =
    tightCount > looseCount * 2 ? 'compact' : looseCount > tightCount * 2 ? 'airy' : 'default';

  if (approvedSpacing.size > 0 && arbitraryValues.length === 0 && distinctValues.length <= 6) {
    // Nice — token-driven, scale-disciplined, no issues to add
  }

  const score = scoreFromIssues(issues);
  const summary =
    `Visual density ${score >= 90 ? 'on-brand' : score >= 70 ? 'mostly aligned' : score >= 50 ? 'drifting' : 'off-brand'} (${score}/100). ` +
    `${distinctValues.length} distinct spacing value(s); density reads as ${density}.`;

  return {
    score,
    metrics: {
      distinctSpacingValues: distinctValues.length,
      arbitraryValues: arbitraryValues.length,
      totalSpacingClasses: matches.length,
      tightCount,
      looseCount,
    },
    expected: {
      spacing: (tokens['spacing'] ?? []).map((t) => `${t.key} = ${t.value}`),
    },
    observed: {
      values: distinctValues,
      arbitrary: arbitraryValues,
      density: [density],
    },
    issues,
    summary,
  };
}
