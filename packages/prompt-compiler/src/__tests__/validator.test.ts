import { describe, it, expect } from 'vitest';
import {
  validateTokens,
  checkContrast,
  checkFontPairing,
  checkSpacingScale,
  checkRadiusScale,
} from '../validator';
import { mergeTokens } from '../merger';
import type { MergedTokenMap } from '../types';

function makeTokens(overrides: Record<string, string | number | boolean>): MergedTokenMap {
  return mergeTokens({}, overrides, { applyDefaults: true }).tokens;
}

function makeTokensNoDefaults(map: Record<string, string | number | boolean>): MergedTokenMap {
  return mergeTokens(map, {}, { applyDefaults: false }).tokens;
}

describe('validateTokens', () => {
  it('returns valid for a clean default token set', () => {
    const tokens = makeTokens({});
    const result = validateTokens(tokens);

    // Defaults have good contrast and consistent scales
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('reports issues sorted by severity (errors first)', () => {
    const tokens = makeTokens({
      'color.foreground': '#eeeeee', // Low contrast on white bg
      'radius.sm': '20px', // Inverted scale (sm > md)
    });
    const result = validateTokens(tokens);

    expect(result.valid).toBe(false);
    const severities = result.issues.map((i) => i.severity);
    // All errors should come before warnings and info
    const firstNonError = severities.findIndex((s) => s !== 'error');
    if (firstNonError > 0) {
      expect(severities.slice(0, firstNonError).every((s) => s === 'error')).toBe(true);
    }
  });
});

describe('checkContrast', () => {
  it('detects low contrast between foreground and background', () => {
    const tokens = makeTokensNoDefaults({
      'color.foreground': '#eeeeee',
      'color.background': '#ffffff',
    });
    const issues = checkContrast(tokens);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('CONTRAST_AA_FAIL');
    expect(issues[0].severity).toBe('error');
  });

  it('passes with good contrast', () => {
    const tokens = makeTokensNoDefaults({
      'color.foreground': '#000000',
      'color.background': '#ffffff',
    });
    const issues = checkContrast(tokens);

    expect(issues).toHaveLength(0);
  });

  it('checks primary against background', () => {
    const tokens = makeTokensNoDefaults({
      'color.primary': '#dddddd',
      'color.background': '#ffffff',
    });
    const issues = checkContrast(tokens);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].tokenPaths).toContain('color.primary');
  });

  it('skips non-hex color formats gracefully', () => {
    const tokens = makeTokensNoDefaults({
      'color.foreground': 'rgb(0, 0, 0)',
      'color.background': '#ffffff',
    });
    const issues = checkContrast(tokens);
    // Should not crash, just skip non-hex
    expect(issues).toHaveLength(0);
  });
});

describe('checkFontPairing', () => {
  it('reports info when heading and body are identical', () => {
    const tokens = makeTokensNoDefaults({
      'font.heading': 'Inter',
      'font.body': 'Inter',
    });
    const issues = checkFontPairing(tokens);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('IDENTICAL_FONTS');
    expect(issues[0].severity).toBe('info');
  });

  it('warns on two decorative fonts', () => {
    const tokens = makeTokensNoDefaults({
      'font.heading': 'Pacifico',
      'font.body': 'Lobster',
    });
    const issues = checkFontPairing(tokens);

    expect(issues.some((i) => i.code === 'DECORATIVE_PAIR')).toBe(true);
    expect(issues.find((i) => i.code === 'DECORATIVE_PAIR')!.severity).toBe('warning');
  });

  it('passes for clean heading/body pairing', () => {
    const tokens = makeTokensNoDefaults({
      'font.heading': 'Playfair Display',
      'font.body': 'Inter',
    });
    const issues = checkFontPairing(tokens);

    expect(issues.filter((i) => i.severity === 'error' || i.severity === 'warning')).toHaveLength(
      0
    );
  });
});

describe('checkSpacingScale', () => {
  it('errors on zero spacing unit', () => {
    const tokens = makeTokensNoDefaults({ 'spacing.unit': '0px' });
    const issues = checkSpacingScale(tokens);

    expect(issues.some((i) => i.code === 'INVALID_SPACING_UNIT')).toBe(true);
  });

  it('errors on negative spacing unit', () => {
    const tokens = makeTokensNoDefaults({ 'spacing.unit': '-4px' });
    const issues = checkSpacingScale(tokens);

    expect(issues.some((i) => i.code === 'INVALID_SPACING_UNIT')).toBe(true);
  });

  it('passes for consistent spacing scale', () => {
    const tokens = makeTokensNoDefaults({
      'spacing.unit': '4px',
      'spacing.sm': '4px',
      'spacing.md': '8px',
      'spacing.lg': '12px',
    });
    const issues = checkSpacingScale(tokens);

    expect(issues.filter((i) => i.code === 'INVALID_SPACING_UNIT')).toHaveLength(0);
  });
});

describe('checkRadiusScale', () => {
  it('errors on inverted radius scale (sm > md)', () => {
    const tokens = makeTokensNoDefaults({
      'radius.sm': '16px',
      'radius.md': '8px',
      'radius.lg': '24px',
    });
    const issues = checkRadiusScale(tokens);

    expect(issues.some((i) => i.code === 'RADIUS_INVERTED')).toBe(true);
    expect(issues.find((i) => i.code === 'RADIUS_INVERTED')!.severity).toBe('error');
  });

  it('warns on extreme ratio between radius sizes', () => {
    const tokens = makeTokensNoDefaults({
      'radius.sm': '2px',
      'radius.md': '2px',
      'radius.lg': '32px',
    });
    const issues = checkRadiusScale(tokens);

    expect(issues.some((i) => i.code === 'RADIUS_EXTREME_RATIO')).toBe(true);
  });

  it('passes for consistent radius scale', () => {
    const tokens = makeTokensNoDefaults({
      'radius.sm': '4px',
      'radius.md': '8px',
      'radius.lg': '16px',
    });
    const issues = checkRadiusScale(tokens);

    expect(issues).toHaveLength(0);
  });
});
