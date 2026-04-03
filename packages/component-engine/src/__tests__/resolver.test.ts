import { describe, it, expect } from 'vitest';
import { resolveComponents, type ComponentRecipe } from '../resolver';
import type { TokenMap } from '@aiui/prompt-compiler';

const baseTokens: TokenMap = {
  'color.primary': '#2563eb',
  'color.background': '#ffffff',
  'font.heading': 'Inter',
};

const recipes: ComponentRecipe[] = [
  {
    id: 'hero-centered-01',
    name: 'Centered Hero',
    type: 'hero',
    compatiblePacks: '*',
    slots: {
      backgroundColor: '$token:color.primary',
      title: 'Welcome',
    },
  },
  {
    id: 'hero-split-02',
    name: 'Split Hero',
    type: 'hero',
    compatiblePacks: ['saas-clean-v1'],
    requiredTokens: ['color.primary'],
    slots: {
      backgroundColor: '$token:color.primary',
    },
  },
  {
    id: 'pricing-01',
    name: 'Pricing Table',
    type: 'pricing',
    compatiblePacks: '*',
    slots: {
      accentColor: '$token:color.accent',
    },
  },
  {
    id: 'features-grid-01',
    name: 'Features Grid',
    type: 'features',
    compatiblePacks: '*',
  },
  {
    id: 'footer-01',
    name: 'Simple Footer',
    type: 'footer',
    compatiblePacks: '*',
  },
  {
    id: 'cta-01',
    name: 'CTA Section',
    type: 'cta',
    compatiblePacks: ['ecommerce-bold-v1'],
  },
];

describe('resolveComponents', () => {
  it('resolves compatible components with correct slots', () => {
    const result = resolveComponents(
      [{ componentId: 'hero-centered-01' }],
      recipes,
      'saas-clean-v1',
      baseTokens
    );

    expect(result.valid).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].compatible).toBe(true);
    expect(result.components[0].slots.backgroundColor).toBe('#2563eb');
    expect(result.components[0].slots.title).toBe('Welcome');
  });

  it('rejects incompatible component', () => {
    const result = resolveComponents(
      [{ componentId: 'cta-01' }],
      recipes,
      'saas-clean-v1',
      baseTokens
    );

    expect(result.valid).toBe(false);
    expect(result.components[0].compatible).toBe(false);
    expect(result.errors.some((e) => e.includes('incompatible'))).toBe(true);
  });

  it('resolves slot values from tokens', () => {
    const result = resolveComponents(
      [{ componentId: 'hero-centered-01' }],
      recipes,
      'any-pack',
      baseTokens
    );

    expect(result.components[0].slots.backgroundColor).toBe('#2563eb');
  });

  it('applies slot overrides over token values', () => {
    const result = resolveComponents(
      [{ componentId: 'hero-centered-01', slotOverrides: { backgroundColor: '#ff0000' } }],
      recipes,
      'any-pack',
      baseTokens
    );

    expect(result.components[0].slots.backgroundColor).toBe('#ff0000');
  });

  it('warns on missing token slot reference', () => {
    const result = resolveComponents(
      [{ componentId: 'pricing-01' }],
      recipes,
      'any-pack',
      baseTokens // no color.accent
    );

    expect(result.warnings.some((w) => w.includes('color.accent'))).toBe(true);
  });

  it('errors on unknown component ID', () => {
    const result = resolveComponents(
      [{ componentId: 'nonexistent-99' }],
      recipes,
      'any-pack',
      baseTokens
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not found'))).toBe(true);
  });

  it('enforces max-one-hero rule', () => {
    const result = resolveComponents(
      [{ componentId: 'hero-centered-01' }, { componentId: 'hero-split-02' }],
      recipes,
      'saas-clean-v1',
      baseTokens
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('hero'))).toBe(true);
  });

  it('enforces no-duplicate-ids rule', () => {
    const result = resolveComponents(
      [{ componentId: 'hero-centered-01' }, { componentId: 'hero-centered-01' }],
      recipes,
      'any-pack',
      baseTokens
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('triggers require-footer warning for 4+ sections without footer', () => {
    const result = resolveComponents(
      [
        { componentId: 'hero-centered-01' },
        { componentId: 'pricing-01' },
        { componentId: 'features-grid-01' },
        { componentId: 'cta-01' },
      ],
      recipes,
      'ecommerce-bold-v1',
      baseTokens
    );

    // require-footer triggers (4 sections, no footer)
    expect(result.errors.some((e) => e.includes('footer'))).toBe(true);
  });

  it('passes with valid selection including footer', () => {
    const result = resolveComponents(
      [
        { componentId: 'hero-centered-01' },
        { componentId: 'pricing-01' },
        { componentId: 'features-grid-01' },
        { componentId: 'footer-01' },
      ],
      recipes,
      'any-pack',
      baseTokens
    );

    expect(result.valid).toBe(true);
  });

  it('returns valid for empty selection', () => {
    const result = resolveComponents([], recipes, 'any-pack', baseTokens);

    expect(result.valid).toBe(true);
    expect(result.components).toHaveLength(0);
  });
});
