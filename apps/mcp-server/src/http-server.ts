import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { log } from './lib/errors';
import { authenticateRequest } from './lib/auth';
import { runWithContext } from './lib/context';
import { registerAllTools } from './tools';
import type { AiuiMcpServer } from './server';

/**
 * Start the MCP server in HTTP mode for production / remote access.
 * Clients connect via Streamable HTTP transport with Bearer auth.
 */
export async function startHttpServer(port: number) {
  const app = express();

  // Health check for App Runner
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', transport: 'streamable-http' });
  });

  // CORS for Claude Code clients
  app.use('/mcp', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Track active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // MCP endpoint
  app.all('/mcp', express.json(), async (req, res) => {
    // Authenticate
    const authContext = await authenticateRequest(req.headers.authorization ?? null);
    if (!authContext) {
      res.status(401).json({ error: 'Invalid or missing API key' });
      return;
    }

    // Check for existing session
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (sessionId && transports.has(sessionId)) {
      // Existing session — route to its transport
      const transport = transports.get(sessionId)!;
      await runWithContext(authContext, () => transport.handleRequest(req, res, req.body));
      return;
    }

    if (sessionId && !transports.has(sessionId)) {
      // Unknown session
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // New session — create server + transport
    const server = new McpServer({ name: 'aiui', version: '1.0.0' });
    registerAllTools({ registerTool: server.tool.bind(server) } as unknown as AiuiMcpServer);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => `aiui_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      onsessioninitialized: (sid) => {
        transports.set(sid, transport);
        log('info', `Session created: ${sid}`, { userId: authContext.userId });
      },
    });

    transport.onclose = () => {
      const sid = (transport as unknown as { sessionId?: string }).sessionId;
      if (sid) transports.delete(sid);
    };

    await server.connect(transport);
    await runWithContext(authContext, () => transport.handleRequest(req, res, req.body));
  });

  // Session cleanup (DELETE)
  app.delete('/mcp', (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      transport.close();
      transports.delete(sessionId);
      res.status(200).json({ status: 'session closed' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  app.listen(port, () => {
    log('info', `AIUI MCP HTTP server listening on port ${port}`);
  });
}
