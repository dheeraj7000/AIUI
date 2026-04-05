import { describe, it, expect, afterEach } from 'vitest';
import { detectFramework } from '../lib/detect-framework';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';

const MONOREPO_ROOT = path.resolve(__dirname, '../../../../');
const WEB_APP_DIR = path.resolve(__dirname, '../../../../apps/web');

describe('detectFramework', () => {
  const tempDirs: string[] = [];

  function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiui-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('detects nextjs for the AIUI web app', () => {
    const result = detectFramework(WEB_APP_DIR);
    expect(result.framework).toBe('nextjs');
  });

  it('returns hasTailwind true for the AIUI web app', () => {
    const result = detectFramework(WEB_APP_DIR);
    expect(result.hasTailwind).toBe(true);
  });

  it('returns packageManager pnpm for the AIUI root', () => {
    const result = detectFramework(MONOREPO_ROOT);
    expect(result.packageManager).toBe('pnpm');
  });

  it('returns framework unknown for a non-existent directory', () => {
    const result = detectFramework('/tmp/does-not-exist-aiui-test');
    expect(result.framework).toBe('unknown');
  });

  it('returns framework unknown when no package.json exists', () => {
    const dir = makeTempDir();
    const result = detectFramework(dir);
    expect(result.framework).toBe('unknown');
  });

  it('detects vite from dependencies', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ dependencies: { vite: '1.0.0' } })
    );
    const result = detectFramework(dir);
    expect(result.framework).toBe('vite');
  });

  it('detects remix from dependencies', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ dependencies: { '@remix-run/react': '1.0.0' } })
    );
    const result = detectFramework(dir);
    expect(result.framework).toBe('remix');
  });

  it('detects astro from dependencies', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ dependencies: { astro: '1.0.0' } })
    );
    const result = detectFramework(dir);
    expect(result.framework).toBe('astro');
  });

  it('detects react from dependencies', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ dependencies: { react: '1.0.0' } })
    );
    const result = detectFramework(dir);
    expect(result.framework).toBe('react');
  });

  it('detects hasTailwind true from devDependencies', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ devDependencies: { tailwindcss: '4.0' } })
    );
    const result = detectFramework(dir);
    expect(result.hasTailwind).toBe(true);
  });

  it('returns hasTailwind false when tailwindcss is absent', () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ dependencies: { react: '1.0.0' } })
    );
    const result = detectFramework(dir);
    expect(result.hasTailwind).toBe(false);
  });

  it('detects npm when no lockfile is present', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({}));
    const result = detectFramework(dir);
    expect(result.packageManager).toBe('npm');
  });

  it('detects pnpm when pnpm-lock.yaml exists', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    const result = detectFramework(dir);
    expect(result.packageManager).toBe('pnpm');
  });

  it('detects yarn when yarn.lock exists', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    const result = detectFramework(dir);
    expect(result.packageManager).toBe('yarn');
  });
});
