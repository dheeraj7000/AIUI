import { readFileSnippet } from './scanner.js';
import type { FileResult } from './scanner.js';

// Tiny ANSI wrapper — avoids a runtime dep just for color.
// Respects NO_COLOR and non-TTY output.
const colorEnabled = !process.env.NO_COLOR && process.stdout.isTTY && process.env.TERM !== 'dumb';
function ansi(code: number, s: string): string {
  return colorEnabled ? `\x1b[${code}m${s}\x1b[0m` : s;
}
const c = {
  red: (s: string) => ansi(31, s),
  yellow: (s: string) => ansi(33, s),
  green: (s: string) => ansi(32, s),
  blue: (s: string) => ansi(34, s),
  dim: (s: string) => ansi(2, s),
  bold: (s: string) => ansi(1, s),
  underline: (s: string) => ansi(4, s),
};

export interface ReportData {
  compliant: boolean;
  score: number;
  totalViolations: number;
  files: Array<{
    path: string;
    absolutePath?: string;
    violations: Array<{
      type: string;
      severity: string;
      message: string;
      line?: number;
      value?: string;
      suggestion?: string;
    }>;
  }>;
  strict: boolean;
  maxViolations: number;
  exitCode: number;
}

/**
 * Build a unified report data structure from scan results.
 */
export function buildReport(
  results: FileResult[],
  cwd: string,
  strict: boolean,
  maxViolations: number,
  ci = false
): ReportData {
  const filesWithViolations = results.filter((r) => r.result.violations.length > 0);

  const totalViolations = results.reduce((sum, r) => sum + r.result.violations.length, 0);

  // Compute an aggregate score: average of all file scores, or 100 if no files
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.result.score, 0) / results.length)
      : 100;

  const compliant = totalViolations === 0;

  const errorCount = results.reduce(
    (sum, r) => sum + r.result.violations.filter((v) => v.severity === 'error').length,
    0
  );

  // Determine exit code. --ci fails only on errors; --strict fails on any violation;
  // --max-violations is an overall cap regardless of severity.
  let exitCode = 0;
  if (ci && errorCount > 0) {
    exitCode = 1;
  } else if (strict && totalViolations > 0) {
    exitCode = 1;
  } else if (maxViolations >= 0 && totalViolations > maxViolations) {
    exitCode = 1;
  }

  const files = filesWithViolations.map((r) => {
    // Make path relative to cwd for display
    const relativePath = r.filePath.startsWith(cwd) ? r.filePath.slice(cwd.length + 1) : r.filePath;

    return {
      path: relativePath,
      absolutePath: r.filePath,
      violations: r.result.violations.map((v) => ({
        type: v.type,
        severity: v.severity,
        message: v.message,
        line: v.line,
        value: v.value,
        suggestion: v.suggestion,
      })),
    };
  });

  return {
    compliant,
    score: avgScore,
    totalViolations,
    files,
    strict,
    maxViolations,
    exitCode,
  };
}

/**
 * Format report as human-readable text for terminal output.
 */
