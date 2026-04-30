import * as fs from 'node:fs';
import { glob } from 'glob';
import { detectPatterns, type Pattern, type PatternType } from './pattern-detector.js';

export interface AuditTokenCandidate extends Pattern {
  /** Recommended action for this candidate. */
  action: 'auto-promote' | 'review' | 'ignore';
  /** Confidence 0–1 that this is a real design token (not noise). */
  confidence: number;
}

export interface AuditReport {
  scanRoot: string;
  scannedAt: string;
  filesScanned: number;
  /** Candidates the audit thinks are token-worthy. */
  candidates: AuditTokenCandidate[];
  /** Total raw hardcoded color literals in CSS-property positions. */
  hardcodedColors: number;
  /** Total `[…]` Tailwind arbitrary-value usages. */
  arbitraryValues: number;
  /** Coverage estimate: % of styling decisions that already reference a token. */
  coverageEstimate: number;
  /** Tokens grouped by type for the summary header. */
  byType: Record<PatternType, number>;
}

const AUTO_PROMOTE_THRESHOLD = 5;
const REVIEW_THRESHOLD = 2;

/**
 * Heuristic confidence: more uses + more contexts + recognizable type =
 * higher confidence the value belongs in the design system.
 */
function scoreCandidate(p: Pattern): number {
  let s = 0;
  s += Math.min(0.5, p.count / 20); // up to 0.5 for usage count
  s += Math.min(0.2, p.contexts.length / 5); // up to 0.2 for context diversity
  s += p.type !== 'other' ? 0.2 : 0; // 0.2 for typed
  s += p.files.length >= 3 ? 0.1 : 0; // 0.1 for cross-file presence
  return Math.min(1, s);
}

function classify(p: Pattern, conf: number): AuditTokenCandidate['action'] {
  if (p.type === 'other' || conf < 0.3) return 'ignore';
  if (p.count >= AUTO_PROMOTE_THRESHOLD && conf >= 0.6) return 'auto-promote';
  if (p.count >= REVIEW_THRESHOLD) return 'review';
  return 'ignore';
}

/**
 * Estimate "what fraction of styling decisions already use a token" by
 * counting tokenish references (Tailwind utilities like `bg-primary`) vs
 * arbitrary values (`bg-[#FF5733]`) in the same prefix space.
 */
function estimateCoverage(content: string): { tokenish: number; arbitrary: number } {
  // Tokenish: prefix-followed-by-non-bracket, e.g. `bg-primary`, `text-lg`
  const tokenishRe =
    /(?<![A-Za-z0-9_-])(bg|text|border|ring|p|m|gap|w|h|rounded|font)-[a-z][a-z0-9-]*(?!\[)/g;
  // Arbitrary: prefix-followed-by-bracket
  const arbRe = /(?<![A-Za-z0-9_-])[a-z][a-z0-9-]*-\[[^\]\s]+\]/g;
  const tokenish = (content.match(tokenishRe) ?? []).length;
  const arbitrary = (content.match(arbRe) ?? []).length;
  return { tokenish, arbitrary };
}

export interface RunAuditOptions {
  /** File glob to scan. Defaults to `src/**\/*.{tsx,jsx,ts,js,css,html}`. */
  glob?: string;
  /** Lower the auto-promote threshold for richer first-time onboarding. */
  permissive?: boolean;
  /** Extra value strings to ignore. */
  ignore?: string[];
}

export async function runAudit(cwd: string, opts: RunAuditOptions = {}): Promise<AuditReport> {
  const scannedAt = new Date().toISOString();
  const fileGlob = opts.glob ?? 'src/**/*.{tsx,jsx,ts,js,css,html}';

  const files = await glob(fileGlob, { cwd, absolute: true });
  let totalTokenish = 0;
  let totalArbitrary = 0;
  let totalHardcodedColors = 0;
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    const { tokenish, arbitrary } = estimateCoverage(content);
    totalTokenish += tokenish;
    totalArbitrary += arbitrary;
    totalHardcodedColors += (content.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length;
  }

  const patterns = await detectPatterns(cwd, {
    minCount: REVIEW_THRESHOLD, // always pull review-tier; classify per-pattern
    ignore: opts.ignore,
    glob: fileGlob,
  });

  const candidates: AuditTokenCandidate[] = patterns
    .map((p) => {
      const confidence = scoreCandidate(p);
      const action = classify(p, confidence);
      return { ...p, confidence, action };
    })
    // In strict (non-permissive) mode, hide "review" and "ignore" rows so the
    // first-line audit output isn't noisy. Permissive mode shows everything.
    .filter((c) => (opts.permissive ? c.action !== 'ignore' : c.action === 'auto-promote'));

  const byType = candidates.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<PatternType, number>
  );

  const totalDecisions = totalTokenish + totalArbitrary + totalHardcodedColors;
  const coverageEstimate =
    totalDecisions === 0 ? 0 : Math.round((totalTokenish / totalDecisions) * 100);

  return {
    scanRoot: cwd,
    scannedAt,
    filesScanned: files.length,
    candidates,
    hardcodedColors: totalHardcodedColors,
    arbitraryValues: totalArbitrary,
    coverageEstimate,
    byType,
  };
}

/**
 * Render an audit report as CLI text. Returns lines (caller joins with \n).
 */
export function renderAuditReport(r: AuditReport): string[] {
  const lines: string[] = [];
  lines.push('');
  lines.push(`  Audit · ${r.scanRoot}`);
  lines.push(`  Scanned ${r.filesScanned} files · ${new Date(r.scannedAt).toLocaleTimeString()}`);
  lines.push('');
  lines.push(`  Coverage estimate: ${r.coverageEstimate}% (token references vs hardcoded values)`);
  lines.push(`  Hardcoded colors:  ${r.hardcodedColors}`);
  lines.push(`  Arbitrary values:  ${r.arbitraryValues}  (Tailwind \`[…]\` bypass)`);
  lines.push('');

  if (r.candidates.length === 0) {
    lines.push('  ✓ No promotion candidates above threshold. Codebase is either tiny or pristine.');
    return lines;
  }

  const auto = r.candidates.filter((c) => c.action === 'auto-promote');
  const review = r.candidates.filter((c) => c.action === 'review');

  if (auto.length > 0) {
    lines.push(`  Auto-promote (${auto.length}) — used ≥5×, high confidence:`);
    for (const c of auto) {
      lines.push(
        `    ${c.value.padEnd(14)} ${c.type.padEnd(12)} ×${String(c.count).padEnd(3)} → ${c.suggestedName}`
      );
    }
    lines.push('');
  }

  if (review.length > 0) {
    lines.push(`  Needs review (${review.length}) — used 2-4× or ambiguous:`);
    for (const c of review) {
      lines.push(
        `    ${c.value.padEnd(14)} ${c.type.padEnd(12)} ×${String(c.count).padEnd(3)} → ${c.suggestedName}`
      );
    }
    lines.push('');
  }

  return lines;
}
