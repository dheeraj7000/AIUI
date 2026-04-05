import * as fs from 'node:fs';
import * as path from 'node:path';

export interface FrameworkInfo {
  framework: 'nextjs' | 'vite' | 'remix' | 'astro' | 'react' | 'unknown';
  hasTailwind: boolean;
  packageManager: 'pnpm' | 'yarn' | 'npm';
}

/**
 * Detect the project framework, Tailwind presence, and package manager
 * by reading package.json and lockfiles in the given directory.
 */
export function detectFramework(cwd: string = process.cwd()): FrameworkInfo {
  const pkgPath = path.join(cwd, 'package.json');
  let deps: Record<string, string> = {};
  let devDeps: Record<string, string> = {};

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    deps = pkg.dependencies ?? {};
    devDeps = pkg.devDependencies ?? {};
  }

  const allDeps = { ...deps, ...devDeps };

  // Detect framework
  let framework: FrameworkInfo['framework'] = 'unknown';
  if ('next' in allDeps) {
    framework = 'nextjs';
  } else if ('vite' in allDeps) {
    framework = 'vite';
  } else if ('@remix-run/react' in allDeps || '@remix-run/node' in allDeps) {
    framework = 'remix';
  } else if ('astro' in allDeps) {
    framework = 'astro';
  } else if ('react' in allDeps) {
    framework = 'react';
  }

  // Detect Tailwind
  const hasTailwind = 'tailwindcss' in allDeps;

  // Detect package manager
  let packageManager: FrameworkInfo['packageManager'] = 'npm';
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    packageManager = 'yarn';
  }

  return { framework, hasTailwind, packageManager };
}
