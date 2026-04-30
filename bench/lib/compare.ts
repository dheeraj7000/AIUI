/**
 * Compare with-AIUI vs without-AIUI runs for each task and write a
 * markdown report to bench/runs/REPORT.md.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureFile, type FileMetrics } from './metrics.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BENCH_ROOT = path.resolve(HERE, '..');
const TASKS_DIR = path.join(BENCH_ROOT, 'tasks');
const RUNS_DIR = path.join(BENCH_ROOT, 'runs');
const WITH = path.join(RUNS_DIR, 'with-aiui');
const WITHOUT = path.join(RUNS_DIR, 'without-aiui');

interface Comparison {
  taskId: string;
  taskTitle: string;
  withMetrics: FileMetrics | null;
  withoutMetrics: FileMetrics | null;
}

function readTaskTitle(taskMdPath: string): string {
  const first = fs.readFileSync(taskMdPath, 'utf-8').split('\n')[0] ?? '';
  return first.replace(/^#\s*/, '').trim();
}

function findTaskFile(dir: string, taskId: string): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith(`${taskId}.`) || f === taskId) {
      return path.join(dir, f);
    }
  }
  return null;
}

function diffNumber(withV: number, withoutV: number, betterIsLower = true): string {
  const delta = withV - withoutV;
  if (delta === 0) return '—';
  const arrow = betterIsLower ? (delta < 0 ? '↓' : '↑') : delta > 0 ? '↑' : '↓';
  const good =
    (betterIsLower && delta < 0) || (!betterIsLower && delta > 0) ? '✅' : delta === 0 ? '' : '⚠️';
  return `${arrow} ${Math.abs(delta).toFixed(0)} ${good}`;
}

function metricRow(label: string, withV: number, withoutV: number, betterIsLower = true): string {
  return `| ${label} | ${withV} | ${withoutV} | ${diffNumber(withV, withoutV, betterIsLower)} |`;
}

function comparisonSection(c: Comparison): string {
  const lines: string[] = [];
  lines.push(`## ${c.taskId} — ${c.taskTitle}`);
  lines.push('');

  if (!c.withMetrics || !c.withoutMetrics) {
    const missing: string[] = [];
    if (!c.withMetrics) missing.push('`with-aiui`');
    if (!c.withoutMetrics) missing.push('`without-aiui`');
    lines.push(
      `> ⚠️ Missing run(s): ${missing.join(', ')}. Drop the generated component into ` +
        `\`bench/runs/{with-aiui,without-aiui}/${c.taskId}.tsx\` and re-run.`
    );
    lines.push('');
    return lines.join('\n');
  }

  const w = c.withMetrics;
  const wo = c.withoutMetrics;

  lines.push('| Metric | With AIUI | Without AIUI | Δ |');
  lines.push('|---|---:|---:|---|');
  lines.push(metricRow('Lines of code', w.loc, wo.loc));
  lines.push(metricRow('Unique colors', w.uniqueColors, wo.uniqueColors));
  lines.push(metricRow('Unique font sizes', w.uniqueFontSizes, wo.uniqueFontSizes));
  lines.push(metricRow('Unique spacing', w.uniqueSpacing, wo.uniqueSpacing));
  lines.push(metricRow('Unique radii', w.uniqueRadii, wo.uniqueRadii));
  lines.push(metricRow('Tailwind arbitrary `[…]`', w.arbitraryValueCount, wo.arbitraryValueCount));
  lines.push(metricRow('Hardcoded hex literals', w.hardcodedHexCount, wo.hardcodedHexCount));
  lines.push(metricRow('a11y violations', w.a11yIssues, wo.a11yIssues));
  lines.push(metricRow('**Quality score (0–100)**', w.qualityScore, wo.qualityScore, false));
  lines.push('');

  const delta = w.qualityScore - wo.qualityScore;
  if (delta > 0) {
    lines.push(`> **AIUI run scored ${delta} points higher.**`);
  } else if (delta < 0) {
    lines.push(`> ⚠️ AIUI run scored ${Math.abs(delta)} points lower — investigate.`);
  } else {
    lines.push(`> No change. Either the agent ignored AIUI tools or the task is too easy.`);
  }
  lines.push('');

  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(TASKS_DIR)) {
    console.error('No tasks/ directory found.');
    process.exit(1);
  }

  const taskFiles = fs
    .readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const comparisons: Comparison[] = taskFiles.map((mdName) => {
    const taskId = mdName.replace(/\.md$/, '');
    const taskTitle = readTaskTitle(path.join(TASKS_DIR, mdName));
    const withFile = findTaskFile(WITH, taskId);
    const withoutFile = findTaskFile(WITHOUT, taskId);
    return {
      taskId,
      taskTitle,
      withMetrics: withFile ? measureFile(withFile) : null,
      withoutMetrics: withoutFile ? measureFile(withoutFile) : null,
    };
  });

  // Aggregate
  const completed = comparisons.filter((c) => c.withMetrics && c.withoutMetrics);
  let aggregateDelta = 0;
  for (const c of completed) {
    aggregateDelta += c.withMetrics!.qualityScore - c.withoutMetrics!.qualityScore;
  }
  const avgDelta = completed.length > 0 ? aggregateDelta / completed.length : 0;

  const out: string[] = [];
  out.push('# AIUI benchmark report');
  out.push('');
  out.push(`Generated: ${new Date().toISOString()}`);
  out.push('');
  out.push('## Summary');
  out.push('');
  out.push(`- Tasks defined: ${comparisons.length}`);
  out.push(`- Tasks with both runs: ${completed.length}`);
  out.push(`- Tasks missing one or both runs: ${comparisons.length - completed.length}`);
  out.push(`- **Average quality-score delta (with − without): ${avgDelta.toFixed(1)}**`);
  out.push('');
  if (completed.length > 0) {
    if (avgDelta >= 20) {
      out.push('> ✅ **AIUI is moving the needle.** Use this in your YC demo / landing page.');
    } else if (avgDelta >= 5) {
      out.push('> Modest improvement. Tighten the loop (validate-after-generate) before shipping.');
    } else if (avgDelta > -5) {
      out.push(
        "> ⚠️ No measurable improvement. Either the agent isn't calling the MCP tools, or the wedge needs revisiting."
      );
    } else {
      out.push(
        '> 🚨 AIUI runs are *worse*. Check whether token suggestions are confusing the agent.'
      );
    }
  } else {
    out.push('> No completed comparisons yet. Generate runs and re-run.');
  }
  out.push('');

  for (const c of comparisons) {
    out.push(comparisonSection(c));
  }

  const reportPath = path.join(RUNS_DIR, 'REPORT.md');
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, out.join('\n'));
  console.log(`Wrote ${reportPath}`);
}

main();
