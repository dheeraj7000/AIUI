import type { FileResult } from './scanner.js';

export interface ReportData {
  compliant: boolean;
  score: number;
  totalViolations: number;
  files: Array<{
    path: string;
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
  maxViolations: number
): ReportData {
  const filesWithViolations = results.filter((r) => r.result.violations.length > 0);

  const totalViolations = results.reduce((sum, r) => sum + r.result.violations.length, 0);

  // Compute an aggregate score: average of all file scores, or 100 if no files
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.result.score, 0) / results.length)
      : 100;

  const compliant = totalViolations === 0;

  // Determine exit code
  let exitCode = 0;
  if (strict && totalViolations > 0) {
    exitCode = 1;
  } else if (maxViolations >= 0 && totalViolations > maxViolations) {
    exitCode = 1;
  }

  const files = filesWithViolations.map((r) => {
    // Make path relative to cwd for display
    const relativePath = r.filePath.startsWith(cwd) ? r.filePath.slice(cwd.length + 1) : r.filePath;

    return {
      path: relativePath,
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
  const lines: string[] = [];

  lines.push('AIUI Design Validation');
  lines.push('======================');
  lines.push('');

  if (report.files.length === 0) {
    lines.push('No violations found. All files comply with design tokens.');
    lines.push('');
    lines.push(`Score: ${report.score}/100`);
    lines.push('Result: PASS');
    return lines.join('\n');
  }

  for (const file of report.files) {
    lines.push(file.path);
    for (const v of file.violations) {
      const lineInfo = v.line ? `Line ${v.line}` : 'Unknown line';
      const detail = v.value
        ? `Unauthorized ${v.type} "${v.value}" \u2014 ${v.suggestion || 'not in approved tokens'}`
        : v.message;
      lines.push(`  ${lineInfo}: ${detail}`);
    }
    lines.push('');
  }

  const fileCount = report.files.length;
  lines.push(
    `Summary: ${report.totalViolations} violation${report.totalViolations !== 1 ? 's' : ''} in ${fileCount} file${fileCount !== 1 ? 's' : ''}`
  );
  lines.push(`Score: ${report.score}/100`);

  if (report.exitCode !== 0) {
    const reason = report.strict ? ' (strict mode)' : ` (exceeded max ${report.maxViolations})`;
    lines.push(`Result: FAIL${reason}`);
  } else {
    lines.push('Result: PASS');
  }

  return lines.join('\n');
}

/**
 * Format report as JSON for programmatic consumption.
 */
export function formatJson(report: ReportData): string {
  return JSON.stringify(
    {
      compliant: report.compliant,
      score: report.score,
      totalViolations: report.totalViolations,
      files: report.files,
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
