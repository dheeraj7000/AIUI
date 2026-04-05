import { describe, it, expect } from 'vitest';
import {
  registryTokenSchema,
  registryItemSchema,
  registryIndexItemSchema,
} from '../validation/registry';

function makeToken(
  overrides?: Partial<{ key: string; type: string; value: string; description: string }>
) {
  return {
    key: 'color.primary',
    type: 'color',
    value: '#3b82f6',
    ...overrides,
  };
}

function makeRegistryItem(overrides?: Partial<Record<string, unknown>>) {
  return {
    name: 'Ocean Theme',
    slug: 'ocean-theme',
    version: '1.0.0',
    category: 'theme',
    description: 'A calming ocean-inspired theme',
    tokenCount: 2,
    componentCount: 1,
    tokens: [makeToken()],
    componentSlugs: ['button'],
    ...overrides,
  };
}

function makeIndexItem(overrides?: Partial<Record<string, unknown>>) {
  return {
    name: 'Ocean Theme',
    slug: 'ocean-theme',
    version: '1.0.0',
    category: 'theme',
    description: 'A calming ocean-inspired theme',
    tokenCount: 2,
    componentCount: 1,
    ...overrides,
  };
}

describe('registryTokenSchema', () => {
  it('accepts a valid token with key, type, and value', () => {
    const result = registryTokenSchema.safeParse(makeToken());
    expect(result.success).toBe(true);
  });

  it('accepts a token with optional description', () => {
    const result = registryTokenSchema.safeParse(makeToken({ description: 'Primary brand color' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Primary brand color');
    }
  });

  it('rejects a token missing key', () => {
    const { key, ...rest } = makeToken();
    expect(key).toBeDefined();
    const result = registryTokenSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a token missing type', () => {
    const { type, ...rest } = makeToken();
    expect(type).toBeDefined();
    const result = registryTokenSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('registryItemSchema', () => {
  it('accepts a valid complete item with all fields', () => {
    const result = registryItemSchema.safeParse(makeRegistryItem());
    expect(result.success).toBe(true);
  });

  it('accepts an item with an empty tokens array', () => {
    const result = registryItemSchema.safeParse(makeRegistryItem({ tokens: [] }));
    expect(result.success).toBe(true);
  });

  it('accepts an item with an empty componentSlugs array', () => {
    const result = registryItemSchema.safeParse(makeRegistryItem({ componentSlugs: [] }));
    expect(result.success).toBe(true);
  });

  it('rejects an item missing name', () => {
    const item = makeRegistryItem();
    const { name, ...rest } = item;
    expect(name).toBeDefined();
    const result = registryItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects an item missing slug', () => {
    const item = makeRegistryItem();
    const { slug, ...rest } = item;
    expect(slug).toBeDefined();
    const result = registryItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('registryIndexItemSchema', () => {
  it('accepts a valid index item', () => {
    const result = registryIndexItemSchema.safeParse(makeIndexItem());
    expect(result.success).toBe(true);
  });

  it('rejects an index item missing tokenCount', () => {
    const item = makeIndexItem();
    const { tokenCount, ...rest } = item;
    expect(tokenCount).toBeDefined();
    const result = registryIndexItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
