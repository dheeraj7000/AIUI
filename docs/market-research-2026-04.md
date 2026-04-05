# AIUI Competitive Landscape — Market Research (April 2026)

## Overview

AIUI is an "AI Design Control Layer" — it lets users define design systems (tokens, components, rules) and feeds that context to AI coding assistants (Claude, Cursor, Copilot, Windsurf) via MCP so the AI generates UI that follows the design system.

**No one is building exactly what AIUI is.** The closest competitor (Refine Design) is a free beta limited to Cursor. The biggest threat is Figma's official MCP server, which ships design context for free to anyone already in Figma. But AIUI's combination of multi-source import + token compliance + style packs + design memory sync is unique.

---

## Category 1: Direct Competitors (MCP + Design System Context for AI)

### Refine Design (dzyne.app)

- **URL**: https://www.dzyne.app
- **What**: MCP server storing design profiles (colors, typography, spacing, borders, shadows) with `check-design-consistency` tool for Cursor
- **Pricing**: Free beta
- **vs AIUI**: Closest competitor. Cursor-only, no imports from Figma/CSS/Tailwind/Tokens Studio, no accessibility validation, no style packs, no component recipes
- **Stage**: Early beta, no funding disclosed

### Figma MCP (Official)

- **URL**: https://developers.figma.com/docs/figma-mcp-server/
- **What**: Figma's official MCP server exposing design data (components, styles, variables, tokens) to AI agents. Bidirectional — agents can write back to Figma canvas
- **Pricing**: Included with Figma (free to $75/editor/month)
- **vs AIUI**: **Biggest threat.** Free with Figma. But Figma-locked — AIUI is tool-agnostic, has compliance validation, style packs, design memory sync, accessibility checks
- **Stage**: Part of Figma (~$12.5B valuation)

### AIDesigner MCP

- **URL**: https://www.aidesigner.ai
- **What**: MCP server generating complete UI designs (HTML + Tailwind) from prompts, auto-detects repo CSS tokens and component libraries
- **Pricing**: Free tier with credits, premium plans
- **vs AIUI**: Generates designs, doesn't govern them. No token management or compliance validation
- **Stage**: Early-stage v0.1.0

### Storybook MCP

- **URL**: https://storybook.js.org/docs/ai/mcp/overview
- **What**: Exposes Storybook component documentation and APIs to AI agents. Includes autonomous test correction loop
- **Pricing**: Free / open source
- **vs AIUI**: Component-focused, not token-focused. No token management, no imports, no compliance checking
- **Stage**: Open source (Chromatic, $14.3M Series A)

### Zeroheight MCP

- **URL**: https://zeroheight.com
- **What**: Design system documentation platform with MCP server for AI access to docs, components, and guidelines
- **Pricing**: Free (1 editor) / Team ($49/editor/month) / Enterprise
- **vs AIUI**: Docs-first, added MCP as feature. No compliance validation, no imports from CSS/Tailwind
- **Stage**: $10.4M raised (YC, Adobe, Tribe Capital)

### Subframe

- **URL**: https://www.subframe.com
- **What**: AI-powered design tool producing React + Tailwind. MCP integration with Claude Code and Cursor
- **Pricing**: Startup/enterprise tiers (undisclosed)
- **vs AIUI**: Full design tool + code generator, not a governance layer. No token compliance or accessibility validation
- **Stage**: Pre-Seed (Haystack), San Francisco

---

## Category 2: Design System Platforms (Adding AI/MCP)

### Supernova.io

- **URL**: https://www.supernova.io
- **What**: Full design system management — imports from Figma/Storybook, manages tokens/components/docs, exports production code. Recently added MCP + AI features
- **Pricing**: Free / Pro / Enterprise (credit-based)
- **vs AIUI**: Broader platform, converging on AIUI's space. More complex, less AI-focused
- **Stage**: $24.8M total (Series A $9.2M, Sept 2025)

### Tokens Studio

- **URL**: https://tokens.studio
- **What**: Design token management platform (popular Figma plugin). Git sync, theming, branching, versioning
- **Pricing**: Free / Starter Plus (EUR39/user/month) / Essential (EUR169/month) / Organization (EUR499/month) / Enterprise
- **vs AIUI**: Deep Figma plugin integration. No MCP, no AI features, no compliance validation
- **Stage**: Revenue-funded via subscriptions

