import { describe, it, expect } from 'vitest';
import { requireScope } from '../lib/auth';

describe('requireScope', () => {
  it('does not throw when the required scope is present', () => {
    expect(() => requireScope(['mcp:read'], 'mcp:read')).not.toThrow();
  });

  it('does not throw when required scope is among multiple scopes', () => {
    expect(() => requireScope(['mcp:read', 'mcp:write'], 'mcp:write')).not.toThrow();
  });

  it('throws an error when the required scope is missing', () => {
    expect(() => requireScope(['mcp:read'], 'mcp:write')).toThrow();
  });

  it('throws an error when scopes array is empty', () => {
    expect(() => requireScope([], 'mcp:write')).toThrow();
  });

  it('thrown error message contains the required scope name', () => {
    expect(() => requireScope([], 'mcp:write')).toThrow('mcp:write');
  });

  it('only checks the required scope, not others', () => {
    // Has mcp:read and mcp:admin but not mcp:write — should throw for mcp:write
    expect(() => requireScope(['mcp:read', 'mcp:admin'], 'mcp:write')).toThrow();

    // Has mcp:write among others — should not throw for mcp:write
    expect(() => requireScope(['mcp:read', 'mcp:write', 'mcp:admin'], 'mcp:write')).not.toThrow();
  });
});
