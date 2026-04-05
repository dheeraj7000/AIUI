import { describe, it, expect, afterEach } from 'vitest';
import { fetchRegistryIndex, fetchPack, cachePack } from '../lib/registry-client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('registry-client exports', () => {
  it('fetchRegistryIndex is a function', () => {
    expect(typeof fetchRegistryIndex).toBe('function');
  });

  it('fetchPack is a function', () => {
    expect(typeof fetchPack).toBe('function');
  });

  it('cachePack is a function', () => {
    expect(typeof cachePack).toBe('function');
  });
});

describe('cachePack', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-registry-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('writes pack to .aiui/.cache/ directory', () => {
    const dir = makeTempDir();
    const pack = {
      name: 'Test Pack',
      slug: 'test-pack',
      version: '1.0.0',
      category: 'test',
      description: 'A test style pack',
      tokenCount: 1,
      componentCount: 0,
      tokens: [{ key: 'color-primary', type: 'color', value: '#000' }],
      componentSlugs: [],
    };

    cachePack(pack, dir);

    const cachePath = path.join(dir, '.aiui', '.cache', 'test-pack.json');
    expect(fs.existsSync(cachePath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    expect(parsed.slug).toBe('test-pack');
    expect(parsed.name).toBe('Test Pack');
  });

  it('creates cache directory if it does not exist', () => {
    const dir = makeTempDir();
    const pack = {
      name: 'Another Pack',
      slug: 'another-pack',
      version: '2.0.0',
      category: 'test',
      description: 'Another pack',
      tokenCount: 0,
      componentCount: 0,
      tokens: [],
      componentSlugs: [],
    };

    const cacheDir = path.join(dir, '.aiui', '.cache');
    expect(fs.existsSync(cacheDir)).toBe(false);

    cachePack(pack, dir);
    expect(fs.existsSync(cacheDir)).toBe(true);
  });
});
