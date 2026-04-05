# Competitor Tech Stack & Delivery Analysis (April 2026)

## How Top Companies Ship Design/AI Tools — Lessons for AIUI

---

## 1. Vercel v0

**Stack:** Next.js + React + Tailwind + shadcn/ui (dogfooded) | AI SDK 3.0 (open source) | Turborepo + pnpm

**Distribution:**

- Web app at v0.app (primary)
- `npx create-v0-sdk-app@latest` for scaffolding
- npm SDK: `v0-sdk` (4-package monorepo)
- GitHub integration for deploy-on-merge
- One-click Vercel deploy from any chat

**Pricing:** Credit-based ($0 free / $20 premium / $30 team / $100 business). Credits = AI compute consumed. Don't roll over.

**Key lessons:**

- Dogfooding your own stack (Next.js, Vercel, AI SDK) creates tight feedback loops
- Credit-based pricing honestly aligns cost with AI compute
- Open-sourcing the AI SDK creates trust while monetizing the hosted product

---

## 2. Storybook / Chromatic

**Stack:** TypeScript + React shell | Vite (0.5s HMR vs 3.5s Webpack) | 400+ addon ecosystem

**Distribution:**

- `npx storybook@latest init` — auto-detects framework, zero-config
- 50+ npm packages under `@storybook/*`
- Chromatic CLI: `npx chromatic` for cloud uploads

**Pricing:** Free (5K snapshots) / Starter $179/mo / Pro $399/mo / Enterprise custom. Extra: $0.008/snapshot.

**Key lessons:**

- **Open-core model** — Storybook free/OSS creates millions of users, Chromatic monetizes the cloud layer
- Zero-config init that auto-detects your framework is the gold standard for DX
- Plugin/addon architecture creates ecosystem moat — hard to leave once invested
- Snapshot-based pricing scales with value delivered

---

## 3. Figma MCP Server

**Stack:** Remote server at `https://mcp.figma.com/mcp` | Streamable HTTP transport | OAuth 2.1

**Distribution:**

- Remote server (recommended): one command — `claude mcp add --transport http figma https://mcp.figma.com/mcp`
- Desktop server: bundled with Figma app at `http://127.0.0.1:3845/mcp`
- Community npm packages also available

**Key lessons:**

- **Remote-first MCP eliminates all local setup friction** — no npx, no Node.js, no processes
- Streamable HTTP over stdio means no local process management
- OAuth 2.1 follows MCP spec standard for remote auth
- Curated client catalog maintains quality control

---

## 4. Builder.io (Visual Copilot)

**Stack:** Mitosis (open-source LLVM-for-UI) compiles JSX to React/Vue/Angular/Svelte/Solid/Qwik | 3-stage AI pipeline: structural model -> Mitosis compiler -> fine-tuned LLM pass

**Distribution:**

- Figma plugin (primary)
- CLI: `npx @builder.io/visual-copilot-cli` — auto-detects codebase
- VS Code extension
- API/SDK for CI/CD

**Pricing:** Free (5 users) / Pro (credit-based) / Enterprise custom.

**Key lessons:**

- **Mitosis as LLVM-for-UI** — one code gen pipeline serves ALL frameworks
- Three-stage pipeline (structural -> compiler -> LLM) separates concerns, improves reliability
- **Open source the compiler, monetize the AI layer** — builds trust without giving away the moat
- CLI that auto-analyzes existing codebase patterns is excellent DX

---

## 5. Supernova.io

**Stack:** Pulsar (proprietary templating language like Handlebars) | Cloud platform + VS Code extension | Git pipelines to GitHub/GitLab/Bitbucket/Azure DevOps

**Distribution:**

- SaaS web platform (primary)
- VS Code extension for local export
- Git-based delivery: pipelines push code to repos automatically
- Open/forkable exporter packages

**Pricing:** Free (5 seats) / Pro / Enterprise (SSO, SOC 2, ISO).

**Key lessons:**

- **Event-driven pipelines** — token update automatically triggers code delivery to repos
- Open exporter ecosystem means community extends without platform changes
- Pulsar templating gives full control over output format
- Connecting to existing Git workflows (not replacing them) reduces adoption friction

---

## 6. Tokens Studio

**Stack:** TypeScript (ESM-only) | Figma Plugin API | Style Dictionary + custom transforms | GraphQL API (Apollo)

**Distribution (triple-surface):**

- **Figma plugin** — visual token management inside Figma
- **npm SDK**: `@tokens-studio/sdk` — ESM TypeScript library
- **CLI**: `npx tokensstudio pull` / `npx tokensstudio setup`
- GitHub sync: tokens stored as JSON in repos

**Key lessons:**

- **Triple-surface distribution** (plugin + SDK + CLI) meets devs everywhere
- ESM-only keeps codebase modern and tree-shakeable
- GraphQL API allows flexible querying (better than REST for token data)
- Style Dictionary integration leverages existing ecosystem rather than reinventing
- Config in `.tokensstudio.json` (like AIUI could use `.aiui.json`)

---

## 7. shadcn/ui (Most Important Lesson)

