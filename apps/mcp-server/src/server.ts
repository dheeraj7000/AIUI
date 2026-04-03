import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { log, ToolError } from './lib/errors';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface ToolDef {
  description: string;
  schema: Record<string, z.ZodType>;
  handler: ToolHandler;
}

export class AiuiMcpServer {
  private server: McpServer;
  private tools = new Map<string, ToolDef>();

  constructor() {
    this.server = new McpServer({
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

    this.server.tool(name, description, schema, async (args) => {
      try {
        const result = await handler(args as Record<string, unknown>);
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
