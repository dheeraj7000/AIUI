import { describe, it, expect, afterEach } from 'vitest';
import {
  generateDesignMemory,
  writeDesignMemory,
  writeTokensJson,
  addToGitignore,
} from '../lib/writer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

function makePack() {
  return {
    name: 'Test Pack',
    slug: 'test-pack',
    version: '1.0.0',
    category: 'test',
    description: 'A test style pack',
    tokenCount: 3,
    componentCount: 2,
    tokens: [
      { key: 'color-primary', type: 'color', value: '#3b82f6' },
      { key: 'font-body', type: 'font', value: 'Inter' },
      { key: 'spacing-sm', type: 'spacing', value: '0.5rem' },
    ],
    componentSlugs: ['button', 'card'],
  };
}

describe('generateDesignMemory', () => {
  it('returns string containing the pack name', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('Test Pack');
  });

  it('contains Design Rules section', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('## Design Rules');
  });

  it('contains Foundation Tokens section', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('## Foundation Tokens');
  });

  it('contains all 7 design rules', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('1. **Always use design tokens**');
    expect(md).toContain('2. **Follow the component library**');
    expect(md).toContain('3. **Maintain visual hierarchy**');
    expect(md).toContain('4. **Respect the type system**');
    expect(md).toContain('5. **Use the spacing scale**');
    expect(md).toContain('6. **Maintain accessibility**');
    expect(md).toContain('7. **Preserve design consistency**');
  });

  it('contains token values in markdown table format', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('| `color-primary` | `#3b82f6` |');
    expect(md).toContain('| `font-body` | `Inter` |');
    expect(md).toContain('| `spacing-sm` | `0.5rem` |');
  });

  it('contains component slugs', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('`button`');
    expect(md).toContain('`card`');
  });

  it('contains the pack category and version', () => {
    const md = generateDesignMemory(makePack());
    expect(md).toContain('test');
    expect(md).toContain('1.0.0');
  });

  it('contains Generated: with ISO date substring', () => {
    const md = generateDesignMemory(makePack());
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
    writeDesignMemory(makePack(), dir);
    const filePath = path.join(dir, '.aiui', 'design-memory.md');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('file content matches generateDesignMemory output', () => {
    const dir = makeTempDir();
    const pack = makePack();
    writeDesignMemory(pack, dir);
    const filePath = path.join(dir, '.aiui', 'design-memory.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    // The generated date will differ slightly, but the structure should match.
    // We check key sections instead of exact equality.
    expect(content).toContain('# Design Memory — Test Pack');
    expect(content).toContain('## Design Rules');
    expect(content).toContain('## Foundation Tokens');
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
    writeTokensJson(makePack().tokens, dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('file content is valid JSON', () => {
    const dir = makeTempDir();
    writeTokensJson(makePack().tokens, dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('JSON has correct key-value pairs', () => {
    const dir = makeTempDir();
    const tokens = makePack().tokens;
    writeTokensJson(tokens, dir);
    const filePath = path.join(dir, '.aiui', 'tokens.json');
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(parsed['color-primary']).toBe('#3b82f6');
    expect(parsed['font-body']).toBe('Inter');
    expect(parsed['spacing-sm']).toBe('0.5rem');
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
    // No .gitignore exists — should not throw and should not create one
    expect(() => addToGitignore(dir)).not.toThrow();
    expect(fs.existsSync(path.join(dir, '.gitignore'))).toBe(false);
  });
});
