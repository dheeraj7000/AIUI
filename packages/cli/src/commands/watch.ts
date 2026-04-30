import * as fs from 'node:fs';
import * as path from 'node:path';
import { runAudit, type AuditTokenCandidate } from '../lib/audit-engine.js';

export interface WatchOptions {
  glob?: string;
  intervalMs?: number;
}

/**
 * Continuous local watcher. Polls the codebase on an interval; when new
 * design-token candidates appear (or existing ones cross the promotion
 * threshold), it surfaces them. Quietly idle when nothing changes.
 *
 * Polling instead of fs.watch because:
 *   - editors do atomic-rename saves that fs.watch handles inconsistently
 *   - we only care about *aggregate* changes (a single edit usually doesn't
 *     change the candidate set), so a 4-second poll is fine
 *   - no extra deps
 */
export async function watch(opts: WatchOptions): Promise<void> {
  const cwd = process.cwd();
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;
  const intervalMs = opts.intervalMs ?? 4000;

  console.log('');
  console.log(chalk.bold('  AIUI watch') + chalk.dim(` · ${cwd}`));
  console.log(chalk.dim(`  Polling every ${Math.round(intervalMs / 1000)}s · Ctrl-C to stop`));
  console.log('');

  // Snapshot mtime sum so we don't re-scan when nothing changed
  function dirSignature(): number {
    const root = path.join(cwd, 'src');
    if (!fs.existsSync(root)) return 0;
    let sig = 0;
    function walk(dir: string) {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else {
          try {
            sig += fs.statSync(full).mtimeMs;
          } catch {
            // ignore — file may have just been deleted
          }
        }
      }
    }
    walk(root);
    return sig;
  }

  let lastSig = dirSignature();
  let lastCandidates = new Map<string, AuditTokenCandidate>();
  // Initial scan so the first delta has a baseline
  const initial = await runAudit(cwd, { glob: opts.glob, permissive: true });
  for (const c of initial.candidates) {
    lastCandidates.set(c.suggestedName, c);
  }
  console.log(
    chalk.dim(
      `  Baseline: ${initial.candidates.length} candidate(s) · ${initial.coverageEstimate}% coverage`
    )
  );
  console.log('');

  while (true) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const sig = dirSignature();
    if (sig === lastSig) continue;
    lastSig = sig;

    const spinner = ora('Re-scanning...').start();
    let report;
    try {
      report = await runAudit(cwd, { glob: opts.glob, permissive: true });
    } catch (err) {
      spinner.fail(`scan failed: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    spinner.stop();

    const current = new Map<string, AuditTokenCandidate>();
    for (const c of report.candidates) current.set(c.suggestedName, c);

    const newOrEscalated: AuditTokenCandidate[] = [];
    for (const [name, c] of current) {
      const prev = lastCandidates.get(name);
      if (!prev) {
        newOrEscalated.push(c);
        continue;
      }
      if (prev.action !== 'auto-promote' && c.action === 'auto-promote') {
        newOrEscalated.push(c);
      }
    }

    if (newOrEscalated.length === 0) {
      console.log(
        chalk.dim(
          `  ${new Date().toLocaleTimeString()} · no new candidates · ${report.coverageEstimate}% coverage`
        )
      );
    } else {
      console.log(
        chalk.yellow(
          `  ${new Date().toLocaleTimeString()} · ${newOrEscalated.length} new candidate(s):`
        )
      );
      for (const c of newOrEscalated) {
        const tag =
          c.action === 'auto-promote' ? chalk.green('auto-promote') : chalk.yellow('review');
        console.log(
          `    ${tag}  ${chalk.bold(c.value)}  ${chalk.dim(c.type)} ×${c.count} → ${c.suggestedName}`
        );
      }
      console.log(chalk.dim('    Run ' + chalk.cyan('aiui adopt') + ' to commit these.'));
    }

    lastCandidates = current;
  }
}
