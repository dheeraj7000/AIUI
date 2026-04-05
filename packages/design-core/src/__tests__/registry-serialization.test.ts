import { describe, it, expect } from 'vitest';
import { serializePackForRegistry, getRegistryIndex } from '../operations/registry';

describe('registry operations exports', () => {
  it('serializePackForRegistry is a function', () => {
    expect(typeof serializePackForRegistry).toBe('function');
  });

  it('getRegistryIndex is a function', () => {
    expect(typeof getRegistryIndex).toBe('function');
  });

  it('serializePackForRegistry requires 2 arguments (db, slug)', () => {
    expect(serializePackForRegistry.length).toBe(2);
  });

  it('getRegistryIndex requires 1 argument (db)', () => {
    expect(getRegistryIndex.length).toBe(1);
  });
});
