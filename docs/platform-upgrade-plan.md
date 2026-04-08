# AIUI Platform Upgrade Plan — 10 Competitive Improvements

Based on market research of 27 companies (Figma MCP, shadcn/ui, Storybook, Builder.io, Tokens Studio, v0, Paper.design, Subframe, Supernova, Knapsack).

**Goal:** Transform AIUI from a local-first design system tool into a production-ready, multi-surface developer platform.

**Estimated total effort:** ~100 hours across 3 waves (60 tasks)

---

## Wave 0 — Foundation (extend existing code, no new packages)

These 3 improvements extend existing files. No new packages needed. All independent — can be built in parallel.

---

### 1. LLM Documentation Routes

**What:** Add `/llm/tokens`, `/llm/components`, `/llm/guidelines` routes to the Next.js web app that serve AI-optimized markdown.

**Why:** shadcn/ui serves `/llm` routes with AI-optimized markdown. This is the lowest-friction way to expose design context — any AI tool that can fetch a URL gets full design system context without MCP.

**Estimated effort:** ~6 hours (5 tasks)

#### New files:

- `apps/web/src/app/llm/tokens/route.ts`
- `apps/web/src/app/llm/components/route.ts`
- `apps/web/src/app/llm/guidelines/route.ts`
- `apps/web/src/app/llm/lib/auth.ts` (shared auth helper)

#### How it works:

**GET /llm/tokens?project=my-project**

- Query project by slug using existing `getProjectContext` from design-core
- Fetch style pack + all tokens
- Group tokens by type: colors, fonts, spacing, radii, shadows, etc.
- Format as markdown with `##` headers per type, values in tables
- Return `Content-Type: text/markdown; charset=utf-8`

**GET /llm/components?project=my-project**

- Fetch component recipes for the project's style pack
- Group by tier: atoms, molecules, organisms, templates
- Include for each: name, type, tier, codeTemplate (truncated), aiUsageRules, jsonSchema summary
- Format as structured markdown

**GET /llm/guidelines?project=my-project**

- Compile from existing code:
  - 7 core design rules (already defined in `design-memory.ts`)
  - WCAG contrast requirements (from `validation/accessibility.ts`)
  - Font sizing rules, spacing scale rules
  - Token compliance rules (from `validation/token-compliance.ts`)
- Mix of static rules + project-specific token constraints

**Auth:**

- Public projects (style pack `isPublic = true`): no auth required
- Private projects: require `Authorization: Bearer <api-key>` header
- Reuse `verifyApiKey` from design-core

**Caching:**

- `Cache-Control: public, max-age=3600, stale-while-revalidate=600`
- `ETag` based on design profile `compiledHash`
- Return `304 Not Modified` if `If-None-Match` matches
- Keep each response under 32KB (fits most LLM context windows)

#### Acceptance criteria:

- `curl localhost:3000/llm/tokens?project=demo` returns markdown with all token values
- `curl localhost:3000/llm/components?project=demo` returns recipes grouped by tier
- `curl localhost:3000/llm/guidelines?project=demo` returns a11y + compliance + design rules
- Private projects return 401 without valid API key
- All responses have Cache-Control and ETag headers

---

### 2. MCP Write Tools

**What:** Add 4 write operations to the MCP server: `create_style_pack`, `update_tokens`, `apply_style_pack`, `fix_compliance_issues`.

**Why:** Paper.design has 24 MCP tools (11 read + 7 write). Subframe has `edit_theme` and `design_page`. AIUI's current 8 tools are mostly read-only. Write tools make AIUI a two-way bridge — AI agents can modify the design system, not just read it.

**Estimated effort:** ~10 hours (6 tasks)

#### New files:

- `apps/mcp-server/src/tools/write-style-pack.ts`
- `apps/mcp-server/src/tools/write-tokens.ts`
- `apps/mcp-server/src/tools/write-project.ts`
- `apps/mcp-server/src/tools/fix-compliance.ts`

#### Modified files:

- `apps/mcp-server/src/tools/index.ts` (register new tools)
- `apps/mcp-server/src/lib/auth.ts` (scope checking)

#### Tool specifications:

**create_style_pack**