**Stack:** TypeScript + React + Radix UI primitives + Tailwind | CLI built with Commander.js | Zod for registry validation

**Distribution — The Registry Pattern:**

- **NOT an npm package** — components copied as source into your project
- `npx shadcn add button` fetches JSON from registry, transforms code, writes .tsx files
- Registry serves **static JSON** at `/public/r/[name].json`
- Multi-registry: `@shadcn` (official) + custom namespaces (`@acme/component`)
- Build step: `registry.json` -> emits item JSONs (perfect for CDN/static hosting)

**CLI Pipeline:**

```
Project Detection -> Registry Resolution -> Dependency Tree (recursive)
  -> Code Transformation (import aliases, icons, CSS vars) -> File Installation
```

**Why it dominates:**

1. **Full ownership** — no node_modules dependency, no version lock-in
2. **AI-friendly** — v0, Cursor, Bolt, Lovable all standardized on it because visible source code is easier for AI than opaque library abstractions
3. **Customization-first** — architecture assumes you WILL customize
4. **Bundle size** — up to 50% smaller than traditional component libraries

**AI Integration:**

- Built-in MCP server for AI assistants
- `/llm` routes serving AI-optimized markdown documentation
- Skills system enforcing component patterns

**Key lesson for AIUI:** The registry-as-JSON-API pattern is the most replicable model. Serve static JSON, let a CLI fetch + transform + install. No server infrastructure needed. This is exactly how AIUI style packs could be distributed.

---

## 8. Subframe

**Stack:** Web app generating React + Tailwind | MCP server at `https://mcp.subframe.com/mcp` (HTTP transport) | OAuth + bearer token dual auth

**MCP Tools (11):** list_projects, list_components, list_pages, get_component_info, get_page_info, get_theme, edit_theme, design_page, edit_page, get_variations, generate_auth_token

**Distribution:**

- Claude Code: marketplace plugin (auto-configures MCP + skills)
- Cursor: direct URL registration + `npm install @anthropic-ai/agent-skills-subframe`
- CLI for terminal workflows

**Key lessons:**

- Remote HTTP MCP server eliminates local setup friction
- OAuth + bearer token dual auth accommodates different clients
- Bundling agent skills as npm package alongside MCP is smart DX
- Read AND write MCP tools (not just read) increase value

---

## 9. Paper.design

**Stack:** HTML/CSS native canvas (not proprietary SVG) | GPU shaders | Multi-model AI (Flux, Gemini, OpenAI) | Local MCP at `http://127.0.0.1:29979/mcp`

**24 MCP Tools** — Read (11): get_basic_info, get_selection, get_node_info, get_children, get_tree_summary, get_screenshot, get_jsx, get_computed_styles, get_fill_image, get_font_family_info, get_guide | Write (7): create_artboard, write_html, set_text_content, rename_nodes, duplicate_nodes, update_styles, delete_nodes | Workflow (2): start_working_on_nodes, finish_working_on_nodes | Placement (1): find_placement

**Pricing:** Free / Pro $16/mo (1M MCP calls/week)

**Key lessons:**

- HTML/CSS native means zero translation layer — LLMs understand DOM natively
- Workflow indicators (`start_working_on_nodes`/`finish_working_on_nodes`) let AI signal intent to UI
- 1M MCP calls/week at $16/mo is aggressive pricing for AI workflows
- Auto-started local MCP server (via desktop app) eliminates auth complexity

---

## Cross-Cutting Patterns

### MCP Distribution Options (Ranked)

| Method                 | Best For                 | Example                       |
| ---------------------- | ------------------------ | ----------------------------- |
| Remote HTTP URL        | Production, zero install | Figma, Subframe               |
| `npx @scope/server`    | Quick dev setup          | shadcn, Tokens Studio         |
| Desktop app auto-start | Design tools             | Paper.design, Figma Desktop   |
| Docker                 | Enterprise/self-hosted   | Production deployments        |
| MCPB installer bundle  | Non-technical users      | `npx @anthropic-ai/mcpb pack` |

### Developer Tool Distribution Strategy

The winning formula:

1. **CLI for power users** (npx for zero-install)
2. **IDE extensions** for where devs already work
3. **GitHub integrations** for team workflows
4. **SDKs/APIs** for programmatic embedding
5. **Web dashboards** only when necessary

### Open Source to SaaS Conversion

- 0.3-1% conversion is viable for mass-market dev tools
- Visitor-to-trial: 2.1-7.1%
- Trial-to-paid: 12-28% (top performers >35%)
- **Pattern:** Open source first -> PLG freemium -> Enterprise sales

### Pricing Models

| Model             | Used By                  | Why                            |
| ----------------- | ------------------------ | ------------------------------ |
| Credit-based (AI) | v0, Builder.io           | Cost = compute consumed        |
| Usage-based       | Chromatic                | Scales with value              |
| Freemium + seats  | Supernova, Tokens Studio | Free adoption -> team upsell   |
| OSS + paid cloud  | Storybook/Chromatic      | Massive adoption -> conversion |
| Flat subscription | Paper.design             | Simple, predictable            |

---

_Research conducted: April 4, 2026_
