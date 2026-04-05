import { describe, it, expect } from 'vitest';
import { middleware, config } from '../middleware';

// ---------------------------------------------------------------------------
// Middleware export verification
// ---------------------------------------------------------------------------

describe('middleware export', () => {
  it('exports middleware as a function', () => {
    expect(typeof middleware).toBe('function');
  });

  it('middleware accepts one argument (request)', () => {
    expect(middleware.length).toBe(1);
  });

  it('middleware is async', () => {
    expect(middleware.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Middleware config / matcher
// ---------------------------------------------------------------------------

describe('middleware config', () => {
  it('exports a config object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('config contains a matcher array', () => {
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it('matcher patterns are strings', () => {
    for (const pattern of config.matcher) {
      expect(typeof pattern).toBe('string');
    }
  });

  it('matcher excludes static assets (_next/static)', () => {
    // The negative lookahead pattern should exclude _next/static
    const pattern = config.matcher[0];
    expect(pattern).toContain('_next/static');
  });

  it('matcher excludes image optimization (_next/image)', () => {
    const pattern = config.matcher[0];
    expect(pattern).toContain('_next/image');
  });

  it('matcher excludes favicon.ico', () => {
    const pattern = config.matcher[0];
    expect(pattern).toContain('favicon');
  });

  it('matcher excludes common image extensions', () => {
    const pattern = config.matcher[0];
    expect(pattern).toContain('svg');
    expect(pattern).toContain('png');
    expect(pattern).toContain('jpg');
  });
});
