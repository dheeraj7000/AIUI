#!/usr/bin/env node

import { validate } from './commands/validate.js';
import type { ValidateOptions } from './commands/validate.js';

const HELP_TEXT = `
AIUI CLI - Design Token Validation

Usage:
  aiui validate [options]

Commands:
  validate    Scan source files for design token compliance

Options:
  --files <glob>         Files to scan (default: "src/**/*.{tsx,jsx,ts,js,css,html}")
  --tokens <path>        Path to tokens.json (default: ".aiui/tokens.json")
  --api-key <key>        AIUI API key (alternative to local tokens)
  --api-url <url>        AIUI API URL (default: https://mcp.aiui.dev)
  --project <slug>       Project slug (used with --api-key)
  --format <fmt>         Output format: text | json | github (default: text)
  --strict               Exit 1 on any violation (default: exit 1 only on errors)
  --max-violations <n>   Max violations before failing (default: 0 in strict, unlimited otherwise)
  --ignore <patterns>    Comma-separated patterns to ignore
  --help, -h             Show this help message

Examples:
  aiui validate
  aiui validate --strict --format github
  aiui validate --files "src/**/*.{tsx,css}" --tokens .aiui/tokens.json
  aiui validate --api-key $AIUI_API_KEY --project my-app --strict
`.trim();

/**
 * Parse command-line arguments into a key-value map.
 * Handles --flag, --key value, and --key=value forms.
 */
function parseArgs(argv: string[]): {
  command: string | undefined;
  flags: Record<string, string | boolean>;
} {
  let command: string | undefined;
  const flags: Record<string, string | boolean> = {};

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (!arg.startsWith('-') && !command) {
      command = arg;
      i++;
      continue;
    }

    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex !== -1) {
        // --key=value
        const key = arg.slice(2, eqIndex);
        flags[key] = arg.slice(eqIndex + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('-')) {
          flags[key] = next;
          i++;
        } else {
          // Boolean flag
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      flags[key] = true;
    }

    i++;
  }

  return { command, flags };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const { command, flags } = parseArgs(argv);

  if (command !== 'validate') {
    if (command) {
      console.error(`Unknown command: "${command}". Use "aiui validate" to run validation.`);
    } else {
      console.error('No command specified. Use "aiui validate" to run validation.');
    }
    console.error('Run "aiui --help" for usage information.');
    process.exit(1);
  }

  // Validate format option
  const formatRaw = typeof flags.format === 'string' ? flags.format : 'text';
  if (formatRaw !== 'text' && formatRaw !== 'json' && formatRaw !== 'github') {
    console.error(`Invalid format "${formatRaw}". Must be one of: text, json, github`);
    process.exit(1);
  }

  const strict = flags.strict === true;

  // Parse max-violations
  let maxViolations: number;
  if (flags['max-violations'] !== undefined && typeof flags['max-violations'] === 'string') {
    maxViolations = parseInt(flags['max-violations'], 10);
    if (isNaN(maxViolations) || maxViolations < 0) {
      console.error('--max-violations must be a non-negative integer.');
      process.exit(1);
    }
  } else {
    maxViolations = strict ? 0 : -1; // -1 means unlimited
  }

  // Parse ignore patterns
  const ignoreRaw = typeof flags.ignore === 'string' ? flags.ignore : '';
  const ignore = ignoreRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const options: ValidateOptions = {
    files: typeof flags.files === 'string' ? flags.files : 'src/**/*.{tsx,jsx,ts,js,css,html}',
    tokensPath: typeof flags.tokens === 'string' ? flags.tokens : '.aiui/tokens.json',
    apiKey: typeof flags['api-key'] === 'string' ? flags['api-key'] : undefined,
    apiUrl: typeof flags['api-url'] === 'string' ? flags['api-url'] : 'https://mcp.aiui.dev',
    project: typeof flags.project === 'string' ? flags.project : undefined,
    format: formatRaw as 'text' | 'json' | 'github',
    strict,
    maxViolations,
    ignore,
  };

  const exitCode = await validate(options);
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
