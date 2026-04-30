import { runAudit, renderAuditReport } from '../lib/audit-engine.js';
import { adopt as postAdopt, ApiError, type AdoptToken } from '../lib/api-client.js';
import { readConfig } from '../lib/config.js';

export interface AdoptOptions {
  glob?: string;
  apiKey?: string;
  apiUrl?: string;
  project?: string;
  yes?: boolean;
  reviewAll?: boolean;
  mode?: 'merge' | 'replace';
}

const DEFAULT_API_URL = process.env.AIUI_API_URL ?? 'https://aiui.store';

/**
 * Interactive ingest. Runs the audit, asks the user to confirm review-tier
 * candidates, then bulk-imports the approved tokens to the project on the
 * AIUI server via `/llm/adopt`. Auto-promote-tier candidates are committed
 * without prompting.
 */
export async function adopt(opts: AdoptOptions): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const apiKey = opts.apiKey ?? process.env.AIUI_API_KEY;
  if (!apiKey) {
    console.error(
      chalk.red('  Missing API key. Pass --api-key <key> or set AIUI_API_KEY in your environment.')
    );
    console.error(
      chalk.dim(
        '  Generate one in the dashboard at ' + (opts.apiUrl ?? DEFAULT_API_URL) + '/api-keys'
      )
    );
    process.exit(1);
  }

  const config = readConfig(cwd);
  const projectSlug = opts.project ?? config?.projectSlug;
  if (!projectSlug) {
    console.error(
      chalk.red(
        '  Missing project slug. Pass --project <slug> or run `aiui init` in this directory first.'
      )
    );
    process.exit(1);
  }

  const apiUrl = opts.apiUrl ?? config?.apiUrl ?? DEFAULT_API_URL;

  // 1. Scan
  const spinner = ora('Auditing codebase for design patterns...').start();
  const report = await runAudit(cwd, { glob: opts.glob, permissive: true });
  spinner.succeed(`Scanned ${report.filesScanned} files`);

  for (const line of renderAuditReport(report)) {
    console.log(line);
  }

  const auto = report.candidates.filter((c) => c.action === 'auto-promote');
  const review = report.candidates.filter((c) => c.action === 'review');

  if (auto.length === 0 && review.length === 0) {
    console.log(chalk.dim('  Nothing to adopt. Exiting.'));
    return;
  }

  // 2. Confirm
  const confirmed: AdoptToken[] = auto.map((c) => ({
    tokenKey: c.suggestedName,
    tokenType: c.type,
    tokenValue: c.value,
    description: `Auto-promoted from ${c.count} uses across ${c.files.length} file(s).`,
  }));

  if (review.length > 0 && !opts.yes) {
    const prompts = (await import('prompts')).default;
    if (opts.reviewAll) {
      const { selected } = await prompts({
        type: 'multiselect',
        name: 'selected',
        message: `Pick which review-tier candidates to promote (${review.length}):`,
        choices: review.map((c) => ({
          title: `${c.value}  ${chalk.dim(c.type)} ×${c.count} → ${c.suggestedName}`,
          value: c.suggestedName,
          selected: false,
        })),
      });
      const selectedSet = new Set<string>(selected ?? []);
      for (const c of review) {
        if (selectedSet.has(c.suggestedName)) {
          confirmed.push({
            tokenKey: c.suggestedName,
            tokenType: c.type,
            tokenValue: c.value,
            description: `Promoted from ${c.count} uses across ${c.files.length} file(s).`,
          });
        }
      }
    } else {
      console.log(
        chalk.dim(
          '  Skipping review-tier (' + review.length + '). Pass --review-all to triage them.'
        )
      );
    }
  } else if (review.length > 0 && opts.yes) {
    for (const c of review) {
      confirmed.push({
        tokenKey: c.suggestedName,
        tokenType: c.type,
        tokenValue: c.value,
        description: `Promoted from ${c.count} uses across ${c.files.length} file(s).`,
      });
    }
  }

  if (confirmed.length === 0) {
    console.log(chalk.dim('  No tokens selected. Exiting.'));
    return;
  }

  // 3. Push
  const pushSpinner = ora(
    `Pushing ${confirmed.length} token(s) to project "${projectSlug}"...`
  ).start();
  try {
    const result = await postAdopt(apiUrl, apiKey, projectSlug, {
      tokens: confirmed,
      mode: opts.mode ?? 'merge',
      source: {
        scannedAt: report.scannedAt,
        filesScanned: report.filesScanned,
        coverageEstimate: report.coverageEstimate,
      },
    });
    pushSpinner.succeed(
      `Adopted: ${chalk.green(result.promoted)} new · ${chalk.dim(result.skipped)} skipped` +
        (result.updated > 0 ? ` · ${chalk.cyan(result.updated)} updated` : '')
    );
    if (result.errors.length > 0) {
      console.log(chalk.yellow(`  ${result.errors.length} token(s) failed:`));
      for (const e of result.errors) {
        console.log(`    ${chalk.dim('×')} ${e.key}: ${e.reason}`);
      }
    }
    console.log('');
    console.log(
      chalk.dim(
        '  Next: run ' +
          chalk.cyan('aiui sync') +
          ' to refresh local .aiui/ files, or use the MCP `sync_design_memory` tool from your AI agent.'
      )
    );
    console.log('');
  } catch (err) {
    if (err instanceof ApiError) {
      pushSpinner.fail(`Server rejected adoption (HTTP ${err.status}): ${err.message}`);
    } else {
      pushSpinner.fail(`Failed to push: ${err instanceof Error ? err.message : err}`);
    }
    process.exit(1);
  }
}
