import { AiuiMcpServer } from './server';
import { registerAllTools } from './tools';
import { startHttpServer } from './http-server';
import { log } from './lib/errors';

async function main() {
  const port = process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT, 10) : null;

  if (port) {
    // Production: HTTP mode with Streamable HTTP transport
    log('info', `Starting in HTTP mode on port ${port}`);
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
