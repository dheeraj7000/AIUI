import { detectPatterns } from '../lib/pattern-detector.js';

export async function detectPatternsCommand(): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const spinner = ora('Scanning codebase for design patterns...').start();

  try {
    const patterns = await detectPatterns(cwd);

    if (patterns.length === 0) {
      spinner.succeed('No repetitive design patterns worth promoting.');
      return;
    }

    spinner.succeed(`Detected ${chalk.bold(patterns.length)} pattern(s) ready for promotion:`);
    console.log('');

    for (const p of patterns) {
      console.log(
        `${chalk.yellow('●')} ${chalk.bold(p.value)} ${chalk.dim('—')} ${chalk.cyan(p.type)}`
      );
      console.log(
        `  ${chalk.dim('×')} ${chalk.cyan(p.count)} uses across ${p.files.length} file(s) · contexts: ${p.contexts.join(', ')}`
      );
      console.log(
        `  ${chalk.dim('Files:')} ${p.files.slice(0, 3).join(', ')}${p.files.length > 3 ? ', …' : ''}`
      );
      console.log(`  ${chalk.green('→')} suggest ${chalk.bold(p.suggestedName)}`);
      console.log('');
    }

    console.log(
      chalk.blue(
        '  Tip: in your AI agent (Claude / Cursor), call the MCP `promote_pattern` tool to commit these as project tokens.'
      )
    );
    console.log('');
  } catch (err) {
    spinner.fail(`Failed to detect patterns: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
