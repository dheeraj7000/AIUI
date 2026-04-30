# AIUI benchmark

A reproducible test of whether AIUI actually moves the needle on AI-generated
UI quality.

The hypothesis: when an AI agent (Claude Code, Cursor, etc.) is connected to
the AIUI MCP server, the UI code it generates should be measurably more
token-compliant, more accessible, and more visually consistent than the same
agent generating the same task without AIUI.

## How it works

1. **Tasks** (`tasks/*.md`) — natural-language prompts describing a UI
   component to build (pricing card, login form, settings panel, …).
2. **Runs** (`runs/{with-aiui,without-aiui}/{task-id}.tsx`) — the code your
   agent produces for each task, dropped here by hand or by a harness script.
3. **Metrics** (`lib/metrics.ts`) — analyses each generated file:
   - unique colors, fonts, spacing values, radii used
   - hardcoded `#hex` / `rgb()` / `oklch()` literal count
   - Tailwind arbitrary-value `[...]` count (the bypass signal)
   - missing alt / aria / heading-order issues
   - token-compliance score (0–100)
4. **Compare** (`lib/compare.ts`) — diffs the two runs into a markdown report.

## Running the benchmark

### One-off (manual)

```bash
# 1. For each task, generate code in your AI editor twice:
#    - First with AIUI MCP connected, save to bench/runs/with-aiui/<task>.tsx
#    - Then disable AIUI MCP, save to bench/runs/without-aiui/<task>.tsx
#
# 2. Run the comparison:
pnpm --filter @aiui/bench compare

# Output: bench/runs/REPORT.md
```

### Recommended workflow

For each of the 3 starter tasks (`tasks/01-*`, `02-*`, `03-*`):

1. Open Claude Code in a fresh project with AIUI MCP enabled.
2. Paste the task prompt.
3. Save the result to `bench/runs/with-aiui/<task-id>.tsx`.
4. Disable AIUI MCP (or use a clean project).
5. Paste the same prompt.
6. Save to `bench/runs/without-aiui/<task-id>.tsx`.

When all 6 files exist, run `pnpm --filter @aiui/bench compare`.

## Tasks

- `01-pricing-card.md` — a 3-tier pricing component
- `02-login-form.md` — a sign-in form with validation states
- `03-settings-panel.md` — a tabbed settings page

## What "good" looks like

We expect AIUI runs to:

- Use **fewer unique colors** (≤ tokens defined; no hardcoded hex)
- Use **fewer unique font sizes** (consistent with type scale)
- Have **zero arbitrary-value Tailwind classes** for tokenized properties
- Score **higher on the token-compliance metric** (target: 85+ vs ~50 baseline)
- Have **fewer or equal a11y violations**

If AIUI runs don't beat the baseline by a meaningful margin, the product
isn't doing its job — that's the signal to revisit the wedge.