### Knapsack

- **URL**: https://www.knapsack.cloud
- **What**: Enterprise design system platform with multi-framework rendering (React, Vue, Angular, Web Components). Adding MCP
- **Pricing**: Enterprise tiers (not public)
- **vs AIUI**: Enterprise-heavy, recently adding MCP from platform angle
- **Stage**: $20.8M total (Google Gradient, Salesforce, Slack Fund)

### Specify

- **URL**: https://specifyapp.com
- **What**: Token pipeline — centralizes tokens from Figma/Tokens Studio/JSON, generates output for CSS/Tailwind/React/Flutter/50+ formats
- **Pricing**: Not disclosed (possibly sunsetting)
- **vs AIUI**: Pure pipeline tool. No MCP, no AI, no compliance
- **Stage**: Possibly sunsetting

### Style Dictionary (Amazon)

- **URL**: https://github.com/style-dictionary/style-dictionary
- **What**: Open-source build system transforming token definitions into CSS/SCSS/iOS/Android/React Native from JSON source
- **Pricing**: Free / open source
- **vs AIUI**: Build tool, not platform. No AI, no MCP, very mature
- **Stage**: Open source (Amazon)

### Backlight.dev (SHUT DOWN)

- **URL**: https://backlight.dev
- **What**: Code-side design system platform with docs, component/token management
- **Pricing**: Was Free / Pro ($149/mo) / Enterprise ($499/mo)
- **vs AIUI**: No AI/MCP. Shutting down June 2025 — validates that pure DS management without AI is dying
- **Stage**: Dead

---

## Category 3: AI Design-to-Code (Different Lane)

### Builder.io (Visual Copilot)

- **URL**: https://www.builder.io
- **What**: One-click Figma-to-code with component mapping. Multi-framework (React, Vue, Svelte, Angular)
- **Pricing**: Fusion / Publish plans
- **vs AIUI**: Converts designs to code, doesn't govern AI output. Complementary
- **Stage**: $62.2M total (Microsoft M12, Greylock)

### Vercel v0

- **URL**: https://v0.app
- **What**: AI generates React + shadcn/ui from prompts, screenshots, mockups
- **Pricing**: Free / Premium ($20/mo) / Team ($30/user/mo) / Business ($100/user/mo)
- **vs AIUI**: Locked to shadcn/ui. Not your design system. Not governance
- **Stage**: Part of Vercel ($3.2B+)

### Anima

- **URL**: https://www.animaapp.com
- **What**: Figma-to-code + AI playground for prompt-based apps. 1M+ Figma installs
- **Pricing**: Free / $31/mo / Enterprise $500/mo
- **vs AIUI**: Design-to-code converter. No governance, no MCP
- **Stage**: Series A (YC, IBM, MizMaa)

### Locofy

- **URL**: https://www.locofy.ai
- **What**: Figma/Penpot to React/React Native/Flutter/Vue/Angular code
- **Pricing**: Free (600 tokens) / Starter ($399/yr) / Pro ($99.9/mo)
- **vs AIUI**: Multi-platform converter. No token management
- **Stage**: $7.3M (Accel, Dropbox, Golden Gate)

### Google Stitch (ex-Galileo AI)

- **What**: Text-to-UI generation powered by Gemini
- **Pricing**: Free in beta
- **vs AIUI**: Generates designs, no governance. Different problem
- **Stage**: Acquired by Google (mid-2025)

---

## Category 4: Design Tools with MCP

### Paper.design

- **URL**: https://paper.design
- **What**: Design tool where every design is HTML/CSS. 24 MCP tools
- **Pricing**: Free (100 MCP calls/week) / Pro ($20/mo)
- **vs AIUI**: Design creation tool, not governance
- **Stage**: Unknown

### Penpot MCP

- **URL**: https://penpot.app
- **What**: Open-source Figma alternative with MCP server
- **Pricing**: Free / open source (self-hostable)
- **vs AIUI**: Design tool with MCP, not token governance
- **Stage**: Open source (Kaleidos)

