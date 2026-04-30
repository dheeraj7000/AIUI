import { describe, it, expect } from 'vitest';
import { authenticateLlmRequest, isAuthError, getDb } from '../app/llm/lib/auth';
import type { LlmAuthResult, LlmAuthError } from '../app/llm/lib/auth';

// ---------------------------------------------------------------------------
// Module export verification
// ---------------------------------------------------------------------------

describe('llm/lib/auth module exports', () => {
  it('exports authenticateLlmRequest as a function', () => {
    expect(typeof authenticateLlmRequest).toBe('function');
  });

  it('exports isAuthError as a function', () => {
    expect(typeof isAuthError).toBe('function');
  });

  it('exports getDb as a function', () => {
    expect(typeof getDb).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// isAuthError type guard
// ---------------------------------------------------------------------------

describe('isAuthError', () => {
  it('returns true for an auth error object', () => {
    const error: LlmAuthError = { error: 'Not found', status: 404 };
    expect(isAuthError(error)).toBe(true);
  });

  it('returns true for various HTTP error statuses', () => {
    const statuses = [400, 401, 403, 404, 500];
    for (const status of statuses) {
      const error: LlmAuthError = { error: `Error ${status}`, status };
      expect(isAuthError(error)).toBe(true);
    }
  });

  it('returns false for a successful auth result', () => {
    // Construct a minimal mock that satisfies the LlmAuthResult shape
    const success = {
      project: { id: '1', name: 'Test', slug: 'test' },
      tokens: [],
    } as unknown as LlmAuthResult;

    expect(isAuthError(success)).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isAuthError({} as LlmAuthResult | LlmAuthError)).toBe(false);
  });

  it('returns false when only "error" key is present (no "status")', () => {
    const partial = { error: 'Missing status' } as unknown as LlmAuthResult | LlmAuthError;
    // The guard checks for both "error" and "status"
    expect(isAuthError(partial)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDb validation
// ---------------------------------------------------------------------------

describe('getDb', () => {
  it('throws when DATABASE_URL is not set', () => {
    // Ensure env var is cleared
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    expect(() => getDb()).toThrow('DATABASE_URL is not set');

    // Restore
    if (original !== undefined) {
      process.env.DATABASE_URL = original;
    }
  });
});

// ---------------------------------------------------------------------------
// authenticateLlmRequest function signature
// ---------------------------------------------------------------------------

describe('authenticateLlmRequest', () => {
  it('accepts three arguments (request, db, projectSlug)', () => {
    // Function.length reports the number of formal parameters
    expect(authenticateLlmRequest.length).toBe(3);
  });

  it('returns a promise (async function)', () => {
    // Verify it's an async function by checking its constructor name
    expect(authenticateLlmRequest.constructor.name).toBe('AsyncFunction');
  });
});
