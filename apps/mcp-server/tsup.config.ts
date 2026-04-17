import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/tools/detectors.ts', 'src/tools/anti-patterns.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  dts: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Bundle workspace packages (they don't exist on npm)
  noExternal: [
    '@aiui/design-core',
    '@aiui/prompt-compiler',
    '@aiui/component-engine',
    '@aiui/types',
  ],
  // Keep npm-installable packages as external
  external: [
    '@modelcontextprotocol/sdk',
    'drizzle-orm',
    'postgres',
    'express',
    'zod',
    'crypto',
    'bcryptjs',
    // Storage deps — must stay external
    'sharp',
    'opentype.js',
  ],
});
