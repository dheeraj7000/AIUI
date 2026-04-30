/**
 * Render an AuditReport (or AdoptResponse) into the formats CI tooling
 * understands: GitHub PR comment markdown, GitHub Actions annotations,
 * machine-readable JSON.
 */

import { COMMENT_SENTINEL, emitAnnotation } from './github.js';
import type { AuditReport, AuditTokenCandidate } from './audit-engine.js';
import type { AdoptResponse } from './api-client.js';

function badge(label: string, value: string | number): string {
  return `**${label}:** ${value}`;
}

function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return '';
  const head = `| ${headers.join(' | ')} |`;
  const sep = `|${headers.map(() => '---').join('|')}|`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function emoji(report: AuditReport): string {
  if (report.coverageEstimate >= 80) return '✅';
  if (report.coverageEstimate >= 50) return '⚠️';
  return '🚨';
}

/**
 * Build the markdown body of a PR comment for an audit run.
 */
export function renderAuditComment(
  report: AuditReport,
  opts: { projectSlug?: string; runUrl?: string } = {}
): string {
  const auto = report.candidates.filter((c) => c.action === 'auto-promote');
  const review = report.candidates.filter((c) => c.action === 'review');

  const lines: string[] = [];
  lines.push(COMMENT_SENTINEL);
  lines.push('');
  lines.push(
    `## ${emoji(report)} AIUI design audit${opts.projectSlug ? ` · \`${opts.projectSlug}\`` : ''}`
  );
  lines.push('');
  lines.push(
    [
      badge('Coverage', `${report.coverageEstimate}%`),
      badge('Hardcoded colors', report.hardcodedColors),
      badge('Arbitrary values', report.arbitraryValues),
      badge('Files scanned', report.filesScanned),
    ].join(' · ')
  );
  lines.push('');

  if (auto.length === 0 && review.length === 0) {
    lines.push('> No promotion candidates detected. Codebase is on track.');
  } else {
    if (auto.length > 0) {
      lines.push(`### Auto-promote candidates (${auto.length})`);
      lines.push(
        table(
          ['Value', 'Type', 'Uses', 'Files', 'Suggested name'],
          auto
            .slice(0, 20)
            .map((c) => [
              `\`${c.value}\``,
              c.type,
              String(c.count),
              String(c.files.length),
              `\`${c.suggestedName}\``,
            ])
        )
      );
      if (auto.length > 20) lines.push(`\n_… and ${auto.length - 20} more._`);
      lines.push('');
    }

    if (review.length > 0) {
      lines.push(`<details><summary>Review-tier candidates (${review.length})</summary>`);
      lines.push('');
      lines.push(
        table(
          ['Value', 'Type', 'Uses', 'Suggested name'],
          review
            .slice(0, 30)
            .map((c) => [`\`${c.value}\``, c.type, String(c.count), `\`${c.suggestedName}\``])
        )
      );
      lines.push('');
      lines.push('</details>');
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(
    [
      '**Suggested next steps:**',
      auto.length > 0 ? '`aiui adopt` to commit auto-promote candidates as project tokens.' : null,
      review.length > 0 ? '`aiui adopt --review-all` to triage review-tier candidates.' : null,
      '`aiui validate src/` to see compliance per file.',
    ]
      .filter(Boolean)
      .join('\n- ')
      .replace(/^/, '- ')
  );

  if (opts.runUrl) {
    lines.push('');
    lines.push(`<sub>[Run details](${opts.runUrl})</sub>`);
  }

  return lines.join('\n');
}

/**
 * Build the markdown body for an `aiui adopt --ci` run report.
 */
export function renderAdoptComment(
  result: AdoptResponse,
  opts: { projectSlug?: string; runUrl?: string } = {}
): string {
  const lines: string[] = [];
  lines.push(COMMENT_SENTINEL);
  lines.push('');
  lines.push(`## ✨ AIUI adoption${opts.projectSlug ? ` · \`${opts.projectSlug}\`` : ''}`);
  lines.push('');
  lines.push(
    [
      badge('Promoted', result.promoted),
      result.updated > 0 ? badge('Updated', result.updated) : null,
      badge('Skipped', result.skipped),
      badge('Total tokens', result.totalTokens),
    ]
      .filter(Boolean)
      .join(' · ')
  );

  if (result.errors.length > 0) {
    lines.push('');
    lines.push(`### Errors (${result.errors.length})`);
    lines.push(
      table(
        ['Token', 'Reason'],
        result.errors.slice(0, 20).map((e) => [`\`${e.key}\``, e.reason])
      )
    );
  }

  if (opts.runUrl) {
    lines.push('');
    lines.push(`<sub>[Run details](${opts.runUrl})</sub>`);
  }
  return lines.join('\n');
}

/**
 * Emit `::warning::` annotations for each candidate so they show up inline
 * on the PR's Files Changed view. Caller is responsible for guarding on
 * `process.env.GITHUB_ACTIONS`.
 */
export function emitAuditAnnotations(report: AuditReport): void {
  for (const c of report.candidates as AuditTokenCandidate[]) {
    if (c.action === 'ignore') continue;
    const file = c.files[0];
    const level = c.action === 'auto-promote' ? 'warning' : 'notice';
    emitAnnotation(
      level,
      `Hardcoded ${c.type} \`${c.value}\` used ${c.count}× — promote as \`${c.suggestedName}\`?`,
      {
        file,
        title: `AIUI: promote ${c.suggestedName}`,
      }
    );
  }
}

/**
 * Compute exit code from an audit run + the user's strictness flags.
 * Returns 0 unless thresholds are exceeded.
 */
export function auditExitCode(
  report: AuditReport,
  opts: { strict?: boolean; maxCandidates?: number; minCoverage?: number }
): number {
  if (opts.strict && (report.candidates.length > 0 || report.arbitraryValues > 0)) return 1;
  if (
    typeof opts.maxCandidates === 'number' &&
    report.candidates.filter((c) => c.action !== 'ignore').length > opts.maxCandidates
  )
    return 1;
  if (typeof opts.minCoverage === 'number' && report.coverageEstimate < opts.minCoverage) return 1;
  return 0;
}
