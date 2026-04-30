import * as fs from 'node:fs';
import * as path from 'node:path';
import { readConfig, writeConfig } from '../lib/config.js';
import { fetchPack, fetchComponent, cachePack } from '../lib/registry-client.js';
import { transformTokens, transformComponent, inferFormat } from '../lib/transformer.js';
import { writeDesignMemory, writeTokensJson } from '../lib/writer.js';
import { detectFramework } from '../lib/detect-framework.js';

export interface AddOptions {
  local?: boolean;
  db?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function add(identifier: string, options: AddOptions): Promise<void> {
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

  const spinner = ora(`Checking registry for "${identifier}"...`).start();

  try {
    // 1. Try fetching as a Style Pack first
    try {
      const pack = await fetchPack(identifier, config);
      spinner.succeed(
        `Found Style Pack: ${chalk.cyan(pack.name)} (${pack.tokenCount} tokens, ${
          pack.componentCount
        } components)`
      );

      // Transform and write Style Pack
      const info = detectFramework(cwd);
      const format = inferFormat(info.framework, info.hasTailwind);
      const { content: tokenFileContent, filename: tokenFilename } = transformTokens(
        pack.tokens,
        format
      );

      const writeSpinner = ora('Applying Style Pack...').start();
      writeDesignMemory(pack, cwd);
      writeTokensJson(pack.tokens, cwd);
      cachePack(pack, cwd);
      fs.writeFileSync(path.join(cwd, '.aiui', tokenFilename), tokenFileContent);

      // Update config
      writeConfig({ ...config, activePack: identifier, lastSynced: new Date().toISOString() }, cwd);

      writeSpinner.succeed(`Style pack ${chalk.bold(pack.name)} applied.`);
      return;
    } catch (err) {
      // If not a pack, try as a component
      if (err instanceof Error && err.message.includes('not found')) {
        spinner.text = `Style pack not found. Checking for component "${identifier}"...`;
      } else {
        throw err;
      }
    }

    // 2. Try fetching as a Component
    const component = await fetchComponent(identifier, config);
    spinner.succeed(`Found Component: ${chalk.cyan(component.name)} (${component.type})`);

    // To transform a component, we need the active tokens
    const cacheDir = path.join(cwd, '.aiui', '.cache');
    const activePackFile = path.join(cacheDir, `${config.activePack}.json`);
    let activeTokens = [];

    if (fs.existsSync(activePackFile)) {
      const cachedPack = JSON.parse(fs.readFileSync(activePackFile, 'utf-8'));
      activeTokens = cachedPack.tokens;
    } else {
      // Fallback: fetch active pack if not cached
      const pack = await fetchPack(config.activePack, config);
      activeTokens = pack.tokens;
      cachePack(pack, cwd);
    }

    const info = detectFramework(cwd);
    const format = inferFormat(info.framework, info.hasTailwind);
    const transformedCode = transformComponent(component, activeTokens, format);

    const writeSpinner = ora('Installing component...').start();

    // Determine target directory
    const componentsDir = path.join(cwd, 'src', 'components', 'ui');
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }

    const fileName = `${component.slug}.tsx`;
    const filePath = path.join(componentsDir, fileName);

    fs.writeFileSync(filePath, transformedCode);
    writeSpinner.succeed(`Installed ${chalk.bold(fileName)} in ${chalk.dim('src/components/ui/')}`);

    console.log('');
    console.log(chalk.green('  Component ready to use!'));
    if (component.aiUsageRules) {
      console.log(chalk.dim(`  AI Rules: ${component.aiUsageRules}`));
    }
    console.log('');
  } catch (err) {
    spinner.fail(`Failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