### Noon

- **URL**: https://noon.design
- **What**: AI-native design tool where design = code from your codebase
- **Pricing**: Not disclosed (just launched from stealth April 2026)
- **vs AIUI**: Full design tool, not a context bridge
- **Stage**: **$44M from stealth** — largest design-tech round ever (First Round, Chemistry)

### shadcn Studio MCP

- **URL**: https://shadcnstudio.com/mcp
- **What**: MCP server for shadcn/ui components + AI theme builder
- **Pricing**: Lifetime access (undisclosed)
- **vs AIUI**: Locked to shadcn/ui ecosystem
- **Stage**: Bootstrapped

---

## Category 5: AI Coding Context Tools

### Cursor Rules (.cursorrules)

- **URL**: https://docs.cursor.com/context/rules-for-ai
- **What**: Manual markdown files prepended to AI prompts for persistent instructions
- **vs AIUI**: AIUI automates what people do manually with Cursor Rules
- **Stage**: Part of Cursor ($400M raised, $9B valuation)

### CLAUDE.md

- **What**: Manual project instructions for Claude Code
- **vs AIUI**: AIUI's sync_design_memory generates these automatically

### ClaudeMDEditor

- **URL**: https://www.claudemdeditor.com
- **What**: Visual editor for AI config files (.cursorrules, CLAUDE.md, copilot-instructions.md, etc.)
- **Pricing**: $13 one-time
- **vs AIUI**: Complementary — edits the files AIUI would generate
- **Stage**: Bootstrapped

### Augment Code

- **URL**: https://www.augmentcode.com
- **What**: AI coding assistant with full-codebase "Context Engine"
- **vs AIUI**: General code context, not design-specific
- **Stage**: $252M raised (Eric Schmidt, Index Ventures)

---

## Competitive Matrix

| Capability                              | AIUI |   Refine    |  Figma MCP   | Supernova  | Tokens Studio | Storybook MCP | v0  |
| --------------------------------------- | :--: | :---------: | :----------: | :--------: | :-----------: | :-----------: | :-: |
| Design token management                 | Yes  |     Yes     |  Via Figma   |    Yes     |      Yes      |      No       | No  |
| MCP for AI assistants                   | Yes  |     Yes     |     Yes      |    New     |      No       |      Yes      | No  |
| Token compliance validation             | Yes  |     Yes     |      No      |     No     |      No       |      No       | No  |
| Import Figma+CSS+Tailwind+Tokens Studio | Yes  |     No      |  Figma only  | Figma only |  Figma only   |      No       | No  |
| Component recipes + AI usage rules      | Yes  |   Partial   | Code Connect |    Yes     |      No       |      Yes      | No  |
| Accessibility validation (WCAG)         | Yes  |     No      |      No      |     No     |      No       |   Via tests   | No  |
| Design memory sync (.aiui/)             | Yes  |   Partial   |      No      |     No     |      No       |      No       | No  |
| Style packs (curated token sets)        | Yes  |     No      |      No      |     No     |      No       |      No       | No  |
| Multi-AI-assistant support              | Yes  | Cursor only |   Multiple   |  Multiple  |      N/A      |   Multiple    | No  |
| Tool-agnostic (no Figma lock-in)        | Yes  |     Yes     |      No      |     No     |      No       |      Yes      | Yes |

---

## Strategic Insights

1. **No one owns this exact niche** — AIUI's "manage tokens + serve via MCP + validate compliance" has no complete competitor
2. **Figma MCP is the existential threat** — free, massive distribution. AIUI's moat: tool-agnostic, compliance, style packs, accessibility
3. **Incumbents converging fast** — Supernova, Knapsack, Zeroheight adding MCP. 6-12 month window
4. **Shutdowns validate timing** — Backlight.dev dead, Specify sunsetting. Pure DS management without AI is dying
5. **Massive funding validates space** — Noon ($44M), Augment ($252M), Builder.io ($62M), Vercel ($250M+)
6. **AIUI's unique differentiators**: Style packs, multi-source import, AI usage rules, design memory sync, compliance + accessibility as MCP tools

---

_Research conducted: April 4, 2026_
