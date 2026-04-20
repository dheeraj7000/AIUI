# Project Guidelines

## Design System

This project uses AIUI for design management.
See `.aiui/design-memory.md` for the active design system — tokens, components, and rules.
Always follow the design rules defined there before building any UI.

## Scope (post-2026-04 cleanup)

AIUI is a solo-dev tool. The following have been intentionally **removed** from
the main branch — if you need to reference them, see the `v2/full-features`
branch:

- Multi-tenant organizations, invitations, and member roles
- Tags + resource tagging system
- Pack registry / marketplace
- Audit logs + per-tier usage metering (`usage_events`, `credit_ledger`)
- API key rotation
- Tool aliases (`audit` / `polish` / `critique` / `typeset` / ...)
- Anti-pattern heuristics + persona critique
- Figma import pipeline

When adding features, default to the solo-dev scope. Do not re-introduce
multi-tenant, RBAC, or metering machinery without an explicit product decision.

## Local MCP Config

The shipped `.mcp.json` only registers the `aiui` server. If you want extra
local servers (e.g. `spoq`), copy `.mcp.local.json.example` to
`.mcp.local.json` — it is gitignored.

## Git Operations

- Repository maintainer handles all git operations.
- Agents should not create commits.
