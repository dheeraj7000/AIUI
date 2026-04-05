# Self-Hosting AIUI

Run AIUI on your own infrastructure with Docker Compose.

## Prerequisites

- Docker 24+ and Docker Compose v2
- 1 GB RAM minimum (2 GB recommended)
- PostgreSQL 16 (included in Docker Compose)

## Quick Start

```bash
git clone https://github.com/aiui/aiui.git
cd aiui
docker compose up -d
```

Services:

- **Web UI**: http://localhost:3000
- **MCP Server**: http://localhost:8080
- **PostgreSQL**: localhost:5432

## Production Setup

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Set required secrets in `.env`:

```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-min-32-chars
MCP_CORS_ORIGINS=https://your-domain.com
```

3. Start with production overrides:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable            | Required | Default                        | Description                       |
| ------------------- | -------- | ------------------------------ | --------------------------------- |
| `DATABASE_URL`      | Auto     | Constructed from Postgres vars | PostgreSQL connection string      |
| `POSTGRES_PASSWORD` | Prod     | `aiui`                         | Database password                 |
| `JWT_SECRET`        | Prod     | Dev default (insecure)         | JWT signing secret (min 32 chars) |
| `MCP_SERVER_PORT`   | No       | `8080`                         | MCP server listen port            |
| `MCP_CORS_ORIGINS`  | No       | `*`                            | Comma-separated allowed origins   |
| `MCP_RATE_LIMIT`    | No       | `60`                           | Requests per minute per API key   |
| `MCP_MAX_SESSIONS`  | No       | `1000`                         | Max concurrent MCP sessions       |
| `NODE_ENV`          | No       | `production`                   | Node environment                  |

## Database Migrations

Migrations run automatically on first start. To run manually:

```bash
docker compose exec mcp-server node packages/design-core/src/db/migrate-prod.js
```

## Seed Data

To seed the default style packs and components:

```bash
docker compose exec web npx tsx packages/design-core/src/db/seed.ts
```

## Health Checks

```bash
# MCP Server
curl http://localhost:8080/health

# Web UI
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

## Backups

```bash
# Backup
docker compose exec postgres pg_dump -U aiui aiui > backup.sql

# Restore
docker compose exec -T postgres psql -U aiui aiui < backup.sql
```

## Updating

```bash
git pull
docker compose build
docker compose up -d
```
