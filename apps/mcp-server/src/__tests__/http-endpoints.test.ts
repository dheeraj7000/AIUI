import { describe, it, expect } from 'vitest';
import { AiuiMcpServer } from '../server';

describe('AiuiMcpServer', () => {
  it('can be imported', () => {
    expect(AiuiMcpServer).toBeDefined();
  });

  it('is a class (typeof is function)', () => {
    expect(typeof AiuiMcpServer).toBe('function');
  });
});
