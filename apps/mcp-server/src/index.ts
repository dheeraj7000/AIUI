import { AiuiMcpServer } from './server';
import { registerAllTools } from './tools';
import { startHttpServer } from './http-server';
import { log } from './lib/errors';

async function main() {
  const port = process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT, 10) : null;

  if (port) {
    // Production: HTTP mode with Streamable HTTP transport
    // Validate required env vars before starting
    const databaseUrl = process.env.DATABASE_URL;
    const aiuiWebUrl = process.env.AIUI_WEB_URL;

    if (!databaseUrl) {
      log('error', 'DATABASE_URL is required in HTTP mode');
      process.exit(1);
    }

    if (!aiuiWebUrl) {
      log('error', 'AIUI_WEB_URL is required in HTTP mode');
      process.exit(1);
    }

    // Log resolved config (redact DATABASE_URL to show only host)
    const redactedDbUrl = (() => {
      try {
        const parsed = new URL(databaseUrl);
        return parsed.host;
      } catch {
        return '(invalid URL)';
      }
    })();

    log('info', `Starting in HTTP mode on port ${port}`, {
      databaseHost: redactedDbUrl,
      aiuiWebUrl,
    });

    await startHttpServer(port);
  } else {
    // Local dev: stdio mode
    log('info', 'Starting in stdio mode');
    const server = new AiuiMcpServer();
    registerAllTools(server);
    await server.start();
  }
}

main().catch((error) => {
  log('error', 'Failed to start MCP server', { error: String(error) });
  process.exit(1);
});
