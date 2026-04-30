import { detectPatterns } from '../lib/pattern-detector.js';

export async function detectPatternsCommand(): Promise<void> {
  const cwd = process.cwd();
  const ora = (await import('ora')).default;
  const chalk = (await import('chalk')).default;

  const spinner = ora('Scanning codebase for design patterns...').start();

  try {
    const patterns = await detectPatterns(cwd);

    if (patterns.length === 0) {
      spinner.succeed('No repetitive design debt patterns detected.');
      return;
    }

    spinner.succeed(`Detected ${chalk.bold(patterns.length)} emerging design patterns:`);
    console.log('');

    for (const p of patterns) {
      console.log(`${chalk.yellow('●')} ${chalk.bold(p.value)} (${p.type})`);
      console.log(`  Used ${chalk.cyan(p.count)} times across ${p.files.length} files`);
      console.log(
        `  ${chalk.dim('Files: ' + p.files.slice(0, 3).join(', ') + (p.files.length > 3 ? '...' : ''))}`
      );
      console.log('');
    }

    console.log(
      chalk.blue(
        'ℹ Tip: Promote these to tokens in your AIUI Style Pack to keep the design system clean.'
      )
    );
    console.log('');
  } catch (err) {
    spinner.fail(`Failed to detect patterns: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
