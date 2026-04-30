#!/usr/bin/env node

import { Command } from 'commander';
import type { ValidateOptions } from './commands/validate.js';

const program = new Command();

program
  .name('aiui')
  .description('AIUI CLI — Design system management for AI coding assistants')
  .version('0.1.0');

// --- init ---
program
  .command('init')
  .description('Initialize AIUI in the current project (writes .aiui/ scaffold)')
  .option('-y, --yes', 'Non-interactive mode with sensible defaults')
  .option('--api-url <url>', 'AIUI server URL for MCP setup hint')
  .action(async (options) => {
    const { init } = await import('./commands/init.js');
    await init(options);
  });

// --- sync ---
program
  .command('sync')
  .description('Regenerate local .aiui/ files from the default token set')
  .action(async () => {
    const { sync } = await import('./commands/sync.js');
    await sync();
  });

// --- validate ---
program
  .command('validate')
  .description('Scan source files for design token compliance')
  .option('--files <glob>', 'Files to scan', 'src/**/*.{tsx,jsx,ts,js,css,html}')
  .option('--tokens <path>', 'Path to tokens.json', '.aiui/tokens.json')
  .option('--api-key <key>', 'AIUI API key')
  .option('--api-url <url>', 'AIUI API URL', 'https://aiui.store')
  .option('--project <slug>', 'Project slug (with --api-key)')
  .option('--format <fmt>', 'Output: text | json | github', 'text')
  .option('--json', 'Shortcut for --format json (machine-readable output)')
  .option('--ci', 'Exit 1 if any errors are found (warnings allowed)')
  .option('--strict', 'Exit 1 on any violation')
  .option('--max-violations <n>', 'Max violations before failing')
  .option('--ignore <patterns>', 'Comma-separated patterns to ignore')
  .action(async (options) => {
    const strict = options.strict ?? false;
    const ci = options.ci ?? false;
    if (options.json) options.format = 'json';
    let maxViolations: number;
    if (options.maxViolations !== undefined) {
      maxViolations = parseInt(options.maxViolations, 10);
      if (isNaN(maxViolations) || maxViolations < 0) {
        console.error('--max-violations must be a non-negative integer.');
        process.exit(1);
      }
    } else {
      maxViolations = strict ? 0 : -1;
    }

    const ignore = options.ignore
      ? options.ignore
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    const opts: ValidateOptions = {
      files: options.files,
      tokensPath: options.tokens,
      apiKey: options.apiKey ?? process.env.AIUI_API_KEY,
      apiUrl: options.apiUrl,
      project: options.project,
      format: options.format as 'text' | 'json' | 'github',
      strict,
      ci,
      maxViolations,
      ignore,
    };

    const { validate } = await import('./commands/validate.js');
    const exitCode = await validate(opts);
    process.exit(exitCode);
  });

// --- detect-patterns ---
program
  .command('detect-patterns')
  .description('Identify repetitive design debt patterns in the codebase')
  .action(async () => {
    const { detectPatternsCommand } = await import('./commands/detect-patterns.js');
    await detectPatternsCommand();
  });

// --- audit ---
program
  .command('audit')
  .description('Read-only design audit: scan codebase, report token candidates + drift + coverage')
  .option('--files <glob>', 'Files to scan', 'src/**/*.{tsx,jsx,ts,js,css,html}')
  .option('--permissive', 'Lower the promotion threshold; show review-tier candidates too')
  .option('--json', 'Emit the full report as JSON for scripting')
  .action(async (options) => {
    const { audit } = await import('./commands/audit.js');
    await audit({
      glob: options.files,
      permissive: options.permissive ?? false,
      json: options.json ?? false,
    });
  });

// --- adopt ---
program
  .command('adopt')
  .description('Ingest the design system from an existing codebase into your AIUI project')
  .option('--files <glob>', 'Files to scan', 'src/**/*.{tsx,jsx,ts,js,css,html}')
  .option('--api-key <key>', 'AIUI API key (or set AIUI_API_KEY)')
  .option('--api-url <url>', 'AIUI server URL', process.env.AIUI_API_URL ?? 'https://aiui.store')
  .option('--project <slug>', 'Project slug (defaults to .aiui/config.json projectSlug)')
  .option('-y, --yes', 'Adopt every candidate (auto + review) without prompting')
  .option('--review-all', 'Interactively triage review-tier candidates (multi-select)')
  .option('--mode <mode>', 'merge (skip existing keys) or replace (overwrite)', 'merge')
  .action(async (options) => {
    const { adopt } = await import('./commands/adopt.js');
    await adopt({
      glob: options.files,
      apiKey: options.apiKey,
      apiUrl: options.apiUrl,
      project: options.project,
      yes: options.yes ?? false,
      reviewAll: options.reviewAll ?? false,
      mode: options.mode as 'merge' | 'replace',
    });
  });

// --- watch ---
program
  .command('watch')
  .description('Continuously watch for new design-token candidates as you edit code')
  .option('--files <glob>', 'Files to scan', 'src/**/*.{tsx,jsx,ts,js,css,html}')
  .option('--interval <ms>', 'Polling interval in milliseconds', '4000')
  .action(async (options) => {
    const intervalMs = parseInt(options.interval, 10);
    const { watch } = await import('./commands/watch.js');
    await watch({ glob: options.files, intervalMs: isNaN(intervalMs) ? 4000 : intervalMs });
  });

program.parse();
