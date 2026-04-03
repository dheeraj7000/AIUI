import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import { generateBundle, type BundleInput } from '../bundler';

function makeBundleInput(overrides?: Partial<BundleInput>): BundleInput {
  return {
    projectName: 'Test Project',
    projectSlug: 'test-project',
    framework: 'nextjs-tailwind',
    stylePackId: 'saas-clean-v1',
    baseTokens: {
      'color.primary': '#2563eb',
      'color.background': '#ffffff',
      'color.foreground': '#0f172a',
      'font.heading': 'Inter',
      'font.body': 'Inter',
      'radius.sm': '4px',
      'radius.md': '8px',
      'radius.lg': '16px',
      'spacing.unit': '4px',
      'shadow.sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'shadow.md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      'shadow.lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    overrideTokens: {},
    selectedComponents: ['hero-01', 'pricing-01'],
    assets: { logo: 'https://cdn.example.com/logo.png' },
    ...overrides,
  };
}

describe('generateBundle', () => {
  it('produces a complete PromptBundle on valid input', () => {
    const result = generateBundle(makeBundleInput());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.project).toBe('Test Project');
    expect(result.bundle.framework).toBe('nextjs-tailwind');
    expect(result.bundle.stylePack).toBe('saas-clean-v1');
    expect(result.bundle.allowedComponents).toEqual(['hero-01', 'pricing-01']);
    expect(result.bundle.assets.logo).toBe('https://cdn.example.com/logo.png');
    expect(result.bundle.meta.version).toBe(1);
    expect(result.bundle.meta.checksum).toBeTruthy();
    expect(result.bundle.meta.generatedAt).toBeTruthy();
  });

  it('includes merged tokens in the bundle', () => {
    const result = generateBundle(
      makeBundleInput({
        overrideTokens: { 'color.primary': '#1a1a8e' },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.tokens['color.primary']).toBe('#1a1a8e');
  });

  it('fails fast on token validation errors', () => {
    const result = generateBundle(
      makeBundleInput({
        baseTokens: {
          'color.foreground': '#eeeeee',
          'color.background': '#ffffff',
          'color.primary': '#2563eb',
          'radius.sm': '20px',
          'radius.md': '8px',
          'radius.lg': '16px',
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validation).toBeDefined();
  });

  it('includes default and custom rules', () => {
    const result = generateBundle(
      makeBundleInput({
        customRules: ['Use semantic HTML', 'Follow accessibility guidelines'],
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.rules).toContain(
      'Use only approved components listed in allowedComponents'
    );
    expect(result.bundle.rules).toContain('Use semantic HTML');
    expect(result.bundle.rules).toContain('Follow accessibility guidelines');
  });

  it('produces a valid SHA-256 checksum', () => {
    const result = generateBundle(makeBundleInput());

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Recompute checksum from the body (everything except meta)
    const { meta, ...body } = result.bundle;
    const recomputed = createHash('sha256')
      .update(JSON.stringify(body, Object.keys(body).sort()))
      .digest('hex');

    expect(meta.checksum).toBe(recomputed);
  });

  it('produces deterministic output for same input', () => {
    const input = makeBundleInput();
    const checksums = new Set<string>();

    for (let i = 0; i < 5; i++) {
      const result = generateBundle(input);
      if (result.success) {
        checksums.add(result.bundle.meta.checksum);
      }
    }

    expect(checksums.size).toBe(1);
  });

  it('handles empty components', () => {
    const result = generateBundle(makeBundleInput({ selectedComponents: [] }));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.allowedComponents).toEqual([]);
  });

  it('increments version from input', () => {
    const result = generateBundle(makeBundleInput({ version: 5 }));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.meta.version).toBe(6);
  });

  it('handles empty assets', () => {
    const result = generateBundle(makeBundleInput({ assets: {} }));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.bundle.assets).toEqual({});
  });
});
