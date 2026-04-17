import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { log, ToolError } from './lib/errors';
import { wrapWithAudit } from './lib/audit-wrapper';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface ToolDef {
  description: string;
  schema: Record<string, z.ZodType>;
  handler: ToolHandler;
}

export class AiuiMcpServer {
  private server: McpServer;
  private tools = new Map<string, ToolDef>();

  // Accept an externally-owned McpServer so HTTP mode can reuse the same
  // result-wrapping logic per session. Without this, http-server.ts used to
  // bind `server.tool` directly and bypass the `{ content: [...] }` wrapper,
  // causing every tool to return an empty response to the client.
  constructor(server?: McpServer) {
    this.server =
      server ??
      new McpServer({
        name: 'aiui',
        version: '1.0.0',
      });
  }

  /**
   * Register a tool with the MCP server.
   */
  registerTool(
    name: string,
    description: string,
    schema: Record<string, z.ZodType>,
    handler: ToolHandler
  ) {
    this.tools.set(name, { description, schema, handler });

    // Every tool dispatch is wrapped with server-side audit logging. The
    // wrapper records {userId, orgId, projectId, toolName, args_summary,
    // status, duration_ms} into usage_events (see lib/audit-wrapper.ts). It
    // is applied once, here, so both stdio and HTTP registration paths
    // inherit the behavior — no changes needed at call sites.
    const auditedHandler = wrapWithAudit(name, handler);

    this.server.tool(name, description, schema, async (args) => {
      try {
        const result = await auditedHandler(args as Record<string, unknown>);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof ToolError
            ? `[${error.code}] ${error.message}`
            : error instanceof Error
              ? error.message
              : 'Unknown error';

        log('error', `Tool "${name}" failed`, { error: message });

        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    });

    log('info', `Registered tool: ${name}`);
  }

  /**
   * Enumerate registered tools. Used by HTTP catalog / health endpoints so
   * they can report an accurate list without a duck-typed capture stub.
   */
  listTools(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.entries()).map(([name, def]) => ({
      name,
      description: def.description,
    }));
  }

  /**
   * Look up a previously-registered tool handler by name. Used by alias
   * registrations (see tools/aliases.ts) so discipline-named aliases like
   * `audit` / `polish` / `critique` can delegate to their canonical tools
   * without duplicating business logic. Returns the raw un-audited handler;
   * the alias re-registration wraps it with audit + content-wrapping again,
   * which is intentional — each alias is a distinct audit event.
   */
  getToolHandler(name: string): ToolHandler | undefined {
    return this.tools.get(name)?.handler;
  }

  /**
   * Look up the zod schema for a previously-registered tool. Aliases reuse
   * the canonical schema so their argument validation stays in sync.
   */
  getToolSchema(name: string): Record<string, z.ZodType> | undefined {
    return this.tools.get(name)?.schema;
  }

  /**
   * Start the MCP server with stdio transport.
   */
  async start() {
    const transport = new StdioServerTransport();

    process.on('SIGINT', () => {
      log('info', 'Received SIGINT, shutting down');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      log('info', 'Received SIGTERM, shutting down');
      process.exit(0);
    });

    log('info', 'Starting AIUI MCP server');
    await this.server.connect(transport);
    log('info', 'AIUI MCP server connected via stdio');
  }
}
