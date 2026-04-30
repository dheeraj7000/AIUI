import { runAudit, renderAuditReport } from '../lib/audit-engine.js';

export interface AuditOptions {
  glob?: string;
  permissive?: boolean;
  json?: boolean;
}

/**
 * Read-only audit. Scans the codebase for design-token candidates and prints
 * a report. Never writes anything. Useful as a first pass before `aiui adopt`,
 * and as a CI sanity check.
 */
export async function audit(opts: AuditOptions): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const spinner = ora('Auditing codebase for design patterns...').start();
  const report = await runAudit(cwd, {
    glob: opts.glob,
    permissive: opts.permissive,
  });
  spinner.succeed(`Scanned ${report.filesScanned} files`);

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

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
