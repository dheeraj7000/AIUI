import { readConfig, writeConfig } from '../lib/config.js';
import { writeDesignMemory, writeTokensJson, type LocalToken } from '../lib/writer.js';
import { DEFAULT_PROJECT_TOKENS } from '@aiui/design-core';

/**
 * Re-emit `.aiui/design-memory.md` and `.aiui/tokens.json` from the
 * default token set.
 *
 * After the marketplace scope cut, the CLI no longer pulls remote packs.
 * For server-backed token sync (where the AI agent has been editing tokens
 * via MCP), use the MCP `sync_design_memory` tool from your editor — it
 * reads live state from the database and writes richer memory than the CLI.
 *
 * This command is mostly useful for offline / local-only workflows.
 */
export async function sync(): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const config = readConfig(cwd);
  if (!config) {
    console.error(
      chalk.red('No .aiui/config.json found. Run ') + chalk.cyan('aiui init') + chalk.red(' first.')
    );
    process.exit(1);
  }

  const writeSpinner = ora('Regenerating .aiui/ files from default tokens...').start();
  try {
    const seedTokens: LocalToken[] = DEFAULT_PROJECT_TOKENS.map((t) => ({
      key: t.tokenKey,
      type: t.tokenType,
      value: t.tokenValue,
      description: t.description,
    }));

    writeDesignMemory(config.projectSlug, seedTokens, cwd);
    writeTokensJson(seedTokens, cwd);
    writeConfig({ ...config, lastSynced: new Date().toISOString() }, cwd);

    writeSpinner.succeed(`Synced ${seedTokens.length} default tokens to .aiui/`);
  } catch (err) {
    writeSpinner.fail(`Failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log('');
  console.log(
    `  ${chalk.dim(
      'For server-backed sync, use the MCP `sync_design_memory` tool from your AI agent.'
    )}`
  );
  console.log('');
}
