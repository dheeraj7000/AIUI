import {
  approvedValueSet,
  distinct,
  matchClasses,
  scoreFromIssues,
  type EvaluatorIssue,
  type EvaluatorResult,
} from './core';

const TRANSITION_PREFIXES = [
  'transition-', // transition-all, transition-colors, transition-[height]
  'duration-',
  'ease-',
  'delay-',
];
const ANIMATION_PREFIXES = ['animate-'];

const TIMING_FN_RE =
  /\b(?:ease-in|ease-out|ease-in-out|linear|steps\([^)]*\)|cubic-bezier\([^)]*\))\b/g;
const DURATION_LITERAL_RE = /\b(\d+)(ms|s)\b/g;
const PREFERS_REDUCED_MOTION_RE = /@media\s*\([^)]*prefers-reduced-motion[^)]*\)/i;

/**
 * Project-aware motion evaluator. Scores animation + transition discipline.
 *
 * What good motion looks like (in 2026):
 * - 1–3 distinct durations (fast / medium / slow)
 * - 1–2 timing functions
 * - Always respects `prefers-reduced-motion`
 * - Used for feedback (state changes), not pure decoration
 *
 * What this evaluator catches:
 * - Arbitrary `duration-[123ms]` values bypassing the project's timing scale
 * - Wide diversity (5+ distinct durations or timing fns)
 * - Missing reduced-motion safeguard for code with non-trivial motion
 * - Animation use without any project animation/transition tokens defined
 */
export function evaluateMotion(
  code: string,
  tokens: Record<string, Array<{ key: string; value: string }>>
): EvaluatorResult {
  const issues: EvaluatorIssue[] = [];

  const transitionMatches = matchClasses(code, TRANSITION_PREFIXES);
  const animateMatches = matchClasses(code, ANIMATION_PREFIXES);

  const durationsObserved = new Set<string>();
  const easingsObserved = new Set<string>();
  const animationsObserved = new Set<string>();
  let arbitraryCount = 0;

  for (const m of transitionMatches) {
    if (m.prefix === 'duration-') durationsObserved.add(m.value);
    if (m.prefix === 'ease-') easingsObserved.add(m.value);
    if (m.isArbitrary) {
      arbitraryCount++;
      issues.push({
        code: 'motion.arbitrary',
        severity: 'warning',
        message: `\`${m.prefix}[${m.value}]\` bypasses the project's motion scale.`,
        suggestion: 'Promote this duration / easing as an animation or transition token.',
      });
    }
  }

  for (const m of animateMatches) {
    animationsObserved.add(m.value);
    if (m.isArbitrary) {
      arbitraryCount++;
    }
  }

  // Inline style + CSS literals
  for (const m of code.matchAll(DURATION_LITERAL_RE)) {
    durationsObserved.add(`${m[1]}${m[2]}`);
  }
  for (const m of code.matchAll(TIMING_FN_RE)) {
    easingsObserved.add(m[0].toLowerCase());
  }

  const totalMotion = transitionMatches.length + animateMatches.length;

  // Diversity checks
  if (durationsObserved.size > 5) {
    issues.push({
      code: 'motion.duration.diversity',
      severity: 'warning',
      message: `${durationsObserved.size} distinct duration values used. Pick 2–3 (fast / medium / slow) and reuse.`,
    });
  }
  if (easingsObserved.size > 3) {
    issues.push({
      code: 'motion.easing.diversity',
      severity: 'warning',
      message: `${easingsObserved.size} distinct timing functions used. Pick 1–2 and reuse.`,
    });
  }

  // Reduced-motion safeguard
  if (totalMotion >= 3 && !PREFERS_REDUCED_MOTION_RE.test(code)) {
    issues.push({
      code: 'motion.reduced-motion.missing',
      severity: 'warning',
      message:
        'Motion is present but no `prefers-reduced-motion` media query found. Wrap transitions / animations to disable for users who request reduced motion.',
      suggestion:
        'Add `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }` or equivalent Tailwind config.',
    });
  }

  // Token-set adherence (for projects that DO define motion tokens)
  const approvedDurations = approvedValueSet(tokens, 'animation');
  const approvedTransitions = approvedValueSet(tokens, 'transition');
  const approved = new Set([...approvedDurations, ...approvedTransitions]);

  if (approved.size > 0) {
    for (const d of durationsObserved) {
      if (!approved.has(d.toLowerCase())) {
        issues.push({
          code: 'motion.token.unknown-duration',
          severity: 'info',
          message: `Duration \`${d}\` isn't in the project's motion tokens.`,
        });
      }
    }
  }

  const score = scoreFromIssues(issues);
  const summary =
    `Motion ${score >= 90 ? 'on-brand' : score >= 70 ? 'mostly aligned' : score >= 50 ? 'drifting' : 'off-brand'} (${score}/100). ` +
    `${totalMotion} motion class(es); ${durationsObserved.size} duration(s); ${easingsObserved.size} timing fn(s). ` +
    (PREFERS_REDUCED_MOTION_RE.test(code) ? 'Reduced-motion: ✓' : 'Reduced-motion: ✗');

  return {
    score,
    metrics: {
      totalMotionClasses: totalMotion,
      distinctDurations: durationsObserved.size,
      distinctEasings: easingsObserved.size,
      distinctAnimations: animationsObserved.size,
      arbitraryValues: arbitraryCount,
      reducedMotionRespected: PREFERS_REDUCED_MOTION_RE.test(code) ? 1 : 0,
    },
    expected: {
      animation: (tokens['animation'] ?? []).map((t) => `${t.key} = ${t.value}`),
      transition: (tokens['transition'] ?? []).map((t) => `${t.key} = ${t.value}`),
    },
    observed: {
      durations: distinct([...durationsObserved]),
      easings: distinct([...easingsObserved]),
      animations: distinct([...animationsObserved]),
    },
    issues,
    summary,
  };
}
