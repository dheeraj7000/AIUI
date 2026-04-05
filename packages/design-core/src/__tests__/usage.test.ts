import { describe, it, expect } from 'vitest';
import { TIER_LIMITS } from '../operations/usage';

describe('TIER_LIMITS', () => {
  it('free tier limit is 100', () => {
    expect(TIER_LIMITS.free).toBe(100);
  });

  it('pro tier limit is 1000', () => {
    expect(TIER_LIMITS.pro).toBe(1000);
  });

  it('team tier limit is 10000', () => {
    expect(TIER_LIMITS.team).toBe(10000);
  });

  it('enterprise tier limit is Infinity', () => {
    expect(TIER_LIMITS.enterprise).toBe(Infinity);
  });

  it('has exactly 4 tiers defined', () => {
    expect(Object.keys(TIER_LIMITS)).toHaveLength(4);
  });

  it('all tier limits are positive numbers', () => {
    for (const [tier, limit] of Object.entries(TIER_LIMITS)) {
      expect(tier).toBeTruthy();
      expect(limit).toBeGreaterThan(0);
      expect(typeof limit).toBe('number');
    }
  });

  it('tiers are ordered: free < pro < team < enterprise', () => {
    expect(TIER_LIMITS.free).toBeLessThan(TIER_LIMITS.pro);
    expect(TIER_LIMITS.pro).toBeLessThan(TIER_LIMITS.team);
    expect(TIER_LIMITS.team).toBeLessThan(TIER_LIMITS.enterprise);
  });
});
