import * as path from 'node:path';
import { loadLocalTokens, loadRemoteTokens, findFiles, scanFile } from '../lib/scanner.js';
import type { ApprovedToken, FileResult } from '../lib/scanner.js';
import { buildReport, formatReport } from '../lib/reporter.js';

export interface ValidateOptions {
  files: string;
  tokensPath: string;
  apiKey?: string;
  apiUrl: string;
  project?: string;
  format: 'text' | 'json' | 'github';
  strict: boolean;
  maxViolations: number;
  ignore: string[];
}

/**
 * Run the validate command.
 *
 * 1. Load tokens (local file or remote API)
 * 2. Discover source files matching the glob pattern
 * 3. Scan each file for design token compliance
 * 4. Report results in the requested format
 * 5. Return the appropriate exit code
 */
export async function validate(options: ValidateOptions): Promise<number> {
  const cwd = process.cwd();

  // --- Load tokens ---
  let tokens: ApprovedToken[];

  try {
    if (options.apiKey) {
      if (!options.project) {
        console.error(
          'Error: --project is required when using --api-key. Specify the project slug.'
        );
        return 1;
      }
      tokens = await loadRemoteTokens(options.apiUrl, options.apiKey, options.project);
    } else {
      const tokensPath = path.isAbsolute(options.tokensPath)
        ? options.tokensPath
        : path.resolve(cwd, options.tokensPath);
      tokens = loadLocalTokens(tokensPath);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error loading tokens: ${message}`);
    return 1;
  }

  // --- Discover files ---
  let filePaths: string[];
  try {
    filePaths = findFiles(options.files, cwd, options.ignore);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error finding files: ${message}`);
    return 1;
  }

  if (filePaths.length === 0) {
    console.error(
      `No files found matching pattern "${options.files}". Check the --files option or your working directory.`
    );
    return 1;
  }

  // --- Scan files ---
  const results: FileResult[] = [];

  for (const filePath of filePaths) {
    try {
      const result = scanFile(filePath, tokens);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Warning: Could not scan ${filePath}: ${message}`);
    }
  }

  // --- Report ---
  const report = buildReport(results, cwd, options.strict, options.maxViolations);
  const output = formatReport(report, options.format);

  if (output) {
    console.log(output);
  }

  return report.exitCode;
}
