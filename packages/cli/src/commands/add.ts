import * as fs from 'node:fs';
import * as path from 'node:path';
import { readConfig, writeConfig } from '../lib/config.js';
import { fetchPack, cachePack } from '../lib/registry-client.js';
import { transformTokens, inferFormat } from '../lib/transformer.js';
import { writeDesignMemory, writeTokensJson } from '../lib/writer.js';
import { detectFramework } from '../lib/detect-framework.js';

export interface AddOptions {
  local?: boolean;
  db?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function add(packSlug: string, options: AddOptions): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  // Read existing config
  const config = readConfig(cwd);
  if (!config) {
    console.error(
      chalk.red('No .aiui/config.json found. Run ') + chalk.cyan('aiui init') + chalk.red(' first.')
    );
    process.exit(1);
  }

  // Fetch pack
  const spinner = ora(`Fetching ${packSlug}...`).start();
  let pack;
  try {
    pack = await fetchPack(packSlug, config);
    spinner.succeed(
      `Fetched ${chalk.cyan(pack.name)} (${pack.tokenCount} tokens, ${pack.componentCount} components)`
    );
  } catch (err) {
    spinner.fail(`Failed to fetch pack: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  // Transform and write
  const info = detectFramework(cwd);
  const format = inferFormat(info.framework, info.hasTailwind);
  const { content: tokenFileContent, filename: tokenFilename } = transformTokens(
    pack.tokens,
    format
  );

  const writeSpinner = ora('Writing files...').start();
  try {
    writeDesignMemory(pack, cwd);
    writeTokensJson(pack.tokens, cwd);
    cachePack(pack, cwd);
    fs.writeFileSync(path.join(cwd, '.aiui', tokenFilename), tokenFileContent);

    // Update config
    writeConfig({ ...config, activePack: packSlug, lastSynced: new Date().toISOString() }, cwd);

    writeSpinner.succeed('Updated .aiui/ files');
  } catch (err) {
    writeSpinner.fail(`Failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log('');
  console.log(`  Style pack ${chalk.bold(pack.name)} applied.`);
  console.log(`  Run ${chalk.cyan('aiui sync')} to regenerate at any time.`);
  console.log('');
}
