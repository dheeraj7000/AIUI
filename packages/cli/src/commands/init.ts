import * as path from 'node:path';
import { detectFramework } from '../lib/detect-framework.js';
import { writeConfig, type AiuiConfig } from '../lib/config.js';
import { writeDesignMemory, writeTokensJson, addToGitignore } from '../lib/writer.js';
import type { LocalToken } from '../lib/writer.js';
import { DEFAULT_PROJECT_TOKENS } from '@aiui/design-core';

export interface InitOptions {
  yes?: boolean;
  apiUrl?: string;
}

const DEFAULT_API_URL = process.env.AIUI_API_URL ?? 'https://aiui.store';

/**
 * Scaffold a local AIUI workspace: write `.aiui/config.json`, a starter
 * `design-memory.md`, and `tokens.json` seeded with the default token set
 * shipped from `@aiui/design-core`.
 *
 * After the marketplace scope cut, the CLI no longer fetches packs from a
 * registry. The richer DB-backed design memory lives on the server — use
 * the MCP `init_project` tool from your AI agent for the full flow.
 */
export async function init(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  console.log('');
  console.log(chalk.bold('  AIUI — Design System Setup'));
  console.log('');

  const spinner = ora('Detecting project...').start();
  const info = detectFramework(cwd);
  spinner.succeed(
    `Framework: ${chalk.cyan(info.framework)}` +
      (info.hasTailwind ? ` (Tailwind CSS detected)` : '')
  );

  let projectSlug: string;
  if (options.yes) {
    projectSlug = path
      .basename(cwd)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  } else {
    const prompts = (await import('prompts')).default;
    const defaultSlug = path
      .basename(cwd)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const { slug } = await prompts({
      type: 'text',
      name: 'slug',
      message: 'Project name',
      initial: defaultSlug,
    });
    if (!slug) {
      console.error(chalk.red('  Cancelled.'));
      process.exit(1);
    }
    projectSlug = slug;
  }

  const apiUrl = options.apiUrl ?? DEFAULT_API_URL;

  // Convert the design-core CreateTokenInput[] into the LocalToken[] shape
  // the writer wants. They differ only in field names.
  const seedTokens: LocalToken[] = DEFAULT_PROJECT_TOKENS.map((t) => ({
    key: t.tokenKey,
    type: t.tokenType,
    value: t.tokenValue,
    description: t.description,
  }));

  const writeSpinner = ora('Writing .aiui/ files...').start();
  try {
    const config: AiuiConfig = {
      projectSlug,
      framework: info.framework,
      apiUrl,
      lastSynced: new Date().toISOString(),
    };

    writeConfig(config, cwd);
    writeDesignMemory(projectSlug, seedTokens, cwd);
    writeTokensJson(seedTokens, cwd);
    addToGitignore(cwd);

    writeSpinner.succeed('Written .aiui/ files');
  } catch (err) {
    writeSpinner.fail(`Failed to write files: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log('');
  console.log(chalk.green('  Done!') + ' Add this to your ' + chalk.bold('CLAUDE.md') + ':');
  console.log('');
  console.log(chalk.gray('  ## Design System'));
  console.log(chalk.gray('  This project uses AIUI for design management.'));
  console.log(chalk.gray('  See `.aiui/design-memory.md` for the active design tokens and rules.'));
  console.log(chalk.gray('  Always follow the design memory before building any UI.'));
  console.log('');
  console.log(`  ${chalk.bold('MCP setup')} (Claude Code):`);
  console.log(chalk.gray(`  claude mcp add --transport http aiui ${apiUrl}/mcp`));
  console.log('');
  console.log(
    `  Next: ${chalk.cyan('aiui validate')} — lint your code against these tokens, or use the MCP \`update_tokens\` tool from your AI agent to evolve them.`
  );
  console.log('');
}
