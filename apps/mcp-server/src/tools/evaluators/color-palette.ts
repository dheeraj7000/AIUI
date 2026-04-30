import {
  approvedValueSet,
  distinct,
  matchClasses,
  scoreFromIssues,
  type EvaluatorIssue,
  type EvaluatorResult,
} from './core';

const COLOR_BEARING_PREFIXES = [
  'bg-',
  'text-',
  'border-',
  'ring-',
  'from-',
  'to-',
  'via-',
  'outline-',
  'decoration-',
  'caret-',
  'accent-',
  'fill-',
  'stroke-',
  'placeholder-',
];

const HEX_RE = /#[0-9a-f]{3,8}\b/gi;
const RGB_RE = /rgba?\([^)]+\)/gi;
const OKLCH_RE = /oklch\([^)]+\)/gi;

/**
 * Project-aware color palette evaluator.
 *
 * What it scores:
 * - Are colors used drawn from the project's color tokens, or are they
 *   hardcoded hex/rgb literals?
 * - Is the palette diverse enough to feel intentional but not so wide
 *   that it loses identity (rule of thumb: 4–8 distinct colors is healthy)
 * - Do the project's "brand" / "accent" tokens actually appear in the
 *   code? (a token defined but never used signals scope drift)
 * - Are semantic-role tokens (`destructive`, `success`, `warning`) used
 *   only in their semantic positions?
 */
export function evaluateColorPalette(
  code: string,
  tokens: Record<string, Array<{ key: string; value: string }>>
): EvaluatorResult {
  const issues: EvaluatorIssue[] = [];
  const tokenColors = tokens['color'] ?? [];
  const approvedValues = approvedValueSet(tokens, 'color');
  const approvedNames = new Set(tokenColors.map((t) => t.key.split('.').pop() ?? t.key));

  // 1. Hardcoded color literals (hex / rgb / oklch / hsl)
  const literalsObserved = new Set<string>();
  for (const re of [HEX_RE, RGB_RE, OKLCH_RE] as const) {
    for (const m of code.matchAll(re)) {
      literalsObserved.add(m[0].toLowerCase());
    }
  }
  for (const lit of literalsObserved) {
    if (!approvedValues.has(lit)) {
      issues.push({
        code: 'color.literal.unknown',
        severity: 'warning',
        message: `Hardcoded color literal \`${lit}\` is not in the project's color tokens.`,
        suggestion: 'Promote it via `promote_pattern` (color type), or swap for an existing token.',
      });
    }
  }

  // 2. Color-bearing Tailwind utilities + arbitrary values
  const tailwindMatches = matchClasses(code, COLOR_BEARING_PREFIXES);
  const utilityColorsObserved = new Set<string>();
  for (const m of tailwindMatches) {
    if (m.isArbitrary) {
      // Anything inside `bg-[…]` etc. is a literal — handled via the literal pass already, but
      // we still want to surface the bypass on the utility level for the issue list.
      issues.push({
        code: 'color.utility.arbitrary',
        severity: 'warning',
        message: `\`${m.prefix}[${m.value}]\` bypasses the project's color tokens.`,
        suggestion: 'Promote this as a color token, or use an existing one.',
      });
      continue;
    }
    // For utility values like `bg-primary` / `text-red-500` — check semantic tokens
    // The base name (the last segment of the token key) is what Tailwind would use
    // if the user has wired their tokens into their tailwind.config. Compare loosely.
    const baseName = m.value.split('-')[0]; // text-red-500 → red
    utilityColorsObserved.add(m.value);
    if (approvedNames.size > 0 && !approvedNames.has(baseName) && !approvedNames.has(m.value)) {
      // Only warn for non-default-Tailwind palette references
      const isDefaultTailwindShade =
        /^(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(-(50|100|200|300|400|500|600|700|800|900|950))?$/.test(
          m.value
        );
      if (isDefaultTailwindShade) {
        issues.push({
          code: 'color.tailwind.raw-palette',
          severity: 'info',
          message: `\`${m.prefix}${m.value}\` uses Tailwind's raw palette directly. Prefer the project's semantic color tokens (\`${m.prefix}primary\`, \`${m.prefix}accent\`).`,
        });
      }
    }
  }

  // 3. Palette diversity
  const totalDistinctColors = distinct([...literalsObserved, ...utilityColorsObserved]).length;
  if (totalDistinctColors > 10) {
    issues.push({
      code: 'color.palette.too-wide',
      severity: 'warning',
      message: `${totalDistinctColors} distinct colors detected. A focused palette (4–8) reads as more intentional.`,
    });
  }

  // 4. Brand / accent presence — if the project defines a brand or accent
  // token, flag when the code doesn't reference it at all (probably a design oversight)
  const brandTokenKeys = tokenColors
    .filter((t) => /brand|primary|accent/i.test(t.key))
    .map((t) => t.key.split('.').pop() ?? t.key);
  for (const key of brandTokenKeys) {
    const usedAsClass = utilityColorsObserved.has(key);
    const usedAsLiteral = (() => {
      const tok = tokenColors.find((t) => (t.key.split('.').pop() ?? t.key) === key);
      return tok && literalsObserved.has(tok.value.toLowerCase());
    })();
    if (!usedAsClass && !usedAsLiteral && tailwindMatches.length > 3) {
      issues.push({
        code: 'color.brand.absent',
        severity: 'info',
        message: `Brand color \`${key}\` is defined but not referenced in this snippet. Consider whether the primary/accent surface should use it.`,
      });
    }
  }

  // 5. Semantic mis-use: `destructive` token outside of error/warning/delete contexts
  const destructiveLikeTokens = tokenColors
    .filter((t) => /destructive|danger|error/i.test(t.key))
    .map((t) => t.key.split('.').pop() ?? t.key);
  for (const key of destructiveLikeTokens) {
    const usages = tailwindMatches.filter((m) => m.value === key);
    for (const u of usages) {
      // Heuristic: surrounding 80 chars should mention error/delete/warning/danger words
      // We need to find the position of this match in the code
      const escapedClass = `${u.prefix}${u.value}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escapedClass, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(code)) !== null) {
        const window = code.slice(Math.max(0, m.index - 80), m.index + 80);
        if (!/error|delet|destruct|danger|warn|fail/i.test(window)) {
          issues.push({
            code: 'color.semantic.misuse',
            severity: 'warning',
            message: `\`${escapedClass}\` is a destructive-role token but appears in non-error context. Use a neutral or accent color instead.`,
          });
          break; // one issue per token is enough
        }
      }
    }
  }

  const score = scoreFromIssues(issues);
  const summary =
    `Color palette ${score >= 90 ? 'on-brand' : score >= 70 ? 'mostly aligned' : score >= 50 ? 'drifting' : 'off-brand'} (${score}/100). ` +
    `${totalDistinctColors} distinct color(s); ${literalsObserved.size} hardcoded literal(s).`;

  return {
    score,
    metrics: {
      distinctColors: totalDistinctColors,
      hardcodedLiterals: literalsObserved.size,
      arbitraryUtilities: tailwindMatches.filter((m) => m.isArbitrary).length,
      tokenColorsDefined: tokenColors.length,
    },
    expected: {
      tokens: tokenColors.map((t) => `${t.key} = ${t.value}`),
    },
    observed: {
      literals: distinct([...literalsObserved]),
      utilities: distinct([...utilityColorsObserved]),
    },
    issues,
    summary,
  };
}
