import { describe, it, expect } from 'vitest';
import { GET as getTokens } from '../app/llm/tokens/route';
import { GET as getGuidelines } from '../app/llm/guidelines/route';

// ---------------------------------------------------------------------------
// LLM route handler export verification
// ---------------------------------------------------------------------------
//
// Note: the /llm/components route was removed in the post-2026-04 scope cut
// alongside style packs and component recipes. Only tokens + guidelines
// remain.

describe('LLM route handlers — tokens', () => {
  it('exports GET as a function', () => {
    expect(typeof getTokens).toBe('function');
  });

  it('GET handler accepts one argument (NextRequest)', () => {
    expect(getTokens.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(getTokens.constructor.name).toBe('AsyncFunction');
  });
});

describe('LLM route handlers — guidelines', () => {
  it('exports GET as a function', () => {
    expect(typeof getGuidelines).toBe('function');
  });

  it('GET handler accepts one argument (NextRequest)', () => {
    expect(getGuidelines.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(getGuidelines.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Module-level smoke checks
// ---------------------------------------------------------------------------

describe('LLM route modules are importable', () => {
  it('tokens/route module loaded without errors', () => {
    expect(getTokens).toBeDefined();
  });

  it('guidelines/route module loaded without errors', () => {
    expect(getGuidelines).toBeDefined();
  });
});
