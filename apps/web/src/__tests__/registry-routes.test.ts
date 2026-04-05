import { describe, it, expect } from 'vitest';
import { GET as getRegistryIndex } from '../app/api/registry/index/route';
import { GET as getRegistryPack } from '../app/api/registry/[slug]/route';
import { POST as publishPack } from '../app/api/registry/publish/route';
import { GET as searchPacks } from '../app/api/registry/search/route';

// ---------------------------------------------------------------------------
// Registry route handler export verification
// ---------------------------------------------------------------------------

describe('Registry route handlers — index', () => {
  it('exports GET as a function', () => {
    expect(typeof getRegistryIndex).toBe('function');
  });

  it('GET handler takes zero explicit arguments (no request needed)', () => {
    // The index route's GET() takes no arguments
    expect(getRegistryIndex.length).toBe(0);
  });

  it('GET handler is async', () => {
    expect(getRegistryIndex.constructor.name).toBe('AsyncFunction');
  });
});

describe('Registry route handlers — [slug]', () => {
  it('exports GET as a function', () => {
    expect(typeof getRegistryPack).toBe('function');
  });

  it('GET handler accepts two arguments (request, context)', () => {
    expect(getRegistryPack.length).toBe(2);
  });

  it('GET handler is async', () => {
    expect(getRegistryPack.constructor.name).toBe('AsyncFunction');
  });
});

describe('Registry route handlers — publish', () => {
  it('exports POST as a function', () => {
    expect(typeof publishPack).toBe('function');
  });

  it('POST handler accepts one argument (request)', () => {
    expect(publishPack.length).toBe(1);
  });

  it('POST handler is async', () => {
    expect(publishPack.constructor.name).toBe('AsyncFunction');
  });
});

describe('Registry route handlers — search', () => {
  it('exports GET as a function', () => {
    expect(typeof searchPacks).toBe('function');
  });

  it('GET handler accepts one argument (request)', () => {
    expect(searchPacks.length).toBe(1);
  });

  it('GET handler is async', () => {
    expect(searchPacks.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Module import smoke checks
// ---------------------------------------------------------------------------

describe('Registry route modules are importable', () => {
  it('registry/index/route loaded without errors', () => {
    expect(getRegistryIndex).toBeDefined();
  });

  it('registry/[slug]/route loaded without errors', () => {
    expect(getRegistryPack).toBeDefined();
  });

  it('registry/publish/route loaded without errors', () => {
    expect(publishPack).toBeDefined();
  });

  it('registry/search/route loaded without errors', () => {
    expect(searchPacks).toBeDefined();
  });
});
