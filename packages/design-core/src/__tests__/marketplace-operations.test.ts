import { describe, it, expect } from 'vitest';
import { publishPack, searchPacks, getMarketplacePack, ratePack } from '../operations/marketplace';

describe('marketplace operations exports', () => {
  it('all 4 functions are exported and are functions', () => {
    expect(typeof publishPack).toBe('function');
    expect(typeof searchPacks).toBe('function');
    expect(typeof getMarketplacePack).toBe('function');
    expect(typeof ratePack).toBe('function');
  });

  it('publishPack.length is 3 (db, userId, input)', () => {
    expect(publishPack.length).toBe(3);
  });

  it('searchPacks.length is 2 (db, input)', () => {
    expect(searchPacks.length).toBe(2);
  });

  it('getMarketplacePack.length is 3 (db, namespace, slug)', () => {
    expect(getMarketplacePack.length).toBe(3);
  });

  it('ratePack.length is 4 (db, userId, packRegistryId, score)', () => {
    expect(ratePack.length).toBe(4);
  });
});
