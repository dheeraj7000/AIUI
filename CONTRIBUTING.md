# Contributing to AIUI

Thank you for your interest in contributing to AIUI!

## Prerequisites

- **Node.js** 20+ (`nvm install 20`)
- **pnpm** 9.15+ (`corepack enable && corepack prepare pnpm@9`)
- **PostgreSQL** 16+

## Development Setup

```bash
git clone https://github.com/aiui/aiui.git
cd aiui
pnpm install
pnpm build
```

Set up the database:

```bash
sudo -u postgres psql -c "CREATE USER aiui WITH PASSWORD 'aiui';"
sudo -u postgres psql -c "CREATE DATABASE aiui OWNER aiui;"
```

Push schema and seed:

```bash
DATABASE_URL="postgresql://aiui:aiui@127.0.0.1:5432/aiui" pnpm --filter @aiui/design-core db:push
DATABASE_URL="postgresql://aiui:aiui@127.0.0.1:5432/aiui" pnpm --filter @aiui/design-core seed
```

Start development:

```bash
pnpm dev
```

## Branch Naming

- `feature/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation

## Pull Request Checklist

- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes (if tests exist for the changed code)
- [ ] PR description explains what and why

## Code Style

- Follow existing patterns in the codebase
- TypeScript strict mode — no `any` types
- Use Zod for input validation at API boundaries
- Use Drizzle ORM for database queries (never raw SQL)
- Keep functions focused and under 50 lines when practical

## Commit Messages

Use conventional commits:

```
feat: add style pack registry API
fix: handle empty token arrays in compiler
docs: update AWS deployment guide
refactor: extract shared auth helper for LLM routes
```

## Project Structure

```
apps/web/          — Next.js web console
apps/mcp-server/   — MCP server (stdio + HTTP)
packages/types/    — Shared TypeScript types
packages/design-core/ — Database, operations, validation
packages/cli/      — CLI tool (@aiui/cli)
packages/ui/       — Shared React components
packages/prompt-compiler/ — Token export (Tailwind, CSS)
packages/component-engine/ — Component resolution
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