export function formatText(report: ReportData): string {
  const out: string[] = [];

  out.push(c.bold('AIUI Design Validation'));
  out.push(c.dim('\u2500'.repeat(40)));
  out.push('');

  if (report.files.length === 0) {
    out.push(c.green('\u2713 No violations found. All files comply with design tokens.'));
    out.push('');
    out.push(`${c.bold('Score:')} ${report.score}/100`);
    out.push(`${c.bold('Result:')} ${c.green('PASS')}`);
    return out.join('\n');
  }

  for (const file of report.files) {
    out.push(c.underline(c.bold(file.path)));
    for (const v of file.violations) {
      const isErr = v.severity === 'error';
      const tag = isErr ? c.red(c.bold(' ERROR ')) : c.yellow(c.bold(' WARN  '));
      const pos = v.line ? c.dim(`:${v.line}`) : '';
      const detail = v.value
        ? `Unauthorized ${v.type} "${v.value}" \u2014 ${v.suggestion || 'not in approved tokens'}`
        : v.message;
      out.push(`  ${tag} ${c.dim(`[${v.type}]`)}${pos} ${detail}`);

      if (v.line && file.absolutePath) {
        const snippet = readFileSnippet(file.absolutePath, v.line, 1);
        if (snippet) {
          const width = String(snippet.lines[snippet.lines.length - 1].n).length;
          for (const l of snippet.lines) {
            const prefix = l.isTarget ? (isErr ? c.red('>') : c.yellow('>')) : ' ';
            const num = c.dim(String(l.n).padStart(width, ' '));
            out.push(`      ${prefix} ${num} ${c.dim('\u2502')} ${l.text}`);
          }
        }
      }
    }
    out.push('');
  }

  const errCount = report.files.reduce(
    (s, f) => s + f.violations.filter((v) => v.severity === 'error').length,
    0
  );
  const warnCount = report.totalViolations - errCount;
  const fileCount = report.files.length;

  const parts: string[] = [];
  if (errCount) parts.push(c.red(`${errCount} error${errCount !== 1 ? 's' : ''}`));
  if (warnCount) parts.push(c.yellow(`${warnCount} warning${warnCount !== 1 ? 's' : ''}`));
  out.push(
    `${c.bold('Summary:')} ${parts.join(', ')} in ${fileCount} file${fileCount !== 1 ? 's' : ''}`
  );
  out.push(`${c.bold('Score:')} ${report.score}/100`);

  if (report.exitCode !== 0) {
    const reason =
      errCount > 0 && !report.strict
        ? ` (${errCount} error${errCount !== 1 ? 's' : ''})`
        : report.strict
          ? ' (strict mode)'
          : ` (exceeded max ${report.maxViolations})`;
    out.push(`${c.bold('Result:')} ${c.red('FAIL')}${c.dim(reason)}`);
  } else {
    out.push(`${c.bold('Result:')} ${c.green('PASS')}`);
  }

  return out.join('\n');
}

/**
 * Format report as JSON for programmatic consumption.
 */
export function formatJson(report: ReportData): string {
  let errors = 0;
  let warnings = 0;
  const violations: Array<{
    file: string;
    type: string;
    severity: string;
    message: string;
    line?: number;
    value?: string;
    suggestion?: string;
  }> = [];
  for (const f of report.files) {
    for (const v of f.violations) {
      if (v.severity === 'error') errors++;
      else warnings++;
      violations.push({ file: f.path, ...v });
    }
  }
  return JSON.stringify(
    {
      summary: {
        files: report.files.length,
        errors,
        warnings,
        score: report.score,
        compliant: report.compliant,
      },
      violations,
    },
    null,
    2
  );
}

/**
 * Format report as GitHub Actions annotations.
 */
export function formatGitHub(report: ReportData): string {
  const lines: string[] = [];

  for (const file of report.files) {
    for (const v of file.violations) {
      const lineParam = v.line ? `,line=${v.line}` : '';
      const detail = v.value
        ? `Unauthorized ${v.type} "${v.value}" \u2014 ${v.suggestion || 'not in approved tokens'}`
        : v.message;
      lines.push(`::warning file=${file.path}${lineParam}::${detail}`);
    }
  }

  if (report.totalViolations > 0) {
    const fileCount = report.files.length;
    lines.push(
      `::error::AIUI Design Validation: ${report.totalViolations} violation${report.totalViolations !== 1 ? 's' : ''} found in ${fileCount} file${fileCount !== 1 ? 's' : ''} (score: ${report.score}/100)`
    );
  }

  return lines.join('\n');
}

/**
 * Format report based on the requested format.
 */
export function formatReport(report: ReportData, format: 'text' | 'json' | 'github'): string {
  switch (format) {
    case 'json':
      return formatJson(report);
    case 'github':
      return formatGitHub(report);
    case 'text':
    default:
      return formatText(report);
  }
}