- Params: `name` (string), `description` (string), `tokens` (array of `{key, type, value}`), `category` (optional)
- Creates style pack + tokens in a single DB transaction
- Generates slug from name (reuse existing slug generation pattern)
- Returns: `{ id, slug, tokenCount }`
- Uses existing `createStylePack` + `createToken` from design-core

**update_tokens**

- Params: `stylePackId` (uuid), `updates` (array of `{key, value?, delete?: boolean}`)
- Batch upsert/delete tokens in a transaction
- Validates `tokenType` against `tokenCategoryEnum` (16 types)
- Returns: `{ added: N, modified: N, deleted: N, total: N }`

**apply_style_pack**

- Params: `projectSlug` (string), `stylePackSlug` (string)
- Looks up project and pack by slug
- Calls `assignStylePack` from design-core
- Triggers `compileProfile` to rebuild the design profile
- Returns: `{ projectId, stylePackId, compiledHash, tokenCount }`

**fix_compliance_issues**

- Params: `code` (string), `violations` (array from `validate_ui_output` output), `projectSlug` (string)
- Fetches approved tokens for the project
- For each violation, generates a token-based replacement (e.g., `text-red-500` → `text-error` using the project's error color token)
- Returns: `{ fixedCode, fixesApplied: N, remainingIssues: [] }`

**Scope checking:**

- All write tools require `mcp:write` scope in the API key
- Check scopes before executing handler
- Return error with code `INSUFFICIENT_SCOPE` if missing
- Follows existing tool registration pattern (Zod schemas, ToolError hierarchy)

#### Acceptance criteria:

- `create_style_pack` creates pack + tokens, returns ID
- `update_tokens` modifies tokens, returns diff summary
- `apply_style_pack` assigns pack + compiles profile
- `fix_compliance_issues` returns corrected code
- All write tools rejected without `mcp:write` scope
- `tools/list` MCP response shows 12+ tools (was 8)

---

### 3. Remote HTTP MCP Improvements

**What:** Make the HTTP MCP server production-ready and the default recommended setup. Add OAuth 2.1, enhanced health/test endpoints, CORS hardening, HTTP-first docs.

**Why:** Figma ships `https://mcp.figma.com/mcp`, Subframe ships `https://mcp.subframe.com/mcp`. Remote HTTP means zero local install, zero Node.js requirement. AIUI already has HTTP mode but stdio is the default in docs.

**Estimated effort:** ~10 hours (6 tasks)

#### Modified files:

- `apps/mcp-server/src/http-server.ts` (health, test, CORS)
- `apps/mcp-server/src/lib/auth.ts` (OAuth support)
- `README.md` (HTTP-first docs)
- `LOCAL_SETUP.md` (HTTP-first docs)

#### New files:

- `apps/mcp-server/src/lib/oauth.ts` (OAuth 2.1 flow)

#### Changes:

**Enhanced health endpoint (`GET /health`)**

- Current: returns basic status
- New: returns `{ status: "ok", version: "0.1.0", uptime_seconds: N, tools_count: 12, sessions_active: N, transport: "streamable-http" }`
- Read version from package.json at startup
- Track `startTime` at server boot for uptime

**Connection test endpoint (`GET /mcp/test`)**

- New endpoint for users to verify their API key works
- Authenticates request (same as `/mcp`)
- Returns: `{ authenticated: true, userId, organizationId, scopes, projectId }`
- On auth failure: `401` with `{ error: "...", setup_instructions_url: "/quick-setup" }`

**OAuth 2.1 authorization flow**

- `GET /oauth/authorize` — redirect to consent page with state param
- `POST /oauth/token` — exchange authorization code for access token
- In-memory state store with 10-minute TTL
- Coexist with API key auth: try OAuth first, fall back to API key
- Follows MCP spec standard for remote server auth

**CORS hardening**

- When `MCP_CORS_ORIGINS` is set (not `*`): reject non-matching origins with 403
- Add `Vary: Origin` header for proper CDN behavior
- Log CORS rejections to stderr for debugging
- Keep `*` as default for development

**HTTP-first documentation**

- Rewrite README MCP section: HTTP setup first
- One-liner commands for each client:
  - Claude Code: `claude mcp add --transport http aiui https://mcp.aiui.dev/mcp --header "Authorization: Bearer aiui_k_xxx"`
  - Cursor: `.cursor/mcp.json` snippet
  - VS Code Copilot: `settings.json` snippet
  - Windsurf: config snippet
- Show stdio as "Alternative: Local Development" section

**Client setup generator (`GET /mcp/setup`)**

- Given an API key + MCP URL, generates copy-pasteable config for each client
- Returns as JSON or markdown
- Useful for the quick-setup page and CLI

#### Acceptance criteria:

- `GET /health` returns version, uptime, tool count, session count
- `GET /mcp/test` validates auth and returns scopes/org info
- OAuth 2.1 authorization code flow works
- CORS rejects unlisted origins when configured (403)
- README shows HTTP setup first with one-liner commands

---

## Wave 1 — Distribution Layer (new packages and surfaces)

These 4 improvements build the distribution infrastructure. Dependencies on Wave 0 noted.

---

### 4. CLI Distribution

**Depends on:** #3 (Remote HTTP MCP — CLI needs HTTP endpoint to fetch from)

**What:** Extend `packages/cli` from a single `aiui validate` command into a full CLI with `init`, `add`, `sync`, `publish` commands. Distribute via npm as `@aiui/cli`.

**Why:** Every successful competitor ships a CLI: shadcn (`npx shadcn add`), Storybook (`npx storybook init`), Tokens Studio (`npx tokensstudio pull`), Builder.io (`npx @builder.io/visual-copilot-cli`). CLI is the #1 distribution surface for developer tools.

**Estimated effort:** ~16 hours (8 tasks)

#### Current state:

- `packages/cli/` exists with `aiui validate` command only
- Custom `parseArgs()` — no proper CLI framework
- 4 files: `index.ts`, `commands/validate.ts`, `lib/scanner.ts`, `lib/reporter.ts`
- Built with tsc, bin entry: `aiui` → `./dist/index.js`

#### New dependencies (add to packages/cli/package.json):

- `commander` — CLI framework (argument parsing, help generation, subcommands)
- `ora` — terminal spinners for async operations
- `chalk` — colored terminal output
- `prompts` — interactive prompts for init flow

#### New library modules:

**`packages/cli/src/lib/detect-framework.ts`**

- Read target project's `package.json`
- Detect framework: `next` (has `next` dep), `vite` (has `vite`), `remix` (has `@remix-run/react`), `astro` (has `astro`), `react` (has `react` but none of the above)
- Check for Tailwind: `tailwindcss` in devDependencies
- Detect package manager: check for `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
- Return: `{ framework: string, hasTailwind: boolean, packageManager: 'pnpm' | 'npm' | 'yarn' }`

**`packages/cli/src/lib/config.ts`**

- Read/write `.aiui/config.json`
- Zod schema: `{ projectSlug: string, framework: string, registryUrl: string, activePack: string, lastSynced: string, registries?: Record<string, string> }`
- Create `.aiui/` directory if missing
- Validate on read, error on invalid schema

**`packages/cli/src/lib/registry-client.ts`**

- Fetch pack JSON from registry URL: `GET {registryUrl}/api/registry/{slug}.json`
- Resolve custom registries: `@namespace/slug` → look up namespace in config → construct URL
- Cache fetched packs in `.aiui/.cache/` (avoid re-fetching)
- Support `--local` flag: import `createDb` from `@aiui/design-core`, query packs directly

**`packages/cli/src/lib/transformer.ts`**

- Input: `RegistryItem` tokens array
- Output: framework-specific file content
- Tailwind: generate `tailwind.config.ts` extend block with proper nesting
- CSS: generate `:root { --color-primary: #xxx; ... }` custom properties
- JSON: normalized pass-through

#### New commands:

**`aiui init`** (`packages/cli/src/commands/init.ts`)

1. Detect framework via `detect-framework.ts`
2. Prompt for project name (default: directory name)
3. Prompt for style pack (show list from registry index, default: `saas-clean`)
4. Fetch selected pack from registry
5. Transform tokens to framework format
6. Write: `.aiui/config.json`, `.aiui/design-memory.md`, `.aiui/tokens.json`
7. Add `.aiui/tokens.json` to `.gitignore`
8. Show success message with next steps

**`aiui add <pack-slug>`** (`packages/cli/src/commands/add.ts`)

- Fetch pack from registry by slug
- Transform tokens to framework format
- Write updated token files
- Regenerate `design-memory.md`
- Show diff summary of what changed

**`aiui sync`** (`packages/cli/src/commands/sync.ts`)

- Read current `.aiui/config.json`
- Re-fetch pack from registry (or DB with `--local`)
- Regenerate `design-memory.md` and `tokens.json`
- Update `lastSynced` timestamp
- Show what changed since last sync

**`aiui publish`** (`packages/cli/src/commands/publish.ts`)

- Read `.aiui/config.json` for active pack
- Prompt for namespace if not provided
- Call `POST /api/registry/publish` with API key
- Show success with install command

#### Entry point rewrite (`packages/cli/src/index.ts`):

- Replace custom `parseArgs()` with Commander.js
- Register all commands: `init`, `add`, `sync`, `publish`, `validate` (existing)
- Add `--version` (from package.json), `--help` (auto-generated)

#### Acceptance criteria:

- `npx @aiui/cli init` detects Next.js, creates `.aiui/`, writes design-memory.md
- `npx @aiui/cli add saas-clean` fetches pack, writes Tailwind tokens
- `npx @aiui/cli sync` regenerates design memory from current config
- Framework detection works for Next.js, Vite, Remix, Astro
- `--help` shows all commands with descriptions
- All commands work offline with `--local` flag

---

### 5. Style Pack Registry

**Depends on:** #1 (LLM Documentation Routes — registry shares the serving pattern)

**What:** Serve style packs as static JSON following shadcn/ui's registry-as-JSON-API pattern. CLI and web clients fetch JSON descriptors from `/api/registry/*` endpoints.

**Why:** shadcn/ui's registry pattern is the most successful distribution model in the ecosystem. Every AI tool (v0, Cursor, Bolt, Lovable) standardized on it because visible source code > opaque library. AIUI style packs should follow the same pattern.

**Estimated effort:** ~8 hours (5 tasks)

#### New files:

- `packages/design-core/src/validation/registry.ts` — Zod schema for registry items
- `packages/design-core/src/operations/registry.ts` — pack-to-JSON serializer
- `apps/web/src/app/api/registry/index/route.ts` — list all packs
- `apps/web/src/app/api/registry/[slug]/route.ts` — get single pack

#### Registry item schema (Zod):

```typescript
const registryItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  version: z.string(),
  category: z.string(),
  description: z.string(),
  tokens: z.array(
    z.object({
      key: z.string(),
      type: z.string(), // tokenCategoryEnum value
      value: z.string(),
      description: z.string().optional(),
    })
  ),
  componentSlugs: z.array(z.string()),
  author: z.string().optional(),
});
```

#### Pack serializer:

```typescript
// packages/design-core/src/operations/registry.ts
async function serializePackForRegistry(db: Database, slug: string): Promise<RegistryItem>;
```

- Fetch style pack by slug
- Fetch all tokens for pack
- Fetch component slugs (not full recipes — keep response small)
- Validate output against `registryItemSchema`
- Return clean JSON

#### Endpoints:

**GET /api/registry/index.json**

- Returns array of all public packs with metadata (no tokens)
- Shape: `[{ name, slug, category, version, tokenCount, componentCount }]`
- `Cache-Control: public, max-age=300`
- No auth required

**GET /api/registry/[slug].json**

- Calls `serializePackForRegistry(db, slug)`
- Returns full `RegistryItem` JSON with tokens + component refs
- `Cache-Control: public, max-age=300, stale-while-revalidate=60`
- `ETag` based on version + token count hash
- 404 if pack not found

#### Custom registry resolution (in CLI):

- Parse `@namespace/slug` format
- Look up namespace → base URL in `.aiui/config.json` registries map
- Construct full URL: `{baseUrl}/api/registry/{slug}.json`
- Fallback to default AIUI registry if no namespace

#### Acceptance criteria:

- `GET /api/registry/index.json` returns all 6 seed packs
- `GET /api/registry/saas-clean.json` returns full pack with tokens
- Response passes Zod validation
- Cache headers present on all responses
- `@acme/corp-tokens` resolves to custom registry URL
- All 6 seed packs serialize correctly

---

### 6. Hosted MCP Deployment

**Depends on:** #3 (Remote HTTP MCP — must be production-ready before hosting)

**What:** Make the MCP server deployable as a standalone hosted service. Docker Compose for local dev. Minimal API key generation page. AWS deployment infrastructure.

**Why:** The fastest path to users is a hosted URL and an API key. Developers don't want to open a web dashboard — they want `https://mcp.aiui.dev/mcp` and a Bearer token.

**Estimated effort:** ~10 hours (6 tasks)

#### New files:

- `docker-compose.yml` (root)
- `docker-compose.prod.yml` (production overrides)
- `apps/web/src/app/quick-setup/page.tsx`
- `docs/deploy-aws.md`

#### Docker Compose (`docker-compose.yml`):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: aiui
      POSTGRES_USER: aiui
      POSTGRES_PASSWORD: aiui
    healthcheck:
      test: pg_isready -U aiui
    ports: ['5432:5432']

  mcp-server:
    build: { context: ., dockerfile: apps/mcp-server/Dockerfile }
    depends_on: { postgres: { condition: service_healthy } }
    environment:
      DATABASE_URL: postgresql://aiui:aiui@postgres:5432/aiui
      MCP_SERVER_PORT: '8080'
    ports: ['8080:8080']

  web:
    build: { context: ., dockerfile: apps/web/Dockerfile }
    depends_on: { postgres: { condition: service_healthy } }
    environment:
      DATABASE_URL: postgresql://aiui:aiui@postgres:5432/aiui
    ports: ['3000:3000']

volumes:
  pgdata:
```

#### Quick-setup page (`/quick-setup`):

- Standalone page with minimal navigation (not behind auth wall)
- Flow:
  1. Enter email
  2. POST `/api/auth/signup` (or `/signin` if account exists)
  3. Auto-create org via `/api/auth/setup`
  4. Generate API key via `POST /api/api-keys`
  5. Display: API key (copy-to-clipboard) + one-liner MCP setup commands for Claude Code, Cursor, VS Code, Windsurf
- Each command is a copy-to-clipboard block
- Warning: "Save your API key — it won't be shown again"

#### Deploy docs:

- **AWS** (`docs/deploy-aws.md`): ECS/Fargate deployment, RDS PostgreSQL, ALB routing, environment variables, health checks, CI/CD pipeline

#### Acceptance criteria:

- `docker compose up` starts MCP + Postgres, seeds DB, serves on :8080
- Quick-setup page: email → API key → one-liner MCP commands
- `GET /health` returns OK with version and session count
- AWS deployment docs are complete
- All env vars documented with defaults

---

### 7. Zero-Config First-Run

**Depends on:** #4 (CLI Distribution) + #5 (Style Pack Registry)

**What:** Make `npx @aiui/cli init` work end-to-end in under 30 seconds with minimal prompts.

**Why:** Storybook's `npx storybook@latest init` (zero-config, auto-detects framework) is the gold standard. AIUI currently requires ~15 manual setup steps. First impression determines adoption.

**Estimated effort:** ~8 hours (5 tasks)

#### The init flow:

```
$ npx @aiui/cli init

  Detecting project...
  ✓ Framework: Next.js (Tailwind CSS detected)

  ? Project name: my-saas-app
  ? Style pack: (Use arrow keys)
  ❯ saas-clean — Clean SaaS aesthetic (31 tokens, 8 components)
    fintech-light — Financial services (31 tokens, 6 components)
    startup-bold — Bold startup style (31 tokens, 6 components)
    shadcn-essentials — Radix + Tailwind (33 tokens, 14 components)
    magicui-effects — Visual effects (32 tokens, 13 components)
    community-creative — Creative design (32 tokens, 10 components)

  ✓ Fetched saas-clean from registry
  ✓ Generated Tailwind token config
  ✓ Written .aiui/config.json
  ✓ Written .aiui/design-memory.md (31 tokens, 8 components)
  ✓ Written .aiui/tokens.json
  ✓ Added .aiui/tokens.json to .gitignore

  Done! Add this to your CLAUDE.md:

  ## Design System
  This project uses AIUI for design management.
  See `.aiui/design-memory.md` for the active design system.
  Always follow the design rules defined there before building any UI.

  MCP setup (Claude Code):
  claude mcp add --transport http aiui https://app.aiui.dev/mcp

  Next: aiui add <pack> | aiui sync | aiui validate
```

#### Flags:

- `--yes` / `-y`: Skip all prompts. Defaults: framework auto-detected, pack `saas-clean`, hosted registry, dir name as slug
- `--local`: Use `DATABASE_URL` instead of HTTP registry
- `--db <url>`: Explicit database URL for local mode
- `--json`: Output machine-readable JSON instead of human-friendly text
- `--registry <url>`: Custom registry URL

#### Design memory writer (`packages/cli/src/lib/writer.ts`):

- `writeDesignMemory(tokens, components, config)` → `.aiui/design-memory.md`
- `writeTokensJson(tokens)` → `.aiui/tokens.json`
- `writeConfig(config)` → `.aiui/config.json`
- Markdown format matches the MCP `design-memory` tool's 5-layer structure
- Extract markdown generation from `apps/mcp-server/src/tools/design-memory.ts` into a shared function in design-core

#### Post-init verification:

- Verify all expected files exist
- Print summary with checkmarks
- Show CLAUDE.md snippet (copy-pasteable)
- Show MCP setup one-liner for detected AI tool
- Show next commands: `aiui add`, `aiui sync`, `aiui validate`

#### Acceptance criteria:

- In fresh Next.js project: `npx @aiui/cli init` → `.aiui/` created in <30 seconds
- `.aiui/config.json` has: projectSlug, framework, registryUrl, activePack
- `.aiui/design-memory.md` matches MCP tool's 5-layer format
- `--yes` skips all prompts with sensible defaults
- `--local --db postgresql://...` works without network
- Post-init shows files created, CLAUDE.md snippet, MCP setup one-liner

---

## Wave 2 — Growth & Monetization

These 3 improvements build on the distribution layer from Wave 1.

---

### 8. Open Source Packaging

**Depends on:** #4 (CLI) + #5 (Registry) + #6 (Hosted MCP)

**What:** Prepare all packages for public open-source release on npm and GitHub. MIT licenses, per-package READMEs, CONTRIBUTING.md, CI/CD workflows.

**Why:** The open-core model works: Storybook (free) → Chromatic (paid cloud). Builder.io open-sources Mitosis (compiler) but charges for Visual Copilot (AI). AIUI needs bottoms-up adoption through free npm packages to build a user base.

**Estimated effort:** ~8 hours (7 tasks)

#### What to open-source (MIT license):

- `@aiui/types` — TypeScript interfaces + Zod schemas
- `@aiui/design-core` — Database schema, operations, validation, compiler, importers
- `@aiui/prompt-compiler` — Token merging, validation, CSS/Tailwind export
- `@aiui/component-engine` — Component resolution + rule validation
- `@aiui/ui` — Shared React components
- `@aiui/cli` — CLI tool
- `@aiui/mcp-server` — MCP server (bin: `aiui-mcp-server`)

#### What stays proprietary (future paid features):

- Hosted MCP endpoint (`https://mcp.aiui.dev`)
- Team collaboration features
- Style pack marketplace with premium packs
- Advanced compliance analytics dashboard
- Enterprise SSO / audit logging

#### Per-package README template:

```markdown
# @aiui/package-name

Description.

[![npm](https://img.shields.io/npm/v/@aiui/package-name)](https://www.npmjs.com/package/@aiui/package-name)
[![license](https://img.shields.io/npm/l/@aiui/package-name)](./LICENSE)

## Install

npm install @aiui/package-name

## Quick Start

[code example]

## API

[key exports]

## License

MIT
```

#### GitHub Actions:

**CI workflow (`.github/workflows/ci.yml`):**

- Trigger: push to main + PRs
- Steps: checkout → setup Node 20 + pnpm → install → build → lint → typecheck → test
- Cache pnpm store for speed

**Publish workflow (`.github/workflows/publish.yml`):**

- Trigger: GitHub release created (tag `v*`)
- Build all packages
- Publish in dependency order: types → design-core → prompt-compiler → component-engine → ui → cli
- Use `NPM_TOKEN` secret
- Skip already-published versions

#### Package.json updates (all packages):

- `repository`: `{ "type": "git", "url": "https://github.com/aiui/aiui" }`
- `homepage`: `https://aiui.dev`
- `bugs`: `{ "url": "https://github.com/aiui/aiui/issues" }`
- `keywords`: `["design-system", "mcp", "tokens", "ai", "design-tokens"]`
- `engines`: `{ "node": ">=20" }`
- `files`: `["dist", "LICENSE", "README.md"]` (excludes src, tests, tsconfig)

#### Changesets:

- Configure `@changesets/cli` for versioning
- `.changeset/config.json`: `{ "access": "public", "baseBranch": "main" }`
- Add `changeset` script to root package.json

#### Acceptance criteria:

- Every package has LICENSE (MIT) and README.md
- `pnpm build` succeeds for all packages
- CI runs tests on every PR
- `npm publish` from CI publishes all @aiui/\* packages
- `npm pack` shows only dist + metadata (no src, no tests)

---

### 9. Credit-Based Pricing

**Depends on:** #6 (Hosted MCP Deployment)

**What:** Add usage tracking and credit-based tier enforcement to the MCP server. Track tool calls, validation requests, compilation events per organization. Enforce tier limits.

**Why:** v0 and Builder.io use credit-based pricing — cost aligns with AI compute consumed. This is the monetization foundation.

**Estimated effort:** ~12 hours (6 tasks)

#### Tier definitions:

| Tier       | Credits/month | Price       | Target                  |
| ---------- | ------------- | ----------- | ----------------------- |
| Free       | 100           | $0          | Individual developers   |
| Pro        | 1,000         | $20/mo      | Professional developers |
| Team       | 10,000        | $30/seat/mo | Small teams             |
| Enterprise | Unlimited     | Custom      | Large organizations     |

Each MCP tool call = 1 credit. Validation calls = 1 credit. Compilation = 1 credit. Credits reset on the 1st of each month. Credits do not roll over.

#### New database tables:

**usage_events:**

```sql
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  tool_name VARCHAR(100) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'tool_call', 'validation', 'compilation'
  credits_cost INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_usage_org_date ON usage_events (organization_id, created_at);
```

**credit_ledger:**

```sql
CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  credits_used INT NOT NULL DEFAULT 0,
  credits_limit INT NOT NULL,
  tier VARCHAR(20) NOT NULL,
  UNIQUE (organization_id, period_start)
);
```

#### Usage checking middleware (`apps/mcp-server/src/lib/usage.ts`):

- In-memory cache: `Map<orgId, { used, limit, cachedAt }>` with 60-second TTL
- On each tool call:
  1. Check cache first (fast path)
  2. On cache miss: query `credit_ledger` for current period
  3. If `used >= limit`: return 429 with `{ error: "credit_limit_exceeded", used, limit, resets_at, upgrade_url }`
  4. If allowed: execute tool, then track usage **asynchronously** (non-blocking)
- Skip DB check entirely for unlimited tiers (enterprise)
- Add response headers: `X-Credits-Remaining`, `X-Credits-Limit`

#### Usage operations (`packages/design-core/src/operations/usage.ts`):

- `trackUsage(db, { keyId, orgId, tool, type })` — insert event + increment ledger
- `getUsage(db, orgId)` — return current period stats
- `checkLimit(db, orgId)` — return `{ allowed, used, limit, remaining }`
- `ensureLedger(db, orgId)` — create ledger row if missing for current month

#### API endpoints:

- `GET /api/usage` — `{ used, limit, remaining, tier, period_start, period_end, resets_at }`
- `GET /api/usage/history?months=6` — array of `{ period, used, limit }` per month
- Both require authenticated user, scoped to their org

#### Acceptance criteria:

- Every MCP tool call creates a `usage_event` record
- Free tier: 429 error after 100 calls/month
- `GET /api/usage` returns correct stats
- Credit check adds <5ms latency (in-memory cache)
- `X-Credits-Remaining` header on every MCP response

---

### 10. Style Pack Marketplace

**Depends on:** #5 (Style Pack Registry) + #8 (Open Source Packaging)

**What:** Build the database schema, API endpoints, and CLI command for a style pack marketplace. Designers publish packs, developers install them.

**Why:** No competitor has curated, installable design token sets. A marketplace where designers publish and developers install via `npx aiui add @designer/corporate-blue` is AIUI's unique competitive moat.

**Estimated effort:** ~12 hours (6 tasks)

#### New database tables:

**pack_registry:**

```sql
CREATE TABLE pack_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_pack_id UUID NOT NULL REFERENCES style_packs(id),
  namespace VARCHAR(100) NOT NULL,    -- e.g., "@myorg"
  slug VARCHAR(100) NOT NULL,          -- e.g., "corporate-blue"
  published_by UUID NOT NULL REFERENCES users(id),
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  description TEXT,
  downloads INT NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  ratings_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (namespace, slug)
);
CREATE INDEX idx_pack_downloads ON pack_registry (downloads DESC);
CREATE INDEX idx_pack_rating ON pack_registry (average_rating DESC);
```

**pack_ratings:**

```sql
CREATE TABLE pack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_registry_id UUID NOT NULL REFERENCES pack_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pack_registry_id, user_id)
);
```

#### Marketplace operations (`packages/design-core/src/operations/marketplace.ts`):

- `publishPack(db, { userId, stylePackId, namespace, description? })` — validate ownership (user must be owner/admin of pack's org), serialize pack, insert into `pack_registry`, return `{ namespace, slug, version, url }`
- `searchPacks(db, { q?, category?, sort, limit, offset })` — `ilike` search on name + description, filter by category, sort by downloads/rating/newest, paginate
- `getMarketplacePack(db, namespace, slug)` — fetch pack + increment downloads counter
- `ratePack(db, { userId, packRegistryId, score })` — upsert rating (one per user), recalculate average

#### API endpoints:

**POST /api/registry/publish**

- Requires API key auth
- Validate: user must own the style pack's organization
- Call `publishPack()`
- Return: `{ namespace, slug, version, url }`
- 409 if namespace/slug already exists

**GET /api/registry/search**

- Query params: `q` (text), `category` (enum), `sort` (downloads|rating|newest), `limit` (default 20), `offset`
- Returns: `{ results: RegistryItem[], total, page, pageSize }`
- No auth required (public marketplace)
- `Cache-Control: public, max-age=60`

**POST /api/registry/[namespace]/[slug]/rate**

- Requires auth
- Body: `{ score: 1-5 }`
- Upserts rating, recalculates average

#### CLI publish command (`packages/cli/src/commands/publish.ts`):

- Read `.aiui/config.json` for active pack
- Prompt for namespace if not provided (`--namespace` flag)
- Prompt for description
- Call `POST /api/registry/publish` with API key from `AIUI_API_KEY` env or `--key` flag
- Show success: `"Published! Install with: npx aiui add @namespace/slug"`

#### Acceptance criteria:

- `POST /api/registry/publish` creates marketplace entry
- `GET /api/registry/search?q=fintech&sort=downloads` returns matches
- `npx aiui add @myorg/brand-tokens` resolves and installs marketplace pack
- Download counts increment on fetch
- Rating endpoint accepts 1-5 scores
- Search supports text query, category filter, sort by downloads/rating/newest

---

## Wave Execution Summary

```
Wave 0 (Foundation) — ~26 hours, 3 parallel tracks
  #1 LLM Docs          6h   ████░░░░░░
  #2 MCP Write Tools   10h  ████████░░
  #3 Remote HTTP MCP   10h  ████████░░

Wave 1 (Distribution) — ~42 hours, 4 tracks (some sequential)
  #4 CLI Distribution   16h  ████████████████
  #5 Style Pack Registry 8h  ████████░░░░░░░░
  #6 Hosted MCP Deploy  10h  ████████████░░░░
  #7 Zero-Config Init    8h  ░░░░░░░░████████  (starts after #4 + #5)

Wave 2 (Growth) — ~32 hours, 3 tracks
  #8 Open Source Package  8h  ████████░░░░░░░░  (starts after #4 + #5 + #6)
  #9 Credit Pricing      12h  ████████████░░░░  (starts after #6)
  #10 Marketplace        12h  ░░░░░░░░████████████  (starts after #5 + #8)
```

**Critical path:** #3 → #4 → #7 (Remote HTTP → CLI → Zero-Config) — this is the user-facing onboarding path and should be prioritized above all else.
