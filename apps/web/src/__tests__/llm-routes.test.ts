import { describe, it, expect } from 'vitest';
import { GET as getTokens } from '../app/llm/tokens/route';
import { GET as getComponents } from '../app/llm/components/route';
import { GET as getGuidelines } from '../app/llm/guidelines/route';

// ---------------------------------------------------------------------------
// LLM route handler export verification
// ---------------------------------------------------------------------------

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

describe('LLM route handlers — components', () => {
  it('exports GET as a function', () => {
    expect(typeof getComponents).toBe('function');
  });

  it('GET handler accepts one argument (NextRequest)', () => {
    expect(getComponents.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(getComponents.constructor.name).toBe('AsyncFunction');
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
// Module-level constants smoke checks (via the module being importable)
// ---------------------------------------------------------------------------

describe('LLM route modules are importable', () => {
  it('tokens/route module loaded without errors', () => {
    // If the import at the top failed, this test suite would not even run.
    expect(getTokens).toBeDefined();
  });

  it('components/route module loaded without errors', () => {
    expect(getComponents).toBeDefined();
  });

  it('guidelines/route module loaded without errors', () => {
    expect(getGuidelines).toBeDefined();
  });
});
