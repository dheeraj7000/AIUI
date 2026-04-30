import { runAudit, renderAuditReport } from '../lib/audit-engine.js';
import { readGitHubContext, upsertPrComment } from '../lib/github.js';
import { renderAuditComment, emitAuditAnnotations, auditExitCode } from '../lib/ci-output.js';
import { readConfig } from '../lib/config.js';

export interface AuditOptions {
  glob?: string;
  permissive?: boolean;
  json?: boolean;
  ci?: boolean;
  githubComment?: boolean;
  strict?: boolean;
  maxCandidates?: number;
  minCoverage?: number;
  project?: string;
}

/**
 * Read-only audit. Scans the codebase for design-token candidates and prints
 * a report. Never writes to the AIUI server.
 *
 * In `--ci` mode: emits GitHub Actions annotations for each candidate, posts
 * (or updates) a PR comment when --github-comment is set, and exits non-zero
 * if --strict / --max-candidates / --min-coverage thresholds are exceeded.
 */
export async function audit(opts: AuditOptions): Promise<number> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const isCi = opts.ci ?? !!process.env.CI;
  const spinner = isCi ? null : ora('Auditing codebase for design patterns...').start();
  const report = await runAudit(cwd, {
    glob: opts.glob,
    // CI runs are inherently triage-style; show review-tier candidates too
    permissive: opts.permissive ?? isCi,
  });
  spinner?.succeed(`Scanned ${report.filesScanned} files`);

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
  } else if (isCi) {
    for (const line of renderAuditReport(report)) console.log(line);
    emitAuditAnnotations(report);
  } else {
    for (const line of renderAuditReport(report)) {
      if (line.startsWith('  Auto-promote')) console.log(chalk.green(line));
      else if (line.startsWith('  Needs review')) console.log(chalk.yellow(line));
      else if (line.startsWith('  ✓')) console.log(chalk.green(line));
      else console.log(line);
    }
    if (report.candidates.some((c) => c.action === 'auto-promote' || c.action === 'review')) {
      console.log(
        chalk.dim('  Next: run ' + chalk.cyan('aiui adopt') + ' to commit these as project tokens.')
      );
      console.log('');
    }
  }

  if (opts.githubComment) {
    const ctx = readGitHubContext();
    if (!ctx) {
      console.error(
        '[aiui audit] --github-comment skipped: missing GITHUB_TOKEN / GITHUB_REPOSITORY / GITHUB_EVENT_PATH or no PR number in event.'
      );
    } else {
      const config = readConfig(cwd);
      const projectSlug = opts.project ?? config?.projectSlug;
      const runUrl =
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : undefined;
      try {
        await upsertPrComment(ctx, renderAuditComment(report, { projectSlug, runUrl }));
      } catch (err) {
        console.error(
          `[aiui audit] failed to post PR comment: ${err instanceof Error ? err.message : err}`
        );
      }
    }
  }

  return auditExitCode(report, {
    strict: opts.strict,
    maxCandidates: opts.maxCandidates,
    minCoverage: opts.minCoverage,
  });
}
