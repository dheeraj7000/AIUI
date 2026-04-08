// ---------------------------------------------------------------------------
// MCP Proxy: stdio <-> HTTP
// ---------------------------------------------------------------------------
// When users run `npx @aiui/mcp-server` with AIUI_API_KEY, this module
// creates a local stdio MCP server that proxies all tool calls to the
// hosted AIUI MCP HTTP endpoint. No database connection needed.
// ---------------------------------------------------------------------------

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { log } from './lib/errors';

const DEFAULT_API_URL = 'https://aiui.store/mcp';

export async function startProxy(apiKey: string): Promise<void> {
  const apiUrl = process.env.AIUI_API_URL ?? DEFAULT_API_URL;

  log('info', 'Starting in proxy mode', { apiUrl });

  // -------------------------------------------------------------------------
  // 1. Connect to remote AIUI MCP server as a client
  // -------------------------------------------------------------------------

  const remoteTransport = new StreamableHTTPClientTransport(new URL(apiUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  });

  const remoteClient = new Client({ name: 'aiui-proxy', version: '1.0.0' }, { capabilities: {} });

  await remoteClient.connect(remoteTransport);
  log('info', 'Connected to remote AIUI MCP server');

  // -------------------------------------------------------------------------
  // 2. Discover remote tools
  // -------------------------------------------------------------------------

  const { tools: remoteTools } = await remoteClient.listTools();
  log('info', `Discovered ${remoteTools.length} remote tools`);

  // -------------------------------------------------------------------------
  // 3. Create local stdio server that mirrors the remote tools
  // -------------------------------------------------------------------------

  const localServer = new McpServer(
    { name: 'aiui', version: '1.0.0' },
    { capabilities: { tools: { listChanged: false } } }
  );

  for (const tool of remoteTools) {
    // Build a Zod schema from the tool's JSON schema input
    // We pass-through the raw arguments to the remote server,
    // so we use a permissive schema for local validation
    const shape: Record<string, z.ZodTypeAny> = {};
    const jsonSchema = tool.inputSchema as {
      properties?: Record<string, { type?: string; description?: string }>;
      required?: string[];
    };

    if (jsonSchema.properties) {
      for (const [key, prop] of Object.entries(jsonSchema.properties)) {
        let field: z.ZodTypeAny = z.any();
        if (prop.type === 'string') field = z.string();
        else if (prop.type === 'number' || prop.type === 'integer') field = z.number();
        else if (prop.type === 'boolean') field = z.boolean();

        if (prop.description) field = field.describe(prop.description);

        if (!jsonSchema.required?.includes(key)) {
          field = field.optional();
        }

        shape[key] = field;
      }
    }

    localServer.tool(tool.name, tool.description ?? '', shape, async (args) => {
      try {
        const result = await remoteClient.callTool({
          name: tool.name,
          arguments: args,
        });
        return result as { content: Array<{ type: 'text'; text: string }> };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error calling ${tool.name}: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    });

    log('info', `Registered proxy tool: ${tool.name}`);
  }

  // -------------------------------------------------------------------------
  // 4. Connect local server to stdio
  // -------------------------------------------------------------------------

  const stdioTransport = new StdioServerTransport();
  await localServer.connect(stdioTransport);
  log('info', 'AIUI MCP proxy ready (stdio)');
}
