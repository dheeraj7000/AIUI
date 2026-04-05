import { describe, it, expect } from 'vitest';
import { getCachedCredits, checkCredits, trackUsageAsync } from '../lib/usage';

describe('Usage middleware exports', () => {
  it('getCachedCredits is a function', () => {
    expect(typeof getCachedCredits).toBe('function');
  });

  it('checkCredits is a function', () => {
    expect(typeof checkCredits).toBe('function');
  });

  it('trackUsageAsync is a function', () => {
    expect(typeof trackUsageAsync).toBe('function');
  });
});

describe('getCachedCredits', () => {
  it('returns null for an unknown organization (no cache entry)', () => {
    const result = getCachedCredits('org-that-does-not-exist-' + Date.now());
    expect(result).toBeNull();
  });
});
