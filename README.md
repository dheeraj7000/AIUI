# AIUI

**AI Design Control Layer** — control how Claude builds your UI.

AIUI lets you choose styles, components, and design tokens from a visual console. Claude Code uses them automatically via MCP to generate UI that follows your design system.

## What It Does

- **Style Packs** — curated sets of design tokens (colors, fonts, radii, shadows, spacing)
- **Component Recipes** — code templates with props schemas and AI usage rules
- **Design Memory** — syncs your design context into any project so Claude follows it automatically
- **Token Compliance** — validates generated code against your approved tokens
- **MCP Integration** — Claude Code reads your design system via 12 MCP tools

## Prerequisites

- **Node.js** 20 (`nvm use` reads `.nvmrc`)
- **pnpm** 9.15.4+ (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- **PostgreSQL** 15+

## Quick Start

### 1. Clone and install

```bash
git clone git@gitlab.com:dkumar70/AIUI.git
cd AIUI
pnpm install
```

### 2. Set up PostgreSQL

```bash
# Create database and extensions
sudo -u postgres psql -c "CREATE DATABASE aiui;"
sudo -u postgres psql -d aiui -f infrastructure/scripts/init-db.sql

# Create user
sudo -u postgres psql -c "CREATE ROLE aiui LOGIN PASSWORD 'aiui';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aiui TO aiui;"
sudo -u postgres psql -d aiui -c "GRANT ALL ON SCHEMA public TO aiui;"
```

### 3. Push schema and seed the design library

```bash
cd packages/design-core
DATABASE_URL="postgresql://aiui:aiui@127.0.0.1:5432/aiui" pnpm db:push
DATABASE_URL="postgresql://aiui:aiui@127.0.0.1:5432/aiui" pnpm seed
cd ../..
```

This creates 6 style packs and 57 component recipes from shadcn/ui, MagicUI, and community sources.

### 4. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://aiui:aiui@127.0.0.1:5432/aiui
```

### 5. Build and run

```bash
pnpm build    # Build all packages
pnpm dev      # Start the dev server
```

Open **http://localhost:3000**.

## Project Structure

```
apps/
  web/              Next.js 16 app (React 19, Tailwind CSS 4)
  mcp-server/       MCP server (stdio local, HTTP production)

packages/
  types/            Shared TypeScript types + Zod schemas
  design-core/      Database schema (Drizzle ORM), operations, seed data
  ui/               Shared React components (Tailwind + CVA)
  prompt-compiler/  Token merging, validation, Tailwind/CSS export
  component-engine/ Component resolution and rule validation
```

## Pages

| Route               | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `/`                 | Landing page                                                      |
| `/sign-up`          | Create an account                                                 |
| `/sign-in`          | Sign in                                                           |
| `/forgot-password`  | Password reset                                                    |
| `/dashboard`        | Overview — style pack count, component count, projects            |
| `/style-packs`      | Browse all 6 design packs with token/component counts             |
| `/style-packs/[id]` | View tokens (color swatches, radii, fonts) + apply to project     |
| `/components`       | Browse all 57 component recipes with type filters                 |
| `/components/[id]`  | View code template, props schema, AI usage rules + add to project |
| `/projects`         | List your projects with assigned style packs                      |
| `/projects/[slug]`  | Project detail — tokens, components, MCP integration guide        |
| `/studio`           | Visual design configurator (pick pack + components in one flow)   |

## MCP Tools

AIUI exposes 18 tools via the Model Context Protocol. The live, authoritative
list is published at `GET /mcp/catalog` on the MCP server and surfaced in the
dashboard at `/mcp-tools`. Highlights:

| Tool                       | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `init_project`             | Bootstrap a fresh repo with starter pack + .aiui/ |
| `get_project_context`      | Load project design profile by slug               |
| `get_design_memory`        | Get the full design memory markdown               |
| `sync_design_memory`       | Generate `.aiui/` files in a target project       |
| `check_design_memory`      | Check whether design memory is fresh or stale     |
| `open_design_studio`       | Get a URL to the visual design configurator       |
| `get_theme_tokens`         | Export tokens as Tailwind / CSS / JSON            |
| `list_components`          | Browse all component recipes                      |
| `get_component_recipe`     | Get full code template + props + AI rules         |
| `get_asset_manifest`       | Get project assets with public URLs               |
| `validate_ui_output`       | Check generated code for design compliance        |
| `resolve_tag`              | Resolve tags to associated resources              |
| `create_style_pack`        | Create a new style pack with tokens               |
| `update_tokens`            | Modify tokens in a style pack                     |
| `apply_style_pack`         | Assign a pack to a project and compile            |
| `fix_compliance_issues`    | Auto-fix token violations in generated code       |
| `reset_project_to_starter` | Reset a project back to a clean starter state     |
| `undo_last_token_change`   | (stub) Revert the most recent token change        |

## Using AIUI with Claude Code

### Option A: Remote MCP (recommended)

Add AIUI to your AI coding assistant with a single command. No local setup required.

**Claude Code:**

```bash
claude mcp add --transport http aiui https://your-aiui-host/mcp --header "Authorization:Bearer YOUR_API_KEY"
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

**VS Code** (`settings.json`):

```json
{
  "mcp.servers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

**Windsurf:**

```json
{
  "mcpServers": {
    "aiui": {
      "serverUrl": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

Get your API key from the project integrations page, or visit `/mcp/setup` on your AIUI host to generate ready-to-paste configuration snippets.

**Verify your connection:**

```bash
curl https://your-aiui-host/health
curl https://your-aiui-host/mcp/test -H "Authorization: Bearer YOUR_API_KEY"
```

### Option B: Local MCP (development)

Add this `.mcp.json` to the project where you want Claude to use your design system:

```json
{
  "mcpServers": {
    "aiui": {
      "command": "npx",
      "args": ["tsx", "<path-to-AIUI>/apps/mcp-server/src/index.ts"],
      "env": {
        "DATABASE_URL": "postgresql://aiui:aiui@127.0.0.1:5432/aiui"
      }
    }
  }
}
```

Then open Claude Code in that project and run:

```
Sync the AIUI design memory for <your-project-slug> to this project
```

Claude calls `sync_design_memory` and writes:

- `.aiui/design-memory.md` — full design context (tokens, components, rules)
- `.aiui/tokens.json` — machine-readable token values

Add to your project's `CLAUDE.md`:

```markdown
## Design System

This project uses AIUI for design management.
See `.aiui/design-memory.md` for the active design system.
Always follow the design rules defined there before building any UI.
```

Now Claude automatically follows your design system when building UI.

## Design Library

The seed data includes 6 style packs:

| Pack                 | Category   | Tokens | Components |
| -------------------- | ---------- | ------ | ---------- |
| SaaS Clean           | saas       | 31     | 8          |
| Fintech Light        | fintech    | 31     | 6          |
| Startup Bold         | startup    | 31     | 6          |
| shadcn/ui Essentials | ui-library | 33     | 14         |
| MagicUI Effects      | animations | 32     | 13         |
| Community Creative   | creative   | 32     | 10         |

## Scripts

```bash
# Root
pnpm dev          # Start Next.js dev server
pnpm build        # Build all packages and apps
pnpm lint         # Lint everything
pnpm typecheck    # Type-check everything

# Database (from packages/design-core)
DATABASE_URL="..." pnpm db:push      # Push schema to database
DATABASE_URL="..." pnpm db:studio    # Open Drizzle Studio (visual DB browser)
DATABASE_URL="..." pnpm seed         # Seed the design library

# MCP Server
npx tsx apps/mcp-server/src/index.ts                    # Local stdio mode
MCP_SERVER_PORT=8080 DATABASE_URL="..." \
  npx tsx apps/mcp-server/src/index.ts                  # HTTP mode
```

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Framework | Next.js 16 (React 19, Turbopack)                    |
| Styling   | Tailwind CSS 4, CVA, tailwind-merge                 |
| Database  | PostgreSQL 15 + Drizzle ORM                         |
| Auth      | Local JWT (email/password + bcrypt)                 |
| MCP       | @modelcontextprotocol/sdk (stdio + Streamable HTTP) |
| Monorepo  | pnpm workspaces + Turborepo                         |
| Linting   | ESLint 10 + Prettier                                |
| Testing   | Vitest                                              |
