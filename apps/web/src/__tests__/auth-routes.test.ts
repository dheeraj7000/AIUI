import { describe, it, expect } from 'vitest';
import { POST as signIn } from '../app/api/auth/signin/route';
import { POST as signUp } from '../app/api/auth/signup/route';
import { POST as setup } from '../app/api/auth/setup/route';

// ---------------------------------------------------------------------------
// Auth route handler export verification
// ---------------------------------------------------------------------------

describe('Auth route handlers — /api/auth/signin', () => {
  it('exports POST as a function', () => {
    expect(typeof signIn).toBe('function');
  });

  it('POST handler accepts one argument (request)', () => {
    expect(signIn.length).toBe(1);
  });

  it('POST handler is async', () => {
    expect(signIn.constructor.name).toBe('AsyncFunction');
  });
});

describe('Auth route handlers — /api/auth/signup', () => {
  it('exports POST as a function', () => {
    expect(typeof signUp).toBe('function');
  });

  it('POST handler accepts one argument (request)', () => {
    expect(signUp.length).toBe(1);
  });

  it('POST handler is async', () => {
    expect(signUp.constructor.name).toBe('AsyncFunction');
  });
});

describe('Auth route handlers — /api/auth/setup', () => {
  it('exports POST as a function', () => {
    expect(typeof setup).toBe('function');
  });

  it('POST handler accepts one argument (request)', () => {
    expect(setup.length).toBe(1);
  });

  it('POST handler is async', () => {
    expect(setup.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Module import smoke checks
// ---------------------------------------------------------------------------

describe('Auth route modules are importable', () => {
  it('auth/signin/route loaded without errors', () => {
    expect(signIn).toBeDefined();
  });

  it('auth/signup/route loaded without errors', () => {
    expect(signUp).toBeDefined();
  });

  it('auth/setup/route loaded without errors', () => {
    expect(setup).toBeDefined();
  });
});
