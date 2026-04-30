import * as fs from 'node:fs';
import * as path from 'node:path';
import { readConfig, writeConfig } from '../lib/config.js';
import { fetchPack, cachePack } from '../lib/registry-client.js';
import { transformTokens, inferFormat } from '../lib/transformer.js';
import { writeDesignMemory, writeTokensJson } from '../lib/writer.js';
import { detectFramework } from '../lib/detect-framework.js';

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

  const spinner = ora(`Syncing ${config.activePack}...`).start();
  let pack;
  try {
    pack = await fetchPack(config.activePack, config);
    spinner.succeed(`Fetched ${chalk.cyan(pack.name)}`);
  } catch (err) {
    spinner.fail(`Failed to fetch: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  const info = detectFramework(cwd);
  const writeSpinner = ora('Regenerating .aiui/ files...').start();

  try {
    writeDesignMemory(pack, cwd);
    writeTokensJson(pack.tokens, cwd);
    cachePack(pack, cwd);

    // Support multiple targets if defined in config, otherwise fall back to detected framework
    const targets =
      config.targets && config.targets.length > 0
        ? config.targets
        : [inferFormat(info.framework, info.hasTailwind)];

    for (const target of targets) {
      const { content, filename } = transformTokens(
        pack.tokens,
        target as Parameters<typeof transformTokens>[1]
      );
      fs.writeFileSync(path.join(cwd, '.aiui', filename), content);
    }

    writeConfig({ ...config, lastSynced: new Date().toISOString() }, cwd);

    writeSpinner.succeed(`Synced .aiui/ files for ${targets.length} target(s)`);
  } catch (err) {
    writeSpinner.fail(`Failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log('');
  console.log(
    `  ${chalk.green('Synced.')} ${pack.tokenCount} tokens, ${pack.componentCount} components.`
  );
  console.log('');
}
