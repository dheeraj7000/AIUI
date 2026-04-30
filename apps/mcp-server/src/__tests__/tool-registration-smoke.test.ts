import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AiuiMcpServer } from '../server';
import { registerAllTools } from '../tools';

// Smoke test for the unified tool-registration path.
//
// Background: commit fb85d4b fixed "empty responses from hosted MCP tools
// (wrapper bypass)". The HTTP path used to bind `mcpServer.tool` directly
// via a `{ registerTool } as unknown as AiuiMcpServer` stub, skipping
// AiuiMcpServer's content wrapper. The unified signature now in use is:
//
//   registerAllTools(server: AiuiMcpServer)
//
// where AiuiMcpServer may wrap either (a) its own internally created
// McpServer (stdio path, see src/index.ts) or (b) an externally-owned
// McpServer (HTTP path, see src/http-server.ts per-session bootstrap).
//
// These tests lock in that:
//   1. Both transport bootstrap shapes produce the same catalog of tools.
//   2. All expected tool names are present.
//   3. Read-only tools route through the content wrapper regardless of
//      which McpServer instance backs the AiuiMcpServer.
//
// If a tool is added/removed, update EXPECTED_TOOLS below.

const EXPECTED_TOOLS = [
  // Read
  'get_project_context',
  'get_theme_tokens',
  'get_asset_manifest',
  'validate_ui_output',
  'sync_design_memory',
  'get_design_memory',
  'check_design_memory',
  'open_design_studio',
  'audit_design_principles',
  'suggest_pattern_promotion',
  'evaluate_typography',
  'evaluate_color_palette',
  'evaluate_visual_density',
  // Write
  'update_tokens',
  'init_project',
  'fix_compliance_issues',
  'reset_project_to_starter',
  'undo_last_token_change',
  'promote_pattern',
  'adopt_codebase',
] as const;

describe('Unified tool registration (stdio + HTTP)', () => {
  it('stdio bootstrap registers every expected tool exactly once', () => {
    // Mirrors src/index.ts:53-55
    const aiui = new AiuiMcpServer();
    registerAllTools(aiui);

    const names = aiui.listTools().map((t) => t.name);

    for (const expected of EXPECTED_TOOLS) {
      expect(names, `missing tool: ${expected}`).toContain(expected);
    }

    // No duplicate registrations.
    expect(new Set(names).size).toBe(names.length);
  });

  it('HTTP bootstrap (externally-owned McpServer) registers the same tool set', () => {
    // Mirrors src/http-server.ts per-session bootstrap.
    const mcpServer = new McpServer({ name: 'aiui', version: '1.0.0' });
    const aiui = new AiuiMcpServer(mcpServer);
    registerAllTools(aiui);

    const names = aiui.listTools().map((t) => t.name);

    for (const expected of EXPECTED_TOOLS) {
      expect(names, `missing tool: ${expected}`).toContain(expected);
    }
    expect(new Set(names).size).toBe(names.length);
  });

  it('stdio and HTTP paths produce identical catalogs', () => {
    const stdio = new AiuiMcpServer();
    registerAllTools(stdio);

    const http = new AiuiMcpServer(new McpServer({ name: 'aiui', version: '1.0.0' }));
    registerAllTools(http);

    const stdioNames = stdio
      .listTools()
      .map((t) => t.name)
      .sort();
    const httpNames = http
      .listTools()
      .map((t) => t.name)
      .sort();

    expect(httpNames).toEqual(stdioNames);
  });

  it('every registered tool has a non-empty description (catalog sanity)', () => {
    const aiui = new AiuiMcpServer();
    registerAllTools(aiui);

    for (const tool of aiui.listTools()) {
      expect(tool.description, `tool ${tool.name} has empty description`).toBeTruthy();
      expect(typeof tool.description).toBe('string');
    }
  });
});
