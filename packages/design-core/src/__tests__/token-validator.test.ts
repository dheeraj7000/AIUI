import { describe, it, expect } from 'vitest';
import { validateToken, validateStylePack } from '../tokens/token-validator';

describe('validateToken', () => {
  // --- Color tests ---
  describe('color tokens', () => {
    it('should pass for a valid 6-digit hex color', () => {
      const result = validateToken('color.primary', '#ff5733', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for a valid 3-digit hex color', () => {
      const result = validateToken('color.accent', '#f00', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for rgb() notation', () => {
      const result = validateToken('color.bg', 'rgb(255, 0, 0)', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for hsl() notation', () => {
      const result = validateToken('color.bg', 'hsl(120, 100%, 50%)', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for oklch() notation', () => {
      const result = validateToken('color.bg', 'oklch(0.7 0.15 180)', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for a CSS named color', () => {
      const result = validateToken('color.bg', 'rebeccapurple', 'color');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for an invalid color value', () => {
      const result = validateToken('color.primary', 'not-a-color', 'color');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid value');
    });

    it('should fail for a malformed hex color', () => {
      const result = validateToken('color.primary', '#xyz', 'color');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // --- Radius tests ---
  describe('radius tokens', () => {
    it('should pass for a valid px radius', () => {
      const result = validateToken('radius.md', '8px', 'radius');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for a valid rem radius', () => {
      const result = validateToken('radius.lg', '0.5rem', 'radius');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for zero', () => {
      const result = validateToken('radius.none', '0', 'radius');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for an invalid radius', () => {
      const result = validateToken('radius.md', 'big', 'radius');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid value');
    });
  });

  // --- Spacing tests ---
  describe('spacing tokens', () => {
    it('should pass for a valid spacing value', () => {
      const result = validateToken('spacing.sm', '4px', 'spacing');
      expect(result.valid).toBe(true);
    });

    it('should fail for percentage in spacing', () => {
      const result = validateToken('spacing.sm', '50%', 'spacing');
      expect(result.valid).toBe(false);
    });
  });

  // --- Elevation tests ---
  describe('elevation tokens', () => {
    it('should pass for a numeric elevation', () => {
      const result = validateToken('elevation.modal', '100', 'elevation');
      expect(result.valid).toBe(true);
    });

    it('should fail for non-numeric elevation', () => {
      const result = validateToken('elevation.modal', 'high', 'elevation');
      expect(result.valid).toBe(false);
    });
  });

  // --- Unknown type ---
  it('should fail for an unknown token type', () => {
    const result = validateToken('custom.thing', 'value', 'unknown');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Unknown token type');
  });

  // --- Warnings ---
  it('should warn when key prefix does not match token type', () => {
    const result = validateToken('bg.primary', '#ff0000', 'color');
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('does not match');
  });
});

describe('validateStylePack', () => {
  it('should validate a full style pack of tokens', () => {
    const tokens = [
      { tokenKey: 'color.primary', tokenValue: '#3b82f6', tokenType: 'color' },
      { tokenKey: 'color.secondary', tokenValue: 'hsl(220, 70%, 50%)', tokenType: 'color' },
      { tokenKey: 'radius.md', tokenValue: '8px', tokenType: 'radius' },
      { tokenKey: 'font.heading', tokenValue: 'Inter', tokenType: 'font' },
      { tokenKey: 'spacing.sm', tokenValue: '4px', tokenType: 'spacing' },
      { tokenKey: 'shadow.card', tokenValue: '0 2px 4px rgba(0,0,0,0.1)', tokenType: 'shadow' },
      { tokenKey: 'elevation.modal', tokenValue: '1000', tokenType: 'elevation' },
    ];

    const results = validateStylePack(tokens);
    expect(results).toHaveLength(7);
    results.forEach((r) => {
      expect(r.valid).toBe(true);
      expect(r.errors).toHaveLength(0);
    });
  });

  it('should report errors for invalid tokens in a style pack', () => {
    const tokens = [
      { tokenKey: 'color.primary', tokenValue: 'not-valid', tokenType: 'color' },
      { tokenKey: 'radius.md', tokenValue: '8px', tokenType: 'radius' },
    ];

    const results = validateStylePack(tokens);
    expect(results[0].valid).toBe(false);
    expect(results[1].valid).toBe(true);
  });
});
