#!/usr/bin/env node

import { Command } from 'commander';
import { validate } from './commands/validate.js';
import type { ValidateOptions } from './commands/validate.js';

const program = new Command();

program
  .name('aiui')
  .description('AIUI CLI — Design system management for AI coding assistants')
  .version('0.1.0');

// --- init ---
program
  .command('init')
  .description('Initialize AIUI in the current project')
  .option('-y, --yes', 'Non-interactive mode with sensible defaults')
  .option('--local', 'Use local database instead of registry')
  .option('--db <url>', 'Database URL (for --local mode)')
  .option('--registry <url>', 'Custom registry URL')
  .action(async (options) => {
    const { init } = await import('./commands/init.js');
    await init(options);
  });

// --- add ---
program
  .command('add <pack>')
  .description('Add a style pack from the registry')
  .option('--local', 'Fetch from local database')
  .option('--db <url>', 'Database URL (for --local mode)')
  .action(async (pack, options) => {
    const { add } = await import('./commands/add.js');
    await add(pack, options);
  });

// --- sync ---
program
  .command('sync')
  .description('Regenerate .aiui/ files from the current config')
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
  .option('--strict', 'Exit 1 on any violation')
  .option('--max-violations <n>', 'Max violations before failing')
  .option('--ignore <patterns>', 'Comma-separated patterns to ignore')
  .action(async (options) => {
    const strict = options.strict ?? false;
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
      apiKey: options.apiKey,
      apiUrl: options.apiUrl,
      project: options.project,
      format: options.format as 'text' | 'json' | 'github',
      strict,
      maxViolations,
      ignore,
    };

    const exitCode = await validate(opts);
    process.exit(exitCode);
  });

// --- publish (placeholder) ---
program
  .command('publish')
  .description('Publish a style pack to the marketplace')
  .option('--namespace <ns>', 'Pack namespace (e.g., @myorg)')
  .option('--key <key>', 'API key for publishing')
  .action(async () => {
    console.log('Publishing is not yet available. Coming soon.');
    process.exit(0);
  });

program.parse();
