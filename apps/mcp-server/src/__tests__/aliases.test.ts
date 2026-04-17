import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AiuiMcpServer } from '../server';
import { registerAliases, ALIAS_MAP } from '../tools/aliases';

// Smoke test for discipline-named aliases (audit/polish/critique/typeset/...).
//
// Aliases delegate to canonical MCP tools by name, so we don't touch the real
// DB-backed canonical handlers in this test — we register lightweight stubs
// under the canonical names, then register the aliases on top and verify:
//
//   1. Every expected alias is registered.
//   2. Each alias carries a non-empty, imperative description.
//   3. Calling an alias through the MCP content-wrapping layer returns a
//      non-empty { content: [{ type: 'text', text: ... }] } payload — i.e.
//      the delegation path actually reaches the canonical handler and
//      returns JSON.
//
// If the canonical tool set changes, the stubs below should be kept in sync.

const EXPECTED_ALIASES = [
  'audit',
  'polish',
  'critique',
  'typeset',
  'tokens',
  'context',
  'components',
  'recipe',
] as const;

function registerCanonicalStubs(server: AiuiMcpServer) {
  // Stubs mirror just enough of each canonical tool's contract for the alias
  // delegation paths to exercise. Return a clearly-tagged payload so we can
  // assert the alias forwarded our call.
  server.registerTool(
    'validate_ui_output',
    'stub validate',
    { projectId: z.string(), code: z.string(), mode: z.string().optional() },
    async (args) => ({
      stub: 'validate_ui_output',
      compliant: false,
      violations: [
        { type: 'font', severity: 'warning', message: 'stub font violation', line: 1 },
        { type: 'color', severity: 'warning', message: 'stub color violation', line: 2 },
      ],
      modeReceived: args.mode ?? null,
    })
  );
  server.registerTool(
    'fix_compliance_issues',
    'stub fix',
    {
      code: z.string(),
      violations: z.array(z.any()),
      projectSlug: z.string(),
    },
    async () => ({ stub: 'fix_compliance_issues', fixedCode: '/* fixed */' })
  );
  server.registerTool(
    'get_theme_tokens',
    'stub tokens',
    { projectId: z.string(), format: z.string().optional() },
    async () => ({
      stub: 'get_theme_tokens',
      tokens: {
        'font.sans': 'Inter',
        'font-size.md': '16px',
        'color.primary': '#4f46e5',
      },
    })
  );
  server.registerTool('get_project_context', 'stub context', { slug: z.string() }, async () => ({
    stub: 'get_project_context',
  }));
  server.registerTool(
    'list_components',
    'stub list',
    { stylePackId: z.string().optional() },
    async () => ({ stub: 'list_components', components: [] })
  );
  server.registerTool(
    'get_component_recipe',
    'stub recipe',
    { recipeId: z.string() },
    async () => ({ stub: 'get_component_recipe' })
  );
}

function captureLastHandler(mcp: McpServer) {
  const spy = vi.spyOn(mcp, 'tool');
  return (toolName: string) => {
    const call = spy.mock.calls.find((c) => c[0] === toolName);
    if (!call) throw new Error(`tool "${toolName}" was never registered on McpServer`);
    return call[call.length - 1] as (args: Record<string, unknown>) => Promise<{
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    }>;
  };
}

describe('Discipline-named aliases', () => {
  it('registers every expected alias', () => {
    const server = new AiuiMcpServer();
    registerCanonicalStubs(server);
    registerAliases(server);

    const names = server.listTools().map((t) => t.name);
    for (const alias of EXPECTED_ALIASES) {
      expect(names, `missing alias: ${alias}`).toContain(alias);
    }
  });

  it('every alias has a non-empty imperative description', () => {
    const server = new AiuiMcpServer();
    registerCanonicalStubs(server);
    registerAliases(server);

    const byName = new Map(server.listTools().map((t) => [t.name, t.description]));
    for (const alias of EXPECTED_ALIASES) {
      const desc = byName.get(alias);
      expect(desc, `alias ${alias} missing description`).toBeTruthy();
      expect(typeof desc).toBe('string');
      expect((desc as string).length).toBeGreaterThan(5);
    }
  });

  it('ALIAS_MAP covers every registered alias', () => {
    for (const alias of EXPECTED_ALIASES) {
      expect(ALIAS_MAP[alias]).toBeTruthy();
    }
  });

  it('throws a clear error if aliases register before canonical tools', () => {
    const server = new AiuiMcpServer();
    expect(() => registerAliases(server)).toThrow(/canonical tool/);
  });

  it('calling `audit` through the wrapped server returns a non-empty response', async () => {
    const mcp = new McpServer({ name: 'test', version: '0.0.0' });
    const server = new AiuiMcpServer(mcp);
    const getHandler = captureLastHandler(mcp);

    registerCanonicalStubs(server);
    registerAliases(server);

    const handler = getHandler('audit');
    const result = await handler({
      projectId: '00000000-0000-0000-0000-000000000000',
      code: '<div />',
    });

    expect(result.isError).not.toBe(true);
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]?.type).toBe('text');
    expect(result.content[0]?.text).toBeTruthy();
    expect(result.content[0].text.length).toBeGreaterThan(0);

    // audit is a pass-through to validate_ui_output — the stub tagged its
    // payload so we can confirm the delegation actually reached it.
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.stub).toBe('validate_ui_output');
  });

  it('calling `polish` composes validate -> fix', async () => {
    const mcp = new McpServer({ name: 'test', version: '0.0.0' });
    const server = new AiuiMcpServer(mcp);
    const getHandler = captureLastHandler(mcp);

    registerCanonicalStubs(server);
    registerAliases(server);

    const handler = getHandler('polish');
    const result = await handler({
      projectId: '00000000-0000-0000-0000-000000000000',
      projectSlug: 'test',
      code: '<div />',
    });

    expect(result.isError).not.toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.validation?.stub).toBe('validate_ui_output');
    expect(parsed.fixes?.stub).toBe('fix_compliance_issues');
  });

  it('calling `typeset` filters type tokens and type-only violations', async () => {
    const mcp = new McpServer({ name: 'test', version: '0.0.0' });
    const server = new AiuiMcpServer(mcp);
    const getHandler = captureLastHandler(mcp);

    registerCanonicalStubs(server);
    registerAliases(server);

    const handler = getHandler('typeset');
    const result = await handler({
      projectId: '00000000-0000-0000-0000-000000000000',
      code: '<div />',
      format: 'json',
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(Object.keys(parsed.typeTokens)).toEqual(
      expect.arrayContaining(['font.sans', 'font-size.md'])
    );
    expect(Object.keys(parsed.typeTokens)).not.toContain('color.primary');
    expect(parsed.typeViolations.every((v: { type: string }) => v.type === 'font')).toBe(true);
  });
});
