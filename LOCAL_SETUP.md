# AIUI Local Setup Guide

## Prerequisites

| Tool       | Version | Install                                      |
| ---------- | ------- | -------------------------------------------- |
| Node.js    | >= 20   | `nvm install 20`                             |
| pnpm       | >= 9.15 | `corepack enable && corepack prepare pnpm@9` |
| PostgreSQL | >= 16   | `sudo apt install postgresql`                |

## 1. Install dependencies

```bash
pnpm install
```

## 2. Set up PostgreSQL

```bash
# Create the database and user (run as postgres superuser)
sudo -u postgres psql <<SQL
CREATE USER aiui WITH PASSWORD 'aiui';
CREATE DATABASE aiui OWNER aiui;
GRANT ALL PRIVILEGES ON DATABASE aiui TO aiui;
SQL
```

Verify the connection:

```bash
PGPASSWORD=aiui psql -U aiui -d aiui -h localhost -c "SELECT 1;"
```

## 3. Configure environment

Create `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://aiui:aiui@127.0.0.1:5432/aiui
```

## 4. Build packages and push schema

```bash
# Build all workspace packages (required before first run)
pnpm build

# Push the Drizzle schema to your local database
pnpm --filter @aiui/design-core db:push

# Seed default style packs, tokens, and components
pnpm --filter @aiui/design-core seed
```

## 5. Start services

### Testing the HTTP MCP server

You can quickly verify the HTTP MCP server works locally before running the full stack:

```bash
# Start the HTTP MCP server
MCP_SERVER_PORT=8080 \
DATABASE_URL="postgresql://aiui:aiui@localhost:5432/aiui" \
pnpm --filter @aiui/mcp-server start

# In another terminal — verify health
curl http://localhost:8080/health

# Test authentication (replace with a real API key from step 7c)
curl http://localhost:8080/mcp/test -H "Authorization: Bearer YOUR_KEY"

# Get setup snippets for all supported clients
curl http://localhost:8080/mcp/setup
curl "http://localhost:8080/mcp/setup?format=markdown"
```

### Option A: Web UI only

```bash
pnpm --filter @aiui/web dev
# -> http://localhost:3000
```

### Option B: Web UI + MCP Server (full stack)

Open **two terminals**:

**Terminal 1 -- Web UI:**

```bash
pnpm --filter @aiui/web dev
```

**Terminal 2 -- MCP Server (HTTP mode):**

```bash
MCP_SERVER_PORT=8080 \
DATABASE_URL="postgresql://aiui:aiui@localhost:5432/aiui" \
AIUI_WEB_URL="http://localhost:3000" \
pnpm --filter @aiui/mcp-server start
```

### Option C: One-liner (background processes)

```bash
# Start both in the background
pnpm --filter @aiui/web dev &
MCP_SERVER_PORT=8080 DATABASE_URL="postgresql://aiui:aiui@localhost:5432/aiui" AIUI_WEB_URL="http://localhost:3000" pnpm --filter @aiui/mcp-server start &

# Stop everything
pkill -f "next dev" && pkill -f "tsx src/index.ts"
```

## 6. Verify services

```bash
# Web UI
curl -s -o /dev/null -w "Web UI: HTTP %{http_code}\n" http://localhost:3000

# MCP Server (404 on root is expected; /mcp is the endpoint)
curl -s -o /dev/null -w "MCP:    HTTP %{http_code}\n" http://localhost:8080/mcp
```

## 7. End-to-end test walkthrough

### 7a. Sign up

```bash
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"DevPass123!","name":"Dev User"}'
```

Save the `accessToken` and user `id` from the response.

### 7b. Set up organization

```bash
curl -s -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"userId":"<user-id>","email":"dev@example.com"}'
```

Save the `orgId` from the response.

### 7c. Create an API key

```bash
curl -s -X POST http://localhost:3000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name":"dev-key","organizationId":"<orgId>"}'
```

Save the `rawKey` -- it is only shown once.

### 7d. Test MCP connection

```bash
API_KEY="<rawKey>"

# Initialize session
curl -s -D - -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

Grab the `Mcp-Session-Id` header from the response, then list tools:

```bash
curl -s -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Mcp-Session-Id: <session-id>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

You should see all 11 MCP tools listed.

## 8. MCP stdio mode (for Claude Code / IDE integration)

When `MCP_SERVER_PORT` is **not** set, the server runs in stdio mode for direct Claude Code integration. Add this to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "aiui": {
      "command": "pnpm",
      "args": ["--filter", "@aiui/mcp-server", "start"],
      "env": {
        "DATABASE_URL": "postgresql://aiui:aiui@localhost:5432/aiui"
      }
    }
  }
}
```

## 9. Useful commands

| Command                                     | Description                          |
| ------------------------------------------- | ------------------------------------ |
| `pnpm build`                                | Build all packages                   |
| `pnpm lint`                                 | Lint all packages                    |
| `pnpm typecheck`                            | Type-check all packages              |
| `pnpm --filter @aiui/design-core db:push`   | Push schema changes to DB            |
| `pnpm --filter @aiui/design-core seed`      | Seed style packs, tokens, components |
| `pnpm --filter @aiui/design-core db:studio` | Open Drizzle Studio (DB browser)     |
| `pnpm --filter @aiui/design-core test`      | Run design-core tests                |

## 10. Troubleshooting

**Port already in use:**

```bash
lsof -i :3000  # Find the PID
kill <PID>      # Kill it
```

**Database connection refused:**

```bash
pg_isready                          # Check if postgres is running
sudo systemctl start postgresql     # Start it
```

**"relation does not exist" errors:**

```bash
pnpm --filter @aiui/design-core db:push   # Push schema
pnpm --filter @aiui/design-core seed      # Re-seed data
```

**MCP server starts in stdio mode instead of HTTP:**
Make sure `MCP_SERVER_PORT=8080` is set in the environment.

**API key creation returns "Internal server error":**
Ensure the user has an organization. Call `/api/auth/setup` after signup/signin.
