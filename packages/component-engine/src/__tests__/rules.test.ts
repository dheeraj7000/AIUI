import { describe, it, expect } from 'vitest';
import { runRules } from '../rules';

describe('runRules', () => {
  it('passes with valid component types', () => {
    const result = runRules(['hero', 'features', 'pricing', 'footer']);
    expect(result.passed).toBe(true);
  });

  it('fails max-one-hero with two heroes', () => {
    const result = runRules(['hero', 'hero', 'footer']);
    expect(result.passed).toBe(false);
    const heroResult = result.results.find((r) => r.ruleId === 'max-one-hero');
    expect(heroResult?.result.passed).toBe(false);
  });

  it('fails no-duplicate-sections with duplicates', () => {
    const result = runRules(['features', 'features']);
    expect(result.passed).toBe(false);
    const dupResult = result.results.find((r) => r.ruleId === 'no-duplicate-sections');
    expect(dupResult?.result.passed).toBe(false);
  });

  it('fails require-footer when 4+ sections without footer', () => {
    const result = runRules(['hero', 'features', 'pricing', 'cta']);
    expect(result.passed).toBe(false);
    const footerResult = result.results.find((r) => r.ruleId === 'require-footer');
    expect(footerResult?.result.passed).toBe(false);
  });

  it('passes require-footer with footer included', () => {
    const result = runRules(['hero', 'features', 'pricing', 'cta', 'footer']);
    const footerResult = result.results.find((r) => r.ruleId === 'require-footer');
    expect(footerResult?.result.passed).toBe(true);
  });

  it('passes require-footer with 3 or fewer sections', () => {
    const result = runRules(['hero', 'features', 'pricing']);
    const footerResult = result.results.find((r) => r.ruleId === 'require-footer');
    expect(footerResult?.result.passed).toBe(true);
  });

  it('passes for empty list', () => {
    const result = runRules([]);
    expect(result.passed).toBe(true);
  });
});
