import { describe, it, expect, afterEach } from 'vitest';
import {
  generateDesignMemory,
  writeDesignMemory,
  writeTokensJson,
  addToGitignore,
  type LocalToken,
} from '../lib/writer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

function makeTokens(): LocalToken[] {
  return [
    { key: 'color.primary', type: 'color', value: '#3b82f6' },
    { key: 'font.body', type: 'font', value: 'Inter' },
    { key: 'spacing.sm', type: 'spacing', value: '0.5rem' },
  ];
}

const PROJECT = 'test-project';

describe('generateDesignMemory', () => {
  it('returns string containing the project name', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toContain(PROJECT);
  });

  it('contains Design Rules section', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toContain('## Design Rules');
  });

  it('contains Tokens section', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toContain('## Tokens');
  });

  it('contains the six core design rules', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toContain('1. **Always use design tokens**');
    expect(md).toContain('2. **Maintain visual hierarchy**');
    expect(md).toContain('3. **Respect the type system**');
    expect(md).toContain('4. **Use the spacing scale**');
    expect(md).toContain('5. **Maintain accessibility**');
    expect(md).toContain('6. **Preserve design consistency**');
  });

  it('contains token values in markdown table format', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toContain('| `color.primary` | `#3b82f6` |');
    expect(md).toContain('| `font.body` | `Inter` |');
    expect(md).toContain('| `spacing.sm` | `0.5rem` |');
  });

  it('contains Generated: with ISO date substring', () => {
    const md = generateDesignMemory(PROJECT, makeTokens());
    expect(md).toMatch(/\*\*Generated:\*\* \d{4}-\d{2}-\d{2}T/);
  });
});

describe('writeDesignMemory', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-writer-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('creates .aiui/design-memory.md file', () => {
    const dir = makeTempDir();
    writeDesignMemory(PROJECT, makeTokens(), dir);
    const filePath = path.join(dir, '.aiui', 'design-memory.md');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('file content matches generateDesignMemory output structure', () => {
    const dir = makeTempDir();
    writeDesignMemory(PROJECT, makeTokens(), dir);
    const filePath = path.join(dir, '.aiui', 'design-memory.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain(`# Design Memory — ${PROJECT}`);
    expect(content).toContain('## Design Rules');
    expect(content).toContain('## Tokens');
  });
});

describe('writeTokensJson', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-writer-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('creates .aiui/tokens.json file', () => {
    const dir = makeTempDir();
    writeTokensJson(makeTokens(), dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('file content is valid JSON', () => {
    const dir = makeTempDir();
    writeTokensJson(makeTokens(), dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('JSON has correct key-value pairs', () => {
    const dir = makeTempDir();
    writeTokensJson(makeTokens(), dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(parsed['color.primary']).toBe('#3b82f6');
    expect(parsed['font.body']).toBe('Inter');
    expect(parsed['spacing.sm']).toBe('0.5rem');
  });
});

describe('addToGitignore', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-writer-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('creates entry in .gitignore when file exists', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules\n');
    addToGitignore(dir);
    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8');
    expect(content).toContain('.aiui/tokens.json');
  });

  it('does not duplicate entry if already present', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules\n.aiui/tokens.json\n');
    addToGitignore(dir);
    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8');
    const count = content.split('.aiui/tokens.json').length - 1;
    expect(count).toBe(1);
  });

  it('handles missing .gitignore gracefully', () => {
    const dir = makeTempDir();
    expect(() => addToGitignore(dir)).not.toThrow();
    expect(fs.existsSync(path.join(dir, '.gitignore'))).toBe(false);
  });
});
