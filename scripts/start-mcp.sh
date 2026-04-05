#!/bin/sh
# Run database migrations before starting
node packages/design-core/src/db/migrate-prod.js 2>/dev/null || echo "Migration skipped (may already be applied)"

# Start the MCP server
exec node apps/mcp-server/dist/index.js
