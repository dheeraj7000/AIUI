import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AiuiMcpServer } from '../server';

// Regression: http-server.ts used to bypass AiuiMcpServer.registerTool by
// binding `mcpServer.tool` directly, which skipped the content-wrapping step
// and made every hosted tool call return an empty response to clients.
// These tests lock in that any tool registered via AiuiMcpServer returns a
// well-formed { content: [{ type: 'text', text: ... }] } payload and that
// constructing AiuiMcpServer with an external McpServer (the HTTP path) still
// routes through the wrapper.
describe('AiuiMcpServer result wrapping', () => {
  function captureHandler(mcpServer: McpServer) {
    const toolSpy = vi.spyOn(mcpServer, 'tool');
    return () => {
      const lastCall = toolSpy.mock.calls.at(-1);
      if (!lastCall) throw new Error('tool() was never called');
      // McpServer.tool signature: (name, description, schema, handler)
      const handler = lastCall[lastCall.length - 1] as (
        args: Record<string, unknown>
      ) => Promise<unknown>;
      return handler;
    };
  }

  it('wraps successful handler results in { content: [{ type: "text", text }] }', async () => {
    const mcp = new McpServer({ name: 'test', version: '0.0.0' });
    const aiui = new AiuiMcpServer(mcp);
    const getHandler = captureHandler(mcp);

    aiui.registerTool('echo', 'Echoes input', { value: z.string() }, async (args) => ({
      echoed: args.value,
      count: 1,
    }));

    const handler = getHandler();
    const result = (await handler({ value: 'hello' })) as {
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    };

    expect(result.isError).toBeUndefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toEqual({ echoed: 'hello', count: 1 });
  });

  it('wraps thrown errors as isError responses with a content text block', async () => {
    const mcp = new McpServer({ name: 'test', version: '0.0.0' });
    const aiui = new AiuiMcpServer(mcp);
    const getHandler = captureHandler(mcp);

    aiui.registerTool('boom', 'Always fails', {}, async () => {
      throw new Error('kaboom');
    });

    const handler = getHandler();
    const result = (await handler({})) as {
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    };

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('kaboom');
  });

  it('wraps results when constructed with an externally-owned McpServer (HTTP path)', async () => {
    // Mirrors exactly what http-server.ts does per session.
    const mcp = new McpServer({ name: 'aiui', version: '1.0.0' });
    const aiui = new AiuiMcpServer(mcp);
    const getHandler = captureHandler(mcp);

    aiui.registerTool('list', 'List things', {}, async () => ({
      items: ['a', 'b'],
      total: 2,
    }));

    const handler = getHandler();
    const result = (await handler({})) as {
      content: Array<{ type: string; text: string }>;
    };

    // This is the exact bug: before the fix, the HTTP path used
    // `mcpServer.tool.bind(mcpServer)` as `registerTool`, so handlers returned
    // raw objects with no `content` array — clients saw empty responses.
    expect(result.content?.[0]?.text).toBeDefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toEqual({ items: ['a', 'b'], total: 2 });
  });
});
