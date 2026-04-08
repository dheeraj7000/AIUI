import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { log } from './lib/errors';
import { authenticateRequest } from './lib/auth';
import { runWithContext } from './lib/context';
import { registerAllTools } from './tools';
import type { AiuiMcpServer } from './server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SERVER_START_TIME = Date.now();
const TOOLS_COUNT = 10; // Number of registered MCP tools

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute
const MAX_SESSIONS = parseInt(process.env.MCP_MAX_SESSIONS ?? '1000', 10);
const RATE_LIMIT = parseInt(process.env.MCP_RATE_LIMIT ?? '60', 10);
const RATE_WINDOW_MS = 60_000;

// ---------------------------------------------------------------------------
// Session tracking with TTL
// ---------------------------------------------------------------------------

interface TrackedTransport {
  transport: StreamableHTTPServerTransport;
  lastActivity: number;
}

const transports = new Map<string, TrackedTransport>();

// ---------------------------------------------------------------------------
// Rate limiting (in-memory sliding window per key/IP)
// ---------------------------------------------------------------------------

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Periodic cleanup: stale sessions + expired rate limit entries
// ---------------------------------------------------------------------------

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  cleanupTimer = setInterval(() => {
    const now = Date.now();

    // Evict stale sessions
    for (const [sid, tracked] of transports) {
      if (now - tracked.lastActivity > SESSION_TTL_MS) {
        tracked.transport.close().catch(() => {});
        transports.delete(sid);
        log('info', `Session expired: ${sid}`);
      }
    }

    // Evict expired rate limit entries
    for (const [key, entry] of rateLimitMap) {
      if (now >= entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

/**
 * Start the MCP server in HTTP mode for production / remote access.
 * Clients connect via Streamable HTTP transport with Bearer auth.
 */
export async function startHttpServer(port: number) {
  const app = express();

  // JSON body parser with size limit
  app.use(express.json({ limit: '1mb' }));

  // Health check for App Runner (exempt from auth + rate limiting)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: process.env.npm_package_version || '0.1.0',
      uptime_seconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      tools_count: TOOLS_COUNT,
      sessions_active: transports.size,
      transport: 'streamable-http',
    });
  });

  // Connection test endpoint — verify authentication without starting a session
  app.get('/mcp/test', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || null;
      const context = await authenticateRequest(authHeader);

      if (!context) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Provide an API key via Authorization: Bearer aiui_k_xxx',
          setup_url: '/mcp/setup',
        });
        return;
      }

      res.json({
        authenticated: true,
        userId: context.userId,
        organizationId: context.organizationId,
        projectId: context.projectId || null,
        scopes: context.scopes,
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Setup instructions endpoint — generate client configuration snippets
  app.get('/mcp/setup', (req, res) => {
    const baseUrl = (req.query.url as string) || `${req.protocol}://${req.get('host')}`;
    const apiKey = (req.query.key as string) || 'aiui_k_YOUR_API_KEY';

    const setup = {
      one_liner: `claude mcp add --transport http aiui ${baseUrl}/mcp --header "Authorization:Bearer ${apiKey}"`,
      npx: `npx @aiui/mcp-server --api-key=${apiKey}`,
      claude_code: `claude mcp add --transport http aiui ${baseUrl}/mcp --header "Authorization:Bearer ${apiKey}"`,
      cursor: {
        mcpServers: {
          aiui: {
            type: 'http',
            url: `${baseUrl}/mcp`,
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        },
      },
      vscode: {
        'mcp.servers': {
          aiui: {
            type: 'http',
            url: `${baseUrl}/mcp`,
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        },
      },
      windsurf: {
        mcpServers: {
          aiui: {
            serverUrl: `${baseUrl}/mcp`,
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        },
      },
    };

    const format = req.query.format as string;
    if (format === 'markdown') {
      let md = '# AIUI MCP Setup\n\n';
      md += '## Claude Code\n```bash\n' + setup.claude_code + '\n```\n\n';
      md +=
        '## Cursor (.cursor/mcp.json)\n```json\n' +
        JSON.stringify(setup.cursor, null, 2) +
        '\n```\n\n';
      md +=
        '## VS Code (settings.json)\n```json\n' +
        JSON.stringify(setup.vscode, null, 2) +
        '\n```\n\n';
      md += '## Windsurf\n```json\n' + JSON.stringify(setup.windsurf, null, 2) + '\n```\n';
      res.type('text/markdown').send(md);
    } else {
      res.json(setup);
    }
  });

  // CORS — configurable via MCP_CORS_ORIGINS env var
  const allowedOrigins = process.env.MCP_CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? ['*'];
  const corsAllowAll = allowedOrigins.includes('*');

  app.use('/mcp', (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (corsAllowAll) {
      // Permissive mode — allow any origin
      res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
      res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
      return;
    }

    // Strict mode — check origin against allowlist
    res.setHeader('Vary', 'Origin');

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
      res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
      return;
    }

    // Origin not allowed
    if (req.method === 'OPTIONS') {
      // Omit CORS headers — browser will block the preflight
      res.status(204).end();
      return;
    }

    if (origin) {
      // Non-preflight from disallowed origin
      res.status(403).json({ error: 'Origin not allowed' });
      return;
    }

    // No Origin header (non-browser client) — allow through
    next();
  });

  // MCP endpoint — handles new sessions, existing sessions, and SSE streams
  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      // Authenticate
      const authContext = await authenticateRequest(req.headers.authorization ?? null);
      if (!authContext) {
        log('warn', 'Auth failed', { ip: req.ip });
        res.status(401).json({ error: 'Invalid or missing API key' });
        return;
      }

      // Rate limit (by API key ID)
      const rateKey = authContext.keyId;
      const rateCheck = checkRateLimit(rateKey);
      if (!rateCheck.allowed) {
        res.setHeader('Retry-After', String(rateCheck.retryAfter));
        log('warn', 'Rate limit exceeded', { keyId: authContext.keyId });
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      // Check for existing session
      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      if (sessionId && transports.has(sessionId)) {
        // Existing session — route to its transport
        const tracked = transports.get(sessionId)!;
        tracked.lastActivity = Date.now();
        await runWithContext(authContext, () =>
          tracked.transport.handleRequest(req, res, req.body)
        );
        return;
      }

      if (sessionId && !transports.has(sessionId)) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Reject if at capacity
      if (transports.size >= MAX_SESSIONS) {
        log('warn', 'Session capacity reached', { current: transports.size, max: MAX_SESSIONS });
        res.status(503).json({ error: 'Server at session capacity. Try again later.' });
        return;
      }

      // New session — create server + transport
      const server = new McpServer({ name: 'aiui', version: '1.0.0' });
      registerAllTools({
        registerTool: server.tool.bind(server),
      } as unknown as AiuiMcpServer);

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => `aiui_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        onsessioninitialized: (sid) => {
          transports.set(sid, { transport, lastActivity: Date.now() });
          log('info', `Session created: ${sid}`, { userId: authContext.userId });
        },
      });

      transport.onclose = () => {
        const sid = (transport as unknown as { sessionId?: string }).sessionId;
        if (sid) {
          transports.delete(sid);
          log('info', `Session closed: ${sid}`);
        }
      };

      await server.connect(transport);
      await runWithContext(authContext, () => transport.handleRequest(req, res, req.body));
    } catch (err) {
      log('error', 'MCP request failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Explicit session cleanup (DELETE)
  app.delete('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const tracked = transports.get(sessionId)!;
        await tracked.transport.close();
        transports.delete(sessionId);
        res.status(200).json({ status: 'session closed' });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (err) {
      log('error', 'Session cleanup failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Express error middleware (catches JSON parse errors, etc.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    log('error', 'Unhandled error', { error: err.message });
    if (!res.headersSent) {
      res.status(400).json({ error: 'Bad request' });
    }
  });

  // Start listening
  const httpServer = app.listen(port, () => {
    log('info', `AIUI MCP HTTP server listening on port ${port}`, {
      maxSessions: MAX_SESSIONS,
      rateLimit: `${RATE_LIMIT}/min`,
      corsOrigins: allowedOrigins,
    });
  });

  // Start periodic cleanup
  startCleanup();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log('info', `${signal} received, shutting down...`);

    // Stop cleanup timer
    if (cleanupTimer) clearInterval(cleanupTimer);

    // Stop accepting new connections
    httpServer.close();

    // Close all active transports
    const closePromises = Array.from(transports.entries()).map(async ([sid, tracked]) => {
      try {
        await tracked.transport.close();
      } catch {
        // best effort
      }
      transports.delete(sid);
    });
    await Promise.allSettled(closePromises);

    log('info', 'Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Force exit after 5s if graceful shutdown hangs
  const forceExit = () => {
    log('warn', 'Forcing exit after timeout');
    process.exit(1);
  };
  process.on('SIGTERM', () => setTimeout(forceExit, 5000).unref());
  process.on('SIGINT', () => setTimeout(forceExit, 5000).unref());
}
