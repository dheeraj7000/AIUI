import { describe, it, expect } from 'vitest';
import { publishPackSchema, searchPacksSchema, ratePackSchema } from '../validation/marketplace';

describe('publishPackSchema', () => {
  function makePublishInput(overrides?: Partial<Record<string, unknown>>) {
    return {
      stylePackId: '550e8400-e29b-41d4-a716-446655440000',
      namespace: 'my-org',
      description: 'A beautiful dark theme',
      ...overrides,
    };
  }

  it('accepts valid input with stylePackId, namespace, and description', () => {
    const result = publishPackSchema.safeParse(makePublishInput());
    expect(result.success).toBe(true);
  });

  it('rejects namespace with uppercase letters', () => {
    const result = publishPackSchema.safeParse(makePublishInput({ namespace: 'MyOrg' }));
    expect(result.success).toBe(false);
  });

  it('rejects namespace shorter than 2 characters', () => {
    const result = publishPackSchema.safeParse(makePublishInput({ namespace: 'a' }));
    expect(result.success).toBe(false);
  });

  it('rejects namespace with special characters except hyphens', () => {
    const result = publishPackSchema.safeParse(makePublishInput({ namespace: 'my_org' }));
    expect(result.success).toBe(false);
  });

  it('accepts namespace with hyphens', () => {
    const result = publishPackSchema.safeParse(makePublishInput({ namespace: 'my-org' }));
    expect(result.success).toBe(true);
  });

  it('makes description optional', () => {
    const { description, ...rest } = makePublishInput();
    expect(description).toBeDefined();
    const result = publishPackSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

describe('searchPacksSchema', () => {
  it('defaults sort to downloads', () => {
    const result = searchPacksSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('downloads');
    }
  });

  it('defaults limit to 20 and offset to 0', () => {
    const result = searchPacksSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });

  it('accepts all sort options: downloads, rating, newest', () => {
    for (const sort of ['downloads', 'rating', 'newest']) {
      const result = searchPacksSchema.safeParse({ sort });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe(sort);
      }
    }
  });

  it('rejects an invalid sort value', () => {
    const result = searchPacksSchema.safeParse({ sort: 'popularity' });
    expect(result.success).toBe(false);
  });

  it('coerces string limit to number', () => {
    const result = searchPacksSchema.safeParse({ limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
    }
  });
});

describe('ratePackSchema', () => {
  it('accepts score 1 through 5', () => {
    for (let score = 1; score <= 5; score++) {
      const result = ratePackSchema.safeParse({ score });
      expect(result.success).toBe(true);
    }
  });

  it('rejects score 0', () => {
    const result = ratePackSchema.safeParse({ score: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects score 6', () => {
    const result = ratePackSchema.safeParse({ score: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer scores', () => {
    const result = ratePackSchema.safeParse({ score: 3.5 });
    expect(result.success).toBe(false);
  });
});
