import * as path from 'node:path';
import { detectFramework } from '../lib/detect-framework.js';
import { writeConfig, type AiuiConfig } from '../lib/config.js';
import { fetchRegistryIndex, fetchPack, cachePack } from '../lib/registry-client.js';
import { transformTokens, inferFormat } from '../lib/transformer.js';
import { writeDesignMemory, writeTokensJson, addToGitignore } from '../lib/writer.js';
import * as fs from 'node:fs';

export interface InitOptions {
  yes?: boolean;
  local?: boolean;
  db?: string;
  registry?: string;
}

const DEFAULT_REGISTRY = process.env.AIUI_REGISTRY_URL ?? 'https://app.aiui.dev';
const DEFAULT_PACK = 'saas-clean';

export async function init(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  console.log('');
  console.log(chalk.bold('  AIUI — Design System Setup'));
  console.log('');

  // 1. Detect framework
  const spinner = ora('Detecting project...').start();
  const info = detectFramework(cwd);
  spinner.succeed(
    `Framework: ${chalk.cyan(info.framework)}` +
      (info.hasTailwind ? ` (Tailwind CSS detected)` : '')
  );

  // 2. Get project name
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

  // 3. Determine registry
  const registryUrl = options.registry ?? DEFAULT_REGISTRY;

  // 4. Select pack
  let packSlug = DEFAULT_PACK;
  if (!options.yes) {
    try {
      const indexSpinner = ora('Fetching available style packs...').start();
      const index = await fetchRegistryIndex(registryUrl);
      indexSpinner.stop();

      if (index.length > 0) {
        const prompts = (await import('prompts')).default;
        const { selected } = await prompts({
          type: 'select',
          name: 'selected',
          message: 'Style pack',
          choices: index.map((p) => ({
            title: `${p.name} — ${p.description} (${p.tokenCount} tokens, ${p.componentCount} components)`,
            value: p.slug,
          })),
          initial: index.findIndex((p) => p.slug === DEFAULT_PACK),
        });
        if (!selected) {
          console.error(chalk.red('  Cancelled.'));
          process.exit(1);
        }
        packSlug = selected;
      }
    } catch {
      // Registry not available — use default
    }
  }

  // 5. Fetch pack
  const fetchSpinner = ora(`Fetching ${packSlug} from registry...`).start();
  let pack;
  try {
    pack = await fetchPack(packSlug, {
      projectSlug,
      framework: info.framework,
      registryUrl,
      activePack: packSlug,
    });
    fetchSpinner.succeed(`Fetched ${chalk.cyan(pack.name)}`);
  } catch (err) {
    fetchSpinner.fail(`Failed to fetch pack: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  // 6. Transform tokens
  const format = inferFormat(info.framework, info.hasTailwind);
  const { content: tokenFileContent, filename: tokenFilename } = transformTokens(
    pack.tokens,
    format
  );

  // 7. Write files
  const writeSpinner = ora('Writing .aiui/ files...').start();
  try {
    const config: AiuiConfig = {
      projectSlug,
      framework: info.framework,
      registryUrl,
      activePack: packSlug,
      lastSynced: new Date().toISOString(),
    };

    writeConfig(config, cwd);
    writeDesignMemory(pack, cwd);
    writeTokensJson(pack.tokens, cwd);
    cachePack(pack, cwd);
    addToGitignore(cwd);

    // Write framework-specific token file
    fs.writeFileSync(path.join(cwd, '.aiui', tokenFilename), tokenFileContent);

    writeSpinner.succeed('Written .aiui/ files');
  } catch (err) {
    writeSpinner.fail(`Failed to write files: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  // 8. Post-init summary
  console.log('');
  console.log(chalk.green('  Done!') + ' Add this to your ' + chalk.bold('CLAUDE.md') + ':');
  console.log('');
  console.log(chalk.gray('  ## Design System'));
  console.log(chalk.gray('  This project uses AIUI for design management.'));
  console.log(chalk.gray('  See `.aiui/design-memory.md` for the active design system.'));
  console.log(chalk.gray('  Always follow the design rules defined there before building any UI.'));
  console.log('');
  console.log(`  ${chalk.bold('MCP setup')} (Claude Code):`);
  console.log(chalk.gray(`  claude mcp add --transport http aiui ${registryUrl}/mcp`));
  console.log('');
  console.log(
    `  Next: ${chalk.cyan('aiui add <pack>')} | ${chalk.cyan('aiui sync')} | ${chalk.cyan('aiui validate')}`
  );
  console.log('');
}
