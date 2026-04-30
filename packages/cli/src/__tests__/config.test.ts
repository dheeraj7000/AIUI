import { describe, it, expect, afterEach } from 'vitest';
import { readConfig, writeConfig, ensureAiuiDir, configSchema } from '../lib/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

function makeValidConfig() {
  return {
    projectSlug: 'my-project',
    framework: 'nextjs',
  };
}

describe('configSchema', () => {
  it('parses a valid config object', () => {
    const result = configSchema.safeParse(makeValidConfig());
    expect(result.success).toBe(true);
  });

  it('rejects missing projectSlug', () => {
    const { projectSlug, ...rest } = makeValidConfig();
    expect(projectSlug).toBeDefined();
    const result = configSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing framework', () => {
    const { framework, ...rest } = makeValidConfig();
    expect(framework).toBeDefined();
    const result = configSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('allows optional lastSynced', () => {
    const config = { ...makeValidConfig(), lastSynced: '2026-01-01T00:00:00Z' };
    const result = configSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lastSynced).toBe('2026-01-01T00:00:00Z');
    }
  });

  it('allows optional apiUrl', () => {
    const config = { ...makeValidConfig(), apiUrl: 'https://aiui.store' };
    const result = configSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.apiUrl).toBe('https://aiui.store');
    }
  });
});

describe('ensureAiuiDir', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-config-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('creates .aiui directory if missing', () => {
    const dir = makeTempDir();
    const aiuiDir = ensureAiuiDir(dir);
    expect(fs.existsSync(aiuiDir)).toBe(true);
    expect(aiuiDir).toBe(path.join(dir, '.aiui'));
  });

  it('is idempotent — calling twice does not throw', () => {
    const dir = makeTempDir();
    ensureAiuiDir(dir);
    expect(() => ensureAiuiDir(dir)).not.toThrow();
    expect(fs.existsSync(path.join(dir, '.aiui'))).toBe(true);
  });
});

describe('writeConfig / readConfig', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-config-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('writeConfig creates .aiui/config.json with valid JSON', () => {
    const dir = makeTempDir();
    const config = makeValidConfig();
    writeConfig(config, dir);

    const configPath = path.join(dir, '.aiui', 'config.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const raw = fs.readFileSync(configPath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('readConfig returns null when no config file exists', () => {
    const dir = makeTempDir();
    const result = readConfig(dir);
    expect(result).toBeNull();
  });

  it('readConfig returns parsed config after writeConfig', () => {
    const dir = makeTempDir();
    const config = makeValidConfig();
    writeConfig(config, dir);

    const result = readConfig(dir);
    expect(result).not.toBeNull();
    expect(result!.projectSlug).toBe('my-project');
    expect(result!.framework).toBe('nextjs');
  });

  it('readConfig throws on malformed JSON in config file', () => {
    const dir = makeTempDir();
    fs.mkdirSync(path.join(dir, '.aiui'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.aiui', 'config.json'), '{ broken json!!!');

    expect(() => readConfig(dir)).toThrow();
  });

  it('writeConfig -> readConfig roundtrip preserves all fields', () => {
    const dir = makeTempDir();
    const config = {
      ...makeValidConfig(),
      apiUrl: 'https://aiui.store',
      lastSynced: '2026-04-01T12:00:00Z',
    };
    writeConfig(config, dir);

    const result = readConfig(dir);
    expect(result).toEqual(config);
  });
});
