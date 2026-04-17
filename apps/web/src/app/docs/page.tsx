import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';
import {
  Palette,
  Layers,
  Shield,
  Plug,
  Eye,
  RefreshCw,
  Terminal,
  ArrowRight,
  Check,
  X,
  TrendingUp,
  Users,
  Zap,
  Database,
  FileCode,
  ChevronRight,
  BarChart3,
  Layout,
  Monitor,
  Hash,
  Brain,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation - AIUI | The Design Control Layer for AI Coding',
  description:
    'AIUI is the design control layer for AI coding assistants. Learn how Design Memory, MCP integration, and compliance validation ensure every AI-generated component matches your brand. Market analysis, architecture, and technical deep-dive.',
};

const sidebarSections = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'market-opportunity', label: 'Market Opportunity' },
  { id: 'design-memory', label: 'Design Memory' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'how-aiui-works', label: 'How It Works' },
  { id: 'key-features', label: 'Key Features' },
  { id: 'competitive-landscape', label: 'Competitive Landscape' },
  { id: 'supported-tools', label: 'Supported Tools' },
  { id: 'getting-started', label: 'Getting Started' },
];

export default function DocsPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <LandingNav />

      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-violet-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Documentation &amp; Technical Deep Dive
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-display">
            <span className="text-white">The Design Control Layer</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              for AI Coding Assistants
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            AIUI bridges the gap between design systems and AI code generation. Design Memory
            ensures every AI-generated component matches your brand — across every IDE, every
            session, every developer.
          </p>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <QuickStat value="46%" label="of new code is AI-generated" />
            <QuickStat value="$12.8B" label="AI coding tools market (2026)" />
            <QuickStat value="73%" label="of teams use AI tools daily" />
            <QuickStat value="41%" label="increase in code churn" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Main Layout: Sidebar + Content */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8 lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[260px_1fr] xl:gap-16">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <nav className="sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                On this page
              </h2>
              <ul className="space-y-0.5">
                {sidebarSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-zinc-800 pt-6">
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-400"
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-24">
            {/* ============================================================ */}
            {/* SECTION 1: THE PROBLEM */}
            {/* ============================================================ */}
            <section id="the-problem" className="scroll-mt-24">
              <SectionBadge label="The Problem" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                AI is writing your UI.{' '}
                <span className="text-zinc-500">
                  But it has no idea what your brand looks like.
                </span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-3xl">
                AI coding assistants generate entire components in seconds. But without design
                system awareness, every prompt produces a different visual result — inconsistent
                colors, mismatched typography, arbitrary spacing. The more your team uses AI, the
                faster your UI drifts from your brand.
              </p>

              {/* Problem stats */}
              <div className="grid gap-4 sm:grid-cols-3 mb-10">
                <StatCard
                  value="2.66×"
                  label="more formatting issues in AI-generated code vs human-written"
                  source="CodeRabbit 2026"
                />
                <StatCard
                  value="63%"
                  label="of developers spent more time debugging AI code than writing it themselves"
                  source="Developer Survey 2026"
                />
                <StatCard
                  value="4×"
                  label="increase in code duplication across AI-assisted codebases"
                  source="GitClear Analysis"
                />
              </div>

              {/* Problem cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <ProblemCard
                  icon={<Palette className="h-5 w-5 text-red-400" />}
                  title="Inconsistent output every time"
                  description="AI tools pick different colors, fonts, and spacing with every prompt. A button generated in one session looks completely different from the next. There's no visual continuity."
                />
                <ProblemCard
                  icon={<Shield className="h-5 w-5 text-red-400" />}
                  title="No design system enforcement"
                  description="Designers spend months building token systems and component libraries. AI coding tools have zero access to these systems during code generation. The work is invisible to AI."
                />
                <ProblemCard
                  icon={<RefreshCw className="h-5 w-5 text-red-400" />}
                  title="Rework destroys the speed advantage"
                  description="Teams spend hours adjusting AI output to match brand guidelines. The entire productivity gain from AI-assisted coding is consumed by manual design cleanup."
                />
                <ProblemCard
                  icon={<TrendingUp className="h-5 w-5 text-red-400" />}
                  title="Brand drift accelerates at scale"
                  description="As more developers adopt AI, the inconsistency compounds. Each developer's AI generates slightly different UI. Maintaining visual coherence across a team becomes impossible."
                />
              </div>

              {/* Before/After comparison */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  The same prompt. Two different results.
                </h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-red-500/30 bg-red-950/10 p-1">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <X className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Without AIUI</span>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                      <pre>{`<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Submit
</button>

// Next prompt, same project:
<button className="bg-indigo-600 text-sm px-3 py-1.5 rounded-md">
  Submit
</button>

// Third prompt:
<button className="bg-sky-500 font-medium px-6 py-3 rounded-xl">
  Submit
</button>`}</pre>
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/10 p-1">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Check className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-400">With AIUI</span>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                      <pre>{`// Every prompt, every session, every developer:
<button className="bg-[color.primary] text-white
  px-[spacing.md] py-[spacing.sm]
  rounded-[radius.md] font-[font.body]
  hover:bg-[color.primary-hover]">
  Submit
</button>

// Tokens resolve to your design system:
// color.primary → #3B82F6
// spacing.md → 16px, spacing.sm → 8px
// radius.md → 8px, font.body → Inter`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 2: MARKET OPPORTUNITY */}
            {/* ============================================================ */}
            <section id="market-opportunity" className="scroll-mt-24">
              <SectionBadge label="Market Opportunity" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                A{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                  $12.8 billion
                </span>{' '}
                market with no design guardrails.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
                AI coding tools are the fastest-growing segment in developer tooling. Every major
                platform is investing billions. But none of them solve the design consistency
                problem. AIUI is the missing infrastructure layer.
              </p>

              {/* TAM SAM SOM */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 mb-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-6">
                  Market Sizing
                </h3>
                <div className="grid gap-6 sm:grid-cols-3">
                  <MarketTier
                    tier="TAM"
                    label="Total Addressable Market"
                    value="$12.8B"
                    description="AI coding tools market (2026). Every team using AI assistants needs design consistency."
                    color="indigo"
                  />
                  <MarketTier
                    tier="SAM"
                    label="Serviceable Addressable Market"
                    value="$2.1B"
                    description="Teams with design systems actively using AI coding assistants — the direct AIUI audience."
                    color="violet"
                  />
                  <MarketTier
                    tier="SOM"
                    label="Serviceable Obtainable Market"
                    value="$15–50M"
                    description="Year 1–3 target: 0.5–1% of 500K+ organizations using Copilot, Cursor, or Claude Code."
                    color="white"
                  />
                </div>
              </div>

              {/* Market growth signals */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SignalCard
                  icon={<Users className="h-5 w-5" />}
                  value="20M+"
                  label="GitHub Copilot users"
                  detail="1.3M paid subscribers, 90% of Fortune 100"
                />
                <SignalCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  value="$29.3B"
                  label="Cursor valuation"
                  detail="From $0 to $2B+ ARR in under 2 years"
                />
                <SignalCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  value="42.3%"
                  label="CAGR through 2033"
                  detail="AI in software development growing to $15.7B"
                />
                <SignalCard
                  icon={<Zap className="h-5 w-5" />}
                  value="95%"
                  label="of developers use AI weekly"
                  detail="Up from 41% in early 2025"
                />
              </div>

              {/* Why now */}
              <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="text-base font-semibold text-white mb-3">Why now?</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <WhyNowItem text="MCP adoption exploded — 10,000+ servers in 6 months. The protocol layer is ready." />
                  <WhyNowItem text="Specify (closest token competitor) shut down Nov 2024. The market gap is open." />
                  <WhyNowItem text="Figma launched their MCP server — validating the design + AI integration thesis." />
                  <WhyNowItem text="EU AI Act enforcement in 2026 requires governance and audit trails for AI output." />
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 3: DESIGN MEMORY */}
            {/* ============================================================ */}
            <section id="design-memory" className="scroll-mt-24">
              <SectionBadge label="Core Innovation" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Design Memory:{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                  persistent context for AI
                </span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
                Design Memory is AIUI&apos;s core innovation. It&apos;s a layered, persistent
                context system that gives AI coding assistants complete awareness of your design
                system — not just in one session, but across every session, every developer, every
                IDE.
              </p>

              {/* Layered architecture visual */}
              <div className="mb-12">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Four layers. One source of truth.
                </h3>
                <div className="relative space-y-3">
                  {/* Layer 4 - Persistence */}
                  <MemoryLayer
                    layer={4}
                    title="Persistence Layer"
                    subtitle="Cross-session memory"
                    color="indigo"
                    items={[
                      'Hash-based staleness detection — knows when tokens have changed',
                      'Auto-sync from database via MCP — always up to date',
                      'Version-tracked .aiui/design-memory.md persists in your repo',
                      'AI agents warned automatically when design memory is stale',
                    ]}
                    icon={<Database className="h-5 w-5" />}
                  />

                  {/* Layer 3 - Enforcement */}
                  <MemoryLayer
                    layer={3}
                    title="Enforcement Layer"
                    subtitle="Real-time compliance validation"
                    color="violet"
                    items={[
                      '8 token categories validated: color, font, spacing, radius, font-size, z-index, opacity, border-width',
                      '6 accessibility checks: img alt, button labels, form labels, heading order, ARIA, WCAG AA',
                      'Compliance score (0–100) with detailed violation reports',
                      'Auto-fix violations with fix_compliance_issues tool',
                    ]}
                    icon={<Shield className="h-5 w-5" />}
                  />

                  {/* Layer 2 - Structure */}
                  <MemoryLayer
                    layer={2}
                    title="Structure Layer"
                    subtitle="Component recipes & patterns"
                    color="violet"
                    items={[
                      '57+ component recipes with full code templates',
                      'Props schemas defining every configurable parameter',
                      'AI usage rules — exactly when and how to use each component',
                      'Framework-specific output (React, Next.js, Tailwind, CSS)',
                    ]}
                    icon={<Layout className="h-5 w-5" />}
                  />

                  {/* Layer 1 - Foundation */}
                  <MemoryLayer
                    layer={1}
                    title="Foundation Layer"
                    subtitle="Design tokens & primitives"
                    color="amber"
                    items={[
                      'Colors, typography, spacing, shadows, border radii, elevation',
                      'Import from Figma, Tailwind configs, or CSS variables',
                      'Export as Tailwind, CSS custom properties, or JSON',
                      'Instant propagation — change once, applies everywhere',
                    ]}
                    icon={<Palette className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Live design memory example */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono ml-2">
                    .aiui/design-memory.md
                  </span>
                  <span className="ml-auto text-xs text-indigo-400/60 font-mono">auto-synced</span>
                </div>
                <div className="p-4 sm:p-6 font-mono text-xs text-zinc-400 overflow-x-auto">
                  <pre className="leading-relaxed">{`# Design Memory — my-saas-app
<!-- Auto-synced from AIUI on 2026-04-09 -->
<!-- Hash: a7f3c2d — tokens changed? re-sync automatically -->

**Style Pack:** SaaS Clean
**Framework:** nextjs-tailwind
**Components:** 12 selected  |  **Tokens:** 31 active

## Design Tokens

### Color
| Token              | Value     |
|---|---|
| color.primary      | #3B82F6   |  ← AI uses THIS, not random blues
| color.primary-hover | #2563EB  |
| color.background   | #FFFFFF   |
| color.text-primary | #111827   |

### Spacing
| Token       | Value |
|---|---|
| spacing.sm  | 8px   |  ← Consistent padding everywhere
| spacing.md  | 16px  |
| spacing.lg  | 24px  |

## Design Rules
1. Use ONLY these tokens — never hardcode values
2. Call validate_ui_output after generating UI
3. Match the framework target — nextjs-tailwind`}</pre>
                </div>
              </div>

              {/* What makes it different */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <DifferentiatorCard
                  icon={<Hash className="h-5 w-5 text-indigo-400" />}
                  title="Hash-Versioned"
                  description="Every sync computes a token hash. AI agents detect drift automatically — no stale designs, ever."
                />
                <DifferentiatorCard
                  icon={<RefreshCw className="h-5 w-5 text-violet-400" />}
                  title="Live-Synced"
                  description="Change a token in the dashboard, call sync, and every AI session picks up the change immediately."
                />
                <DifferentiatorCard
                  icon={<Brain className="h-5 w-5 text-violet-400" />}
                  title="AI-Native"
                  description="Not a static file — a protocol-aware context layer that AI agents read, validate against, and enforce."
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 4: ARCHITECTURE */}
            {/* ============================================================ */}
            <section id="architecture" className="scroll-mt-24">
              <SectionBadge label="Architecture" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Protocol-level integration via MCP
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
                AIUI uses the Model Context Protocol — the industry standard adopted by Anthropic,
                OpenAI, Google, and Microsoft. One integration serves every MCP-compatible IDE. No
                per-tool plugins. No maintenance per editor.
              </p>

              {/* Architecture flow */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 mb-10">
                <div className="flex flex-col lg:flex-row items-stretch gap-4">
                  <ArchBlock
                    icon={<Palette className="h-6 w-6 text-amber-400" />}
                    title="Design System"
                    items={['Tokens', 'Recipes', 'Rules']}
                    color="amber"
                  />
                  <ArchArrow />
                  <ArchBlock
                    icon={<Database className="h-6 w-6 text-indigo-400" />}
                    title="AIUI Platform"
                    items={['Dashboard', 'MCP Server', 'Validator']}
                    color="indigo"
                  />
                  <ArchArrow />
                  <ArchBlock
                    icon={<Plug className="h-6 w-6 text-violet-400" />}
                    title="MCP Protocol"
                    items={['18 tools', 'HTTP transport', 'Streaming']}
                    color="violet"
                  />
                  <ArchArrow />
                  <ArchBlock
                    icon={<Terminal className="h-6 w-6 text-violet-400" />}
                    title="AI IDE"
                    items={['Claude Code', 'Cursor', 'Windsurf', 'VS Code']}
                    color="violet"
                  />
                  <ArchArrow />
                  <ArchBlock
                    icon={<Check className="h-6 w-6 text-indigo-400" />}
                    title="Consistent UI"
                    items={['On-brand', 'Validated', 'Accessible']}
                    color="indigo"
                  />
                </div>
              </div>

              {/* MCP Tools */}
              <h3 className="text-lg font-semibold text-white mb-4">12 MCP Tools</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Every tool is available to any MCP-compatible AI assistant. The AI calls these
                automatically during code generation.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ToolMini name="get_project_context" desc="Load full design profile" />
                <ToolMini name="sync_design_memory" desc="Generate .aiui/ files" />
                <ToolMini name="get_theme_tokens" desc="Export tokens (Tailwind/CSS/JSON)" />
                <ToolMini name="list_components" desc="Browse 57+ recipes" />
                <ToolMini name="get_component_recipe" desc="Get template + props + rules" />
                <ToolMini name="validate_ui_output" desc="Check design compliance" />
                <ToolMini name="fix_compliance_issues" desc="Auto-fix violations" />
                <ToolMini name="create_style_pack" desc="Create new design system" />
                <ToolMini name="apply_style_pack" desc="Assign pack to project" />
                <ToolMini name="update_tokens" desc="Modify token values" />
                <ToolMini name="resolve_tag" desc="Map tags to resources" />
                <ToolMini name="get_asset_manifest" desc="Get assets with CDN URLs" />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 5: HOW AIUI WORKS */}
            {/* ============================================================ */}
            <section id="how-aiui-works" className="scroll-mt-24">
              <SectionBadge label="How It Works" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                From design system to consistent AI output in 4 steps
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
                AIUI sits between your design system and your AI coding tools. Setup takes under 60
                seconds. Once connected, every AI-generated component follows your design tokens
                automatically.
              </p>

              <div className="space-y-4">
                <StepCard
                  number="1"
                  title="Define your design tokens"
                  description="Set your colors, typography scale, spacing units, shadows, and border radii in the AIUI dashboard. Import from Figma, Tailwind configs, or start with a pre-built style pack like 'SaaS Clean' or 'Dashboard Pro'."
                  icon={<Palette className="h-5 w-5" />}
                  code="// Import from Tailwind config, Figma, or define manually
// 14 style packs available — or build your own"
                />
                <StepCard
                  number="2"
                  title="Create component recipes"
                  description="Define approved component patterns with specific token usage. Each recipe includes a full code template, props schema, and AI usage rules — so the AI knows not just what to build, but exactly how."
                  icon={<FileCode className="h-5 w-5" />}
                  code={`// Recipe: Primary Button
// Tokens: color.primary, spacing.md, radius.md
// Props: variant, size, disabled
// Rule: "Always use hover:bg-[color.primary-hover]"`}
                />
                <StepCard
                  number="3"
                  title="Connect via MCP"
                  description="Add one configuration block to your AI tool. AIUI serves your design system over the Model Context Protocol. The AI reads your tokens and recipes before generating any code."
                  icon={<Plug className="h-5 w-5" />}
                  code="claude mcp add aiui -- npx @anthropic-ai/aiui-mcp@latest"
                />
                <StepCard
                  number="4"
                  title="Generate and validate"
                  description="When your AI assistant builds a component, it pulls your design memory automatically. After generation, the validate tool checks compliance across 8 token categories and 6 accessibility standards."
                  icon={<Shield className="h-5 w-5" />}
                  code={`// validate_ui_output returns:
// { score: 97, violations: 1,
//   detail: "color.warning used instead of color.error" }`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 6: KEY FEATURES */}
            {/* ============================================================ */}
            <section id="key-features" className="scroll-mt-24">
              <SectionBadge label="Key Features" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Everything you need for AI-consistent design
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                <FeatureCard
                  icon={<Palette className="h-6 w-6" />}
                  title="Design Token Management"
                  description="Centralize all design primitives — colors, typography, spacing, shadows, radii, elevation. Changes propagate instantly to every connected AI tool."
                  color="pink"
                  stat="360+ tokens across 14 packs"
                />
                <FeatureCard
                  icon={<Layout className="h-6 w-6" />}
                  title="Component Recipes"
                  description="Full component patterns with code templates, props schemas, and AI-specific usage rules. AI assistants follow recipes exactly."
                  color="blue"
                  stat="57+ recipes with code templates"
                />
                <FeatureCard
                  icon={<Layers className="h-6 w-6" />}
                  title="Style Packs"
                  description="Pre-built design systems ready to activate. SaaS Clean, Dashboard Pro, Fintech Light, shadcn/ui Essentials, MagicUI Effects, and more."
                  color="violet"
                  stat="14 packs, fully customizable"
                />
                <FeatureCard
                  icon={<Shield className="h-6 w-6" />}
                  title="Design Validation"
                  description="Real-time compliance checking across 8 token categories and 6 accessibility standards. Catch violations before they ship."
                  color="green"
                  stat="0–100 compliance scoring"
                />
                <FeatureCard
                  icon={<Monitor className="h-6 w-6" />}
                  title="Multi-IDE Support"
                  description="One design system powers consistent output across Claude Code, Cursor, Windsurf, and VS Code — through a single MCP integration."
                  color="amber"
                  stat="4 IDEs, 1 config"
                />
                <FeatureCard
                  icon={<Eye className="h-6 w-6" />}
                  title="Visual Studio"
                  description="Real-time design editor and previewer. See how your tokens look together before connecting them to AI tools. Live component previews."
                  color="violet"
                  stat="Real-time preview engine"
                />
              </div>

              {/* Additional capabilities */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Import & Export</h3>
                  <ul className="space-y-2">
                    <CapabilityItem text="Import tokens from Figma Variables" />
                    <CapabilityItem text="Import from Tailwind CSS configs" />
                    <CapabilityItem text="Import from CSS custom properties" />
                    <CapabilityItem text="Export as Tailwind, CSS, or JSON" />
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Team & Governance</h3>
                  <ul className="space-y-2">
                    <CapabilityItem text="Organization-scoped projects" />
                    <CapabilityItem text="API key management per project" />
                    <CapabilityItem text="Usage tracking and tier limits" />
                    <CapabilityItem text="Design profile compilation" />
                  </ul>
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 7: COMPETITIVE LANDSCAPE */}
            {/* ============================================================ */}
            <section id="competitive-landscape" className="scroll-mt-24">
              <SectionBadge label="Competitive Landscape" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                The gap no one else fills
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
                Design system tools manage tokens for human workflows. AI coding tools generate code
                without design awareness. AIUI is the only product that connects both — enforcing
                design compliance at the point of AI code generation.
              </p>

              {/* Comparison matrix */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mb-10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                          Capability
                        </th>
                        <th className="text-center px-4 py-3 font-semibold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                          AIUI
                        </th>
                        <th className="text-center px-4 py-3 text-zinc-500 font-medium">
                          Tokens Studio
                        </th>
                        <th className="text-center px-4 py-3 text-zinc-500 font-medium">
                          Supernova
                        </th>
                        <th className="text-center px-4 py-3 text-zinc-500 font-medium">
                          Figma MCP
                        </th>
                        <th className="text-center px-4 py-3 text-zinc-500 font-medium">
                          zeroheight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      <CompRow
                        feature="Design token management"
                        aiui={true}
                        ts={true}
                        sn={true}
                        figma="partial"
                        zh={true}
                      />
                      <CompRow
                        feature="MCP integration"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={true}
                        zh={false}
                      />
                      <CompRow
                        feature="AI compliance validation"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={false}
                        zh={false}
                      />
                      <CompRow
                        feature="Auto-fix violations"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={false}
                        zh={false}
                      />
                      <CompRow
                        feature="Persistent design memory"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={false}
                        zh={false}
                      />
                      <CompRow
                        feature="Component recipes with AI rules"
                        aiui={true}
                        ts={false}
                        sn="partial"
                        figma={false}
                        zh={false}
                      />
                      <CompRow
                        feature="Multi-IDE from single config"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={true}
                        zh={false}
                      />
                      <CompRow
                        feature="Real-time token sync to AI"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma="partial"
                        zh={false}
                      />
                      <CompRow
                        feature="Accessibility validation"
                        aiui={true}
                        ts={false}
                        sn={false}
                        figma={false}
                        zh={false}
                      />
                      <CompRow
                        feature="Style pack marketplace"
                        aiui={true}
                        ts={false}
                        sn="partial"
                        figma={false}
                        zh={false}
                      />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Competitor funding context */}
              <h3 className="text-lg font-semibold text-white mb-4">Funding context</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Design system tooling companies routinely raise $10–25M at Series A. AIUI operates
                in the same space with a more focused positioning and dramatically lower capital
                requirements.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FundingCard
                  name="Supernova"
                  raised="$24.8M"
                  detail="$9.2M Series A (2025), Y Combinator"
                />
                <FundingCard
                  name="Knapsack"
                  raised="$18.5M"
                  detail="Builders VC, Gradient Ventures"
                />
                <FundingCard name="zeroheight" raised="$10.4M" detail="$10M Series A (2021)" />
                <FundingCard name="Specify" raised="€4M" detail="Shut down Nov 2024" highlight />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 8: SUPPORTED TOOLS */}
            {/* ============================================================ */}
            <section id="supported-tools" className="scroll-mt-24">
              <SectionBadge label="Supported Tools" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Works with every major AI coding environment
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-3xl">
                AIUI connects through the Model Context Protocol. Any tool that supports MCP can use
                AIUI as a design context source. One configuration. Every IDE.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <IDECard
                  name="Claude Code"
                  tagline="Anthropic's CLI for Claude"
                  description="Connect with a single terminal command. Full MCP support with streaming. Design memory loads automatically in every session."
                  setup="Terminal"
                  code="claude mcp add aiui -- npx @anthropic-ai/aiui-mcp@latest"
                />
                <IDECard
                  name="Cursor"
                  tagline="AI-first code editor"
                  description="Add AIUI to your .cursor/mcp.json for project-level design enforcement. Tokens load automatically in every Composer session."
                  setup=".cursor/mcp.json"
                  code={`{
  "mcpServers": {
    "aiui": {
      "command": "npx",
      "args": ["@anthropic-ai/aiui-mcp@latest"]
    }
  }
}`}
                />
                <IDECard
                  name="Windsurf"
                  tagline="Codeium's AI IDE"
                  description="Configure via the MCP settings panel. Design tokens load automatically in every Cascade session. Full compliance validation available."
                  setup="MCP Settings"
                  code="Settings → MCP → Add Server → aiui"
                />
                <IDECard
                  name="VS Code + Copilot"
                  tagline="GitHub Copilot in VS Code"
                  description="Add AIUI to your VS Code settings.json under mcp.servers. Works with Copilot Chat for design-aware code generation."
                  setup="settings.json"
                  code={`"mcp": {
  "servers": {
    "aiui": {
      "command": "npx",
      "args": ["@anthropic-ai/aiui-mcp@latest"]
    }
  }
}`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 9: GETTING STARTED */}
            {/* ============================================================ */}
            <section id="getting-started" className="scroll-mt-24">
              <SectionBadge label="Getting Started" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Start shipping consistent UI in 60 seconds
              </h2>

              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-8 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-2 items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Free during beta. No credit card required.
                    </h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      Create an account, pick a style pack (or import your own tokens), and paste
                      one config block into your AI tool. Every component your AI generates will
                      match your design system from the first prompt.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-400"
                      >
                        Create Free Account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/style-packs"
                        className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-semibold text-zinc-200 shadow-sm transition-colors hover:bg-zinc-800"
                      >
                        Browse Style Packs
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-mono text-xs text-zinc-400">
                    <div className="flex items-center gap-2 mb-3 text-zinc-500">
                      <Terminal className="h-4 w-4" />
                      <span>Quick start</span>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="text-zinc-500">$</span>{' '}
                        <span className="text-indigo-400">claude mcp add</span> aiui
                      </p>
                      <p className="text-zinc-600">✓ Connected to AIUI</p>
                      <p className="text-zinc-600">✓ Design memory loaded (31 tokens)</p>
                      <p className="text-zinc-600">✓ 57 component recipes available</p>
                      <p className="mt-3">
                        <span className="text-zinc-500">$</span>{' '}
                        <span className="text-indigo-400">claude</span>{' '}
                        <span className="text-zinc-300">
                          &quot;Build a pricing page for my SaaS&quot;
                        </span>
                      </p>
                      <p className="text-zinc-600">
                        → Using color.primary #3B82F6, font.heading Inter...
                      </p>
                      <p className="text-zinc-600">→ Compliance score: 100/100 ✓</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ===================================================================== */
/* Sub-components                                                         */
/* ===================================================================== */

function SectionBadge({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">{label}</p>
  );
}

function QuickStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function StatCard({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{label}</p>
      <p className="text-xs text-zinc-600 mt-2">{source}</p>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function MarketTier({
  tier,
  label,
  value,
  description,
  color,
}: {
  tier: string;
  label: string;
  value: string;
  description: string;
  color: 'indigo' | 'violet' | 'white';
}) {
  const colorMap = {
    indigo: 'text-indigo-400 border-indigo-500/30',
    violet: 'text-violet-400 border-violet-500/30',
    white: 'text-white border-zinc-600',
  };
  return (
    <div className={`rounded-xl border ${colorMap[color].split(' ')[1]} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">{tier}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(' ')[0]} mb-1`}>{value}</p>
      <p className="text-xs text-zinc-500 mb-3">{label}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function SignalCard({
  icon,
  value,
  label,
  detail,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="text-zinc-500 mb-2">{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-300 font-medium">{label}</p>
      <p className="text-xs text-zinc-500 mt-1">{detail}</p>
    </div>
  );
}

function WhyNowItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
      <p className="text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function MemoryLayer({
  layer,
  title,
  subtitle,
  color,
  items,
  icon,
}: {
  layer: number;
  title: string;
  subtitle: string;
  color: 'indigo' | 'violet' | 'amber';
  items: string[];
  icon: React.ReactNode;
}) {
  const borderColors = {
    indigo: 'border-indigo-500/40',
    violet: 'border-violet-500/40',
    amber: 'border-amber-500/40',
  };
  const bgColors = {
    indigo: 'bg-indigo-500/5',
    violet: 'bg-violet-500/5',
    amber: 'bg-amber-500/5',
  };
  const textColors = {
    indigo: 'text-indigo-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  };
  const badgeBg = {
    indigo: 'bg-indigo-500/20',
    violet: 'bg-violet-500/20',
    amber: 'bg-amber-500/20',
  };

  return (
    <div className={`rounded-xl border ${borderColors[color]} ${bgColors[color]} p-5`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${badgeBg[color]} ${textColors[color]}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-xs font-mono ${textColors[color]}`}>Layer {layer}</span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className={`text-xs ${textColors[color]} mb-3`}>{subtitle}</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-zinc-400">
                <span className={`${textColors[color]} mt-1 text-xs`}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DifferentiatorCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ArchBlock({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: 'amber' | 'indigo' | 'violet';
}) {
  const borderColors = {
    amber: 'border-amber-500/30',
    indigo: 'border-indigo-500/30',
    violet: 'border-violet-500/30',
  };
  return (
    <div
      className={`flex-1 rounded-xl border ${borderColors[color]} bg-zinc-900/50 p-4 text-center min-w-[120px]`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-zinc-500">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchArrow() {
  return (
    <div className="flex items-center justify-center lg:py-0 py-1">
      <ArrowRight className="h-5 w-5 text-zinc-600 lg:rotate-0 rotate-90" />
    </div>
  );
}

function ToolMini({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <p className="text-xs font-mono text-indigo-400 mb-0.5">{name}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
  code,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  code: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-zinc-500">{icon}</span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mb-3">{description}</p>
          <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-3">
            <pre className="text-xs font-mono text-zinc-500 whitespace-pre-wrap">{code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  stat,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'pink' | 'blue' | 'violet' | 'green' | 'amber';
  stat: string;
}) {
  const colorMap = {
    pink: 'bg-pink-500/10 text-pink-400',
    blue: 'bg-blue-500/10 text-blue-400',
    violet: 'bg-violet-500/10 text-violet-400',
    green: 'bg-green-500/10 text-green-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className={`inline-flex rounded-lg p-2.5 ${colorMap[color]} mb-3`}>{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">{description}</p>
      <p className="text-xs text-zinc-600 font-medium">{stat}</p>
    </div>
  );
}

function CapabilityItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
      <span className="text-sm text-zinc-400">{text}</span>
    </li>
  );
}

function CompRow({
  feature,
  ts,
  sn,
  figma,
  zh,
}: {
  feature: string;
  aiui?: boolean;
  ts: boolean | string;
  sn: boolean | string;
  figma: boolean | string;
  zh: boolean | string;
}) {
  const renderCheck = (val: boolean | string) => {
    if (val === true) return <Check className="h-4 w-4 text-zinc-400 mx-auto" />;
    if (val === 'partial')
      return <span className="text-xs text-zinc-600 font-medium">Partial</span>;
    return <X className="h-4 w-4 text-zinc-700 mx-auto" />;
  };
  return (
    <tr>
      <td className="px-4 py-2.5 text-zinc-300 text-sm">{feature}</td>
      <td className="px-4 py-2.5 text-center">
        <Check className="h-4 w-4 text-indigo-400 mx-auto" />
      </td>
      <td className="px-4 py-2.5 text-center">{renderCheck(ts)}</td>
      <td className="px-4 py-2.5 text-center">{renderCheck(sn)}</td>
      <td className="px-4 py-2.5 text-center">{renderCheck(figma)}</td>
      <td className="px-4 py-2.5 text-center">{renderCheck(zh)}</td>
    </tr>
  );
}

function FundingCard({
  name,
  raised,
  detail,
  highlight,
}: {
  name: string;
  raised: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-red-500/30 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/30'
      }`}
    >
      <p className="text-sm font-semibold text-white">{name}</p>
      <p
        className={`text-xl font-bold mt-1 ${
          highlight ? 'text-red-400 line-through' : 'text-zinc-300'
        }`}
      >
        {raised}
      </p>
      <p className={`text-xs mt-1 ${highlight ? 'text-red-400/60' : 'text-zinc-500'}`}>{detail}</p>
    </div>
  );
}

function IDECard({
  name,
  tagline,
  description,
  setup,
  code,
}: {
  name: string;
  tagline: string;
  description: string;
  setup: string;
  code: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{name}</h3>
        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
          {setup}
        </span>
      </div>
      <p className="text-xs text-indigo-400/60 mb-2">{tagline}</p>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">{description}</p>
      <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2">
        <pre className="text-xs font-mono text-zinc-500 whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}
