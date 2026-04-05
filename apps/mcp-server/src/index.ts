import { AiuiMcpServer } from './server';
import { registerAllTools } from './tools';
import { startHttpServer } from './http-server';
import { startProxy } from './proxy';
import { log } from './lib/errors';

async function main() {
  const port = process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT, 10) : null;
  const apiKey = process.env.AIUI_API_KEY;
  const isLocal = process.argv.includes('--local');

  if (port) {
    // Mode 1: HTTP server (hosted deployment)
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
  } else if (apiKey && !isLocal) {
    // Mode 2: Proxy mode (npx users with API key)
    await startProxy(apiKey);
  } else {
    // Mode 3: Local stdio mode (direct database access)
    if (!process.env.DATABASE_URL) {
      log('info', 'Starting in stdio mode (no DATABASE_URL — tool calls requiring DB will fail)');
    } else {
      log('info', 'Starting in local stdio mode');
    }
    const server = new AiuiMcpServer();
    registerAllTools(server);
    await server.start();
  }
}

main().catch((error) => {
  log('error', 'Failed to start MCP server', { error: String(error) });
  process.exit(1);
});
