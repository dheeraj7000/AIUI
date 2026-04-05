import { describe, it, expect } from 'vitest';
import { mergeTokens, DEFAULT_TOKENS } from '../merger';
import type { TokenMap } from '../types';

describe('mergeTokens', () => {
  describe('simple merge', () => {
    it('merges base and overrides with no conflicts', () => {
      const base: TokenMap = { 'color.primary': '#000' };
      const overrides: TokenMap = { 'color.secondary': '#fff' };
      const { tokens } = mergeTokens(base, overrides, { applyDefaults: false });

      expect(tokens['color.primary']).toBe('#000');
      expect(tokens['color.secondary']).toBe('#fff');
    });

    it('handles empty overrides', () => {
      const base: TokenMap = { 'font.heading': 'Inter', 'color.primary': '#2563eb' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['font.heading']).toBe('Inter');
      expect(tokens['color.primary']).toBe('#2563eb');
    });

    it('handles empty base', () => {
      const overrides: TokenMap = { 'font.heading': 'Roboto' };
      const { tokens } = mergeTokens({}, overrides, { applyDefaults: false });

      expect(tokens['font.heading']).toBe('Roboto');
    });
  });

  describe('override precedence', () => {
    it('overrides win over base tokens', () => {
      const base: TokenMap = { 'color.primary': '#000', 'color.secondary': '#111' };
      const overrides: TokenMap = { 'color.primary': '#fff' };
      const { tokens } = mergeTokens(base, overrides, { applyDefaults: false });

      expect(tokens['color.primary']).toBe('#fff');
      expect(tokens['color.secondary']).toBe('#111');
    });

    it('all tokens overridden', () => {
      const base: TokenMap = { a: 'base-a', b: 'base-b' };
      const overrides: TokenMap = { a: 'over-a', b: 'over-b' };
      const { tokens } = mergeTokens(base, overrides, { applyDefaults: false });

      expect(tokens['a']).toBe('over-a');
      expect(tokens['b']).toBe('over-b');
    });
  });

  describe('$ref resolution', () => {
    it('resolves simple $ref', () => {
      const base: TokenMap = {
        'color.primary': '#2563eb',
        'color.link': '$ref:color.primary',
      };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['color.link']).toBe('#2563eb');
    });

    it('resolves chained $ref (2 levels)', () => {
      const base: TokenMap = {
        'color.primary': '#2563eb',
        'color.accent': '$ref:color.primary',
        'color.link': '$ref:color.accent',
      };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['color.link']).toBe('#2563eb');
      expect(tokens['color.accent']).toBe('#2563eb');
    });

    it('resolves chained $ref (3 levels)', () => {
      const base: TokenMap = {
        'color.base': '#000',
        'color.level1': '$ref:color.base',
        'color.level2': '$ref:color.level1',
        'color.level3': '$ref:color.level2',
      };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['color.level3']).toBe('#000');
    });

    it('throws on circular $ref', () => {
      const base: TokenMap = {
        'color.a': '$ref:color.b',
        'color.b': '$ref:color.a',
      };

      expect(() => mergeTokens(base, {}, { applyDefaults: false })).toThrow(
        /Circular \$ref detected/
      );
    });

    it('throws on self-referencing $ref', () => {
      const base: TokenMap = {
        'color.loop': '$ref:color.loop',
      };

      expect(() => mergeTokens(base, {}, { applyDefaults: false })).toThrow(
        /Circular \$ref detected/
      );
    });

    it('throws when $ref exceeds max depth', () => {
      // Keys ordered so deepest ref is iterated first (no caching shortcut)
      const base: TokenMap = {
        e: '$ref:d',
        d: '$ref:c',
        c: '$ref:b',
        b: '$ref:a',
        a: '#000',
      };

      expect(() => mergeTokens(base, {}, { applyDefaults: false, maxRefDepth: 2 })).toThrow(
        /exceeded max depth/
      );
    });

    it('warns on unresolvable $ref target', () => {
      const base: TokenMap = {
        'color.link': '$ref:color.nonexistent',
      };
      const { tokens, warnings } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['color.link']).toBe('$ref:color.nonexistent');
      expect(warnings.some((w) => w.includes('Unresolvable $ref'))).toBe(true);
    });
  });

  describe('type coercion', () => {
    it('coerces string number to number', () => {
      const base: TokenMap = { 'spacing.unit': '12' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['spacing.unit']).toBe(12);
      expect(typeof tokens['spacing.unit']).toBe('number');
    });

    it('coerces negative string number', () => {
      const base: TokenMap = { 'offset.x': '-5' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['offset.x']).toBe(-5);
    });

    it('coerces decimal string number', () => {
      const base: TokenMap = { ratio: '1.5' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['ratio']).toBe(1.5);
    });

    it('coerces string "true" to boolean', () => {
      const base: TokenMap = { 'feature.enabled': 'true' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['feature.enabled']).toBe(true);
    });

    it('coerces string "false" to boolean', () => {
      const base: TokenMap = { 'feature.disabled': 'false' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['feature.disabled']).toBe(false);
    });

    it('does not coerce CSS values like "4px"', () => {
      const base: TokenMap = { 'radius.md': '4px' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['radius.md']).toBe('4px');
    });

    it('does not coerce hex colors', () => {
      const base: TokenMap = { 'color.primary': '#2563eb' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false });

      expect(tokens['color.primary']).toBe('#2563eb');
    });

    it('skips coercion when coerceTypes is false', () => {
      const base: TokenMap = { 'spacing.unit': '12' };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false, coerceTypes: false });

      expect(tokens['spacing.unit']).toBe('12');
      expect(typeof tokens['spacing.unit']).toBe('string');
    });
  });

  describe('default token injection', () => {
    it('injects defaults for missing required tokens', () => {
      const { tokens, warnings } = mergeTokens({}, {});

      for (const key of Object.keys(DEFAULT_TOKENS)) {
        expect(tokens[key]).toBeDefined();
      }
      expect(warnings.some((w) => w.includes('Default applied'))).toBe(true);
    });

    it('does not override existing tokens with defaults', () => {
      const base: TokenMap = { 'color.primary': '#ff0000' };
      const { tokens } = mergeTokens(base, {});

      expect(tokens['color.primary']).toBe('#ff0000');
    });

    it('skips defaults when applyDefaults is false', () => {
      const { tokens } = mergeTokens({}, {}, { applyDefaults: false });

      expect(Object.keys(tokens).length).toBe(0);
    });
  });

  describe('strict mode', () => {
    it('warns on override keys not in base', () => {
      const base: TokenMap = { 'color.primary': '#000' };
      const overrides: TokenMap = { 'color.unknown': '#fff' };
      const { warnings } = mergeTokens(base, overrides, {
        strict: true,
        applyDefaults: false,
      });

      expect(warnings.some((w) => w.includes('Strict mode'))).toBe(true);
      expect(warnings.some((w) => w.includes('color.unknown'))).toBe(true);
    });

    it('does not warn in non-strict mode', () => {
      const base: TokenMap = { 'color.primary': '#000' };
      const overrides: TokenMap = { 'color.unknown': '#fff' };
      const { warnings } = mergeTokens(base, overrides, {
        strict: false,
        applyDefaults: false,
      });

      expect(warnings.filter((w) => w.includes('Strict mode')).length).toBe(0);
    });
  });

  describe('Zod validation', () => {
    it('rejects token maps with invalid value types', () => {
      const base = { key: { nested: true } } as unknown as TokenMap;
      expect(() => mergeTokens(base, {}, { applyDefaults: false })).toThrow();
    });

    it('accepts valid token values (string, number, boolean)', () => {
      const base: TokenMap = {
        str: 'hello',
        num: 42,
        bool: true,
      };
      const { tokens } = mergeTokens(base, {}, { applyDefaults: false, coerceTypes: false });

      expect(tokens['str']).toBe('hello');
      expect(tokens['num']).toBe(42);
      expect(tokens['bool']).toBe(true);
    });
  });

  describe('combined scenarios', () => {
    it('handles overrides with $ref + coercion + defaults', () => {
      const base: TokenMap = {
        'color.primary': '#2563eb',
        'spacing.base': '8',
      };
      const overrides: TokenMap = {
        'color.link': '$ref:color.primary',
      };
      const { tokens } = mergeTokens(base, overrides);

      // $ref resolved
      expect(tokens['color.link']).toBe('#2563eb');
      // Type coerced
      expect(tokens['spacing.base']).toBe(8);
      // Defaults injected for missing keys
      expect(tokens['font.heading']).toBe('Inter');
    });

    it('returns branded MergedTokenMap', () => {
      const { tokens } = mergeTokens({ 'color.primary': '#000' }, {}, { applyDefaults: false });
      // The branded type is a compile-time concern, but we can verify
      // the runtime shape is a plain object with the right values
      expect(typeof tokens).toBe('object');
      expect(tokens['color.primary']).toBe('#000');
    });
  });
});
