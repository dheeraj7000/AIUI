# Project Guidelines

## Design System

This project uses AIUI for design management.
See `.aiui/design-memory.md` for the active design system — tokens, components, and rules.
Always follow the design rules defined there before building any UI.

## SPOQ Integration

This project uses [SPOQ](https://spoqpaper.com) for multi-agent AI orchestration.

### Common Commands

```bash
# Plan an epic
/epic-planning "Implement feature X"

# Validate epic quality
/epic-validation @spoq/epics/active/feature-x

# Execute with agent swarm
/agent-execution @spoq/epics/active/feature-x

# Execute with agent teams
/team-execution @spoq/epics/active/feature-x

# Validate delivered code
/agent-validation

# Plan a multi-epic program
/epic-planning --map "Program name"
```

### Validation Thresholds

**Epic Validation (10 Metrics):** >= 95 average, >= 90 per metric
**Agent Validation (10 Metrics):** >= 95 average, >= 80 per metric

### Directory Structure

- `spoq/epics/active/` — Epics in progress
- `spoq/epics/complete/` — Archived completed epics
- `spoq/maps/active/` — Maps (multi-epic programs) in progress
- `spoq/maps/complete/` — Archived completed maps
- `.claude/skills/` — SPOQ skill definitions

### MCP Server

The SPOQ MCP server provides 23 tools for epic, map, and task management.
Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "spoq": {
      "command": "spoq",
      "args": ["mcp"]
    }
  }
}
```

### Workflow

1. **Plan** — `/epic-planning` decomposes goals into atomic tasks
2. **Validate** — `/epic-validation` scores against 10 quality metrics
3. **Execute** — `/agent-execution` dispatches parallel agent swarms
4. **Verify** — `/agent-validation` scores delivered code

### Git Operations

- Repository maintainer handles all git operations
- SPOQ agents never create commits
