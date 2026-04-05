import { describe, it, expect } from 'vitest';
import { GET as getUsage } from '../app/api/usage/route';
import { GET as getUsageHistory } from '../app/api/usage/history/route';

// ---------------------------------------------------------------------------
// Usage route handler export verification
// ---------------------------------------------------------------------------

describe('Usage route handlers — /api/usage', () => {
  it('exports GET as a function', () => {
    expect(typeof getUsage).toBe('function');
  });

  it('GET handler accepts one argument (request)', () => {
    expect(getUsage.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(getUsage.constructor.name).toBe('AsyncFunction');
  });
});

describe('Usage route handlers — /api/usage/history', () => {
  it('exports GET as a function', () => {
    expect(typeof getUsageHistory).toBe('function');
  });

  it('GET handler accepts one argument (request)', () => {
    expect(getUsageHistory.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(getUsageHistory.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Module import smoke checks
// ---------------------------------------------------------------------------

describe('Usage route modules are importable', () => {
  it('usage/route loaded without errors', () => {
    expect(getUsage).toBeDefined();
  });

  it('usage/history/route loaded without errors', () => {
    expect(getUsageHistory).toBeDefined();
  });
});
