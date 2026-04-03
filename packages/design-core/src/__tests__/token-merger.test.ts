import { describe, it, expect } from 'vitest';
import { mergeTokens, mergeMultiple } from '../tokens/token-merger';

describe('mergeTokens', () => {
  it('should merge two maps with no conflicts', () => {
    const base = { 'color.primary': '#000', 'spacing.sm': '4px' };
    const overrides = { 'color.secondary': '#fff', 'radius.md': '8px' };

    const result = mergeTokens(base, overrides);
    expect(result).toEqual({
      'color.primary': '#000',
      'spacing.sm': '4px',
      'color.secondary': '#fff',
      'radius.md': '8px',
    });
  });

  it('should let overrides win on conflict', () => {
    const base = { 'color.primary': '#000', 'spacing.sm': '4px' };
    const overrides = { 'color.primary': '#ff0000' };

    const result = mergeTokens(base, overrides);
    expect(result['color.primary']).toBe('#ff0000');
    expect(result['spacing.sm']).toBe('4px');
  });

  it('should return base unchanged when overrides is empty', () => {
    const base = { 'color.primary': '#000', 'spacing.sm': '4px' };
    const overrides = {};

    const result = mergeTokens(base, overrides);
    expect(result).toEqual(base);
  });

  it('should return overrides when base is empty', () => {
    const base = {};
    const overrides = { 'color.primary': '#ff0000' };

    const result = mergeTokens(base, overrides);
    expect(result).toEqual(overrides);
  });
});

describe('mergeMultiple', () => {
  it('should chain multiple merges left to right', () => {
    const maps = [
      { 'color.primary': '#000', 'spacing.sm': '4px' },
      { 'color.primary': '#111', 'radius.md': '8px' },
      { 'color.primary': '#222', 'spacing.sm': '8px' },
    ];

    const result = mergeMultiple(maps);
    expect(result).toEqual({
      'color.primary': '#222',
      'spacing.sm': '8px',
      'radius.md': '8px',
    });
  });

  it('should return empty object for empty array', () => {
    const result = mergeMultiple([]);
    expect(result).toEqual({});
  });

  it('should return the single map unchanged for a one-element array', () => {
    const map = { 'color.primary': '#000' };
    const result = mergeMultiple([map]);
    expect(result).toEqual(map);
  });
});
