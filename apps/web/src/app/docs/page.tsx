import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Documentation — AIUI',
  description:
    'How to set up AIUI, connect it to your editor, and let Claude build UI that follows your design system.',
};

/* ------------------------------------------------------------------------- */
/* Data                                                                      */
/* ------------------------------------------------------------------------- */

const sidebarSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick start' },
  { id: 'concepts', label: 'Core concepts' },
  { id: 'mcp-tools', label: 'MCP tools' },
  { id: 'integration', label: 'Integration' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'next-steps', label: 'Next steps' },
];

const quickSteps = [
  {
    n: '01',
    title: 'Create an account.',
    body: 'Sign up and a starter project is provisioned for you — shadcn/ui Essentials tokens, a handful of components, and an empty design profile. No manual setup.',
    action: { href: '/sign-up', label: 'Sign up' },
  },
  {
    n: '02',
    title: 'Pick a style pack.',
    body: 'Browse 14 packs or paste tokens you already have (CSS variables, Tokens Studio, Tailwind config). Everything you select becomes part of your design memory.',
    action: { href: '/style-packs', label: 'Browse packs' },
  },
  {
    n: '03',
    title: 'Connect your editor.',
    body: 'Generate an API key, copy the MCP config into Claude Code, Cursor, Windsurf, or VS Code. From that point on, every UI the AI writes pulls from your tokens.',
    action: { href: '/api-keys', label: 'Get an API key' },
  },
];

const concepts = [
  {
    id: 'design-memory',
    title: 'Design memory',
    description:
      'Two files written to your project root (.aiui/design-memory.md and .aiui/tokens.json). Your AI editor reads them on every message. Add a line to CLAUDE.md and the design system follows every response.',
  },
  {
    id: 'style-packs',
    title: 'Style packs',
    description:
      'Curated sets of tokens — colors, fonts, spacing, radii, shadows, elevation. Switching packs re-compiles the memory; Claude picks up the change on the next message.',
  },
  {
    id: 'component-recipes',
    title: 'Component recipes',
    description:
      'Each recipe is a code template plus a props schema plus a one-paragraph AI usage rule. When Claude needs a button, it fetches the recipe and writes code that respects it.',
  },
  {
    id: 'validation',
    title: 'Validation',
    description:
      'Before shipping, call validate_ui_output. It flags colors, fonts, spacing, radii, and accessibility issues against your token set. fix_compliance_issues auto-rewrites the offenders.',
  },
];

const mcpReadTools: Array<{ name: string; desc: string }> = [
  {
    name: 'get_project_context',
    desc: 'Fetch framework, active pack, components, and token count for a project.',
  },
  { name: 'get_design_memory', desc: 'Return the design memory markdown as a string.' },
  { name: 'check_design_memory', desc: 'Is the local memory still fresh, or is a resync needed?' },
  { name: 'sync_design_memory', desc: 'Write .aiui/design-memory.md and .aiui/tokens.json.' },
  { name: 'list_components', desc: 'Enumerate component recipes, optionally filtered by pack.' },
  {
    name: 'get_component_recipe',
    desc: 'Full code template, schema, and usage rule for one recipe.',
  },
  { name: 'get_theme_tokens', desc: 'Export tokens as Tailwind config, CSS vars, or raw JSON.' },
  { name: 'get_asset_manifest', desc: 'Categorized list of project assets with public URLs.' },
  { name: 'validate_ui_output', desc: 'Check generated code against the project token set.' },
  { name: 'open_design_studio', desc: 'Return a URL to the browser-based configurator.' },
];

const mcpWriteTools: Array<{ name: string; desc: string }> = [
  { name: 'init_project', desc: 'First call on an empty repo — seeds pack, profile, and memory.' },
  { name: 'create_style_pack', desc: 'Define a new pack with tokens inline.' },
  { name: 'apply_style_pack', desc: 'Attach a pack to a project and recompile the memory.' },
  { name: 'update_tokens', desc: 'Add, change, or remove tokens on a pack.' },
  { name: 'fix_compliance_issues', desc: 'Rewrite code to use approved tokens.' },
  { name: 'reset_project_to_starter', desc: 'Discard customizations, reseed the starter pack.' },
  { name: 'undo_last_token_change', desc: 'Revert the most recent token edit.' },
];

const editors: Array<{
  id: string;
  name: string;
  config: string;
  configLang: string;
  configPath: string;
}> = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    config:
      'claude mcp add --transport http aiui https://your-aiui-host/mcp \\\n  --header "Authorization:Bearer YOUR_API_KEY"',
    configLang: 'bash',
    configPath: 'one command',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    config: `{
  "mcpServers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}`,
    configLang: 'json',
    configPath: '.cursor/mcp.json',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    config: `{
  "mcp.servers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}`,
    configLang: 'json',
    configPath: 'settings.json',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    config: `{
  "mcpServers": {
    "aiui": {
      "serverUrl": "https://your-aiui-host/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}`,
    configLang: 'json',
    configPath: 'windsurf config',
  },
];

const troubleshooting: Array<{ q: string; a: string }> = [
  {
    q: 'Claude still ignores my tokens after I connect the MCP server.',
    a: 'Add "See .aiui/design-memory.md for the active design system" to your project\'s CLAUDE.md so Claude loads the memory automatically on every message. Without that line Claude only sees the memory when a tool is explicitly called.',
  },
  {
    q: 'I changed a token but the new value did not appear.',
    a: 'Ask Claude to call sync_design_memory — the local .aiui/ files are snapshots, not live queries. The project detail page shows the staleness status.',
  },
  {
    q: 'validate_ui_output keeps flagging the same color.',
    a: 'The value is not in the approved pack. Either add it as a token (update_tokens) or let Claude call fix_compliance_issues to auto-rewrite the code.',
  },
  {
    q: 'I want to start over.',
    a: 'Call reset_project_to_starter. It discards profile customizations and reseeds the starter pack — the project row and API keys are untouched.',
  },
];

/* ------------------------------------------------------------------------- */
/* Page                                                                      */
/* ------------------------------------------------------------------------- */

export default function DocsPage() {
  return (
    <main className="editorial">
      <LandingNav />

      {/* ----- Hero ----- */}
      <section className="relative">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-20">
          <div className="flex items-baseline gap-6">
            <span className="section-numeral">00</span>
            <span className="eyebrow">Documentation</span>
          </div>

          <hr className="rule mt-8" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

          <h1
            className="display mt-10"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              maxWidth: '18ch',
            }}
          >
            How AIUI <em>works</em>, top to bottom.
          </h1>

          <p className="lede mt-6" style={{ maxWidth: '58ch' }}>
            Five-minute read. Set up your design system, connect your editor, and watch every UI
            your AI generates from here on pull from the same tokens.
          </p>
        </div>
      </section>

      {/* ----- Body: sidebar + content ----- */}
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pb-24">
        <div className="md:grid md:grid-cols-[220px_1fr] md:gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <nav className="sticky top-24">
              <span className="eyebrow">On this page</span>
              <hr
                className="rule mt-3 mb-4"
                style={{ height: 1, border: 0, background: 'var(--rule)' }}
              />
              <ul className="flex flex-col gap-0.5">
                {sidebarSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block py-1.5 text-sm transition-colors"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>

              <hr
                className="rule mt-8 mb-4"
                style={{ height: 1, border: 0, background: 'var(--rule)' }}
              />
              <Link href="/sign-up" className="btn-ink">
                Start free
                <span aria-hidden style={{ fontFamily: 'var(--font-display)' }}>
                  →
                </span>
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex flex-col gap-20 lg:gap-24">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <SectionHeading numeral="01" eyebrow="Overview" title="What AIUI gives you." />
              <p style={bodyCopyStyle}>
                Two things. First, a place to keep your design system — tokens, components, and
                rules — outside of any one codebase or editor. Second, a live bridge into whatever
                AI coding tool you use, so that system is part of every conversation instead of
                something you paste into prompts.
              </p>
              <p style={{ ...bodyCopyStyle, marginTop: '1rem' }}>
                The bridge is the <em>Model Context Protocol</em> — the same extension layer Claude
                Code and Cursor already use for everything else. AIUI ships an MCP server that
                exposes 17 tools Claude can call while it writes UI.
              </p>

              <figure
                className="specimen mt-10"
                style={{ padding: '1.5rem 1.75rem', background: 'var(--paper-sunk)' }}
              >
                <code>
                  <span className="cm-dim">you:</span>{' '}
                  <span style={{ color: 'var(--ink)' }}>&quot;Add a pricing page.&quot;</span>
                  {'\n\n'}
                  <span className="cm-dim">claude (behind the scenes):</span>
                  {'\n'}
                  <span className="cm-dim"> 1. read .aiui/design-memory.md</span>
                  {'\n'}
                  <span className="cm-dim"> 2. call get_component_recipe(pricing)</span>
                  {'\n'}
                  <span className="cm-dim"> 3. write code using your tokens</span>
                  {'\n'}
                  <span className="cm-dim"> 4. call validate_ui_output → 0 violations</span>
                </code>
                <figcaption className="figure-caption" style={{ justifyContent: 'space-between' }}>
                  <span className="fig-id">Fig. 01.1</span>
                  <span className="leader" aria-hidden />
                  <span>What a typical request looks like, end to end.</span>
                </figcaption>
              </figure>
            </section>

            {/* Quick start */}
            <section id="quick-start" className="scroll-mt-24">
              <SectionHeading
                numeral="02"
                eyebrow="Quick start"
                title="Three steps. Under five minutes."
              />
              <ol className="mt-4">
                {quickSteps.map((step, i) => (
                  <li
                    key={step.n}
                    className="grid grid-cols-12 gap-6 py-8 lg:py-10"
                    style={{
                      borderTop: '1px solid var(--rule)',
                      borderBottom:
                        i === quickSteps.length - 1 ? '1px solid var(--rule)' : undefined,
                    }}
                  >
                    <div className="col-span-2 md:col-span-1">
                      <span
                        className="display"
                        style={{
                          fontSize: 'clamp(2rem, 2.75vw, 2.5rem)',
                          lineHeight: 1,
                          color: 'var(--accent)',
                          fontVariantNumeric: 'oldstyle-nums',
                        }}
                      >
                        {step.n}
                      </span>
                    </div>
                    <div className="col-span-10 md:col-span-11">
                      <h3
                        className="display"
                        style={{ fontSize: 'clamp(1.375rem, 1.8vw, 1.625rem)', lineHeight: 1.15 }}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-3" style={{ ...bodyCopyStyle, maxWidth: '62ch' }}>
                        {step.body}
                      </p>
                      <Link
                        href={step.action.href}
                        className="ink-link mt-4 inline-block text-[0.9375rem]"
                      >
                        {step.action.label} →
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Concepts */}
            <section id="concepts" className="scroll-mt-24">
              <SectionHeading
                numeral="03"
                eyebrow="Core concepts"
                title="The four ideas that make the system."
              />
              <div className="grid gap-6 md:grid-cols-2 mt-6">
                {concepts.map((c, i) => (
                  <article
                    key={c.id}
                    style={{
                      background: 'var(--paper-deep)',
                      border: '1px solid var(--rule)',
                      padding: '1.75rem',
                    }}
                  >
                    <span
                      className="eyebrow"
                      style={{ fontSize: '0.6875rem', color: 'var(--accent)' }}
                    >
                      § {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="display mt-3" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>
                      {c.title}
                    </h3>
                    <p className="mt-3" style={{ ...bodyCopyStyle, fontSize: '0.9375rem' }}>
                      {c.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* MCP tools */}
            <section id="mcp-tools" className="scroll-mt-24">
              <SectionHeading
                numeral="04"
                eyebrow="MCP reference"
                title="Seventeen tools, grouped by intent."
              />
              <p style={bodyCopyStyle}>
                Claude calls these automatically. You rarely need to name them — they&rsquo;re here
                so you know what&rsquo;s happening under the hood.
              </p>

              <div className="mt-10">
                <ToolTable caption="Read" tools={mcpReadTools} />
              </div>
              <div className="mt-12">
                <ToolTable caption="Write" tools={mcpWriteTools} />
              </div>

              <p className="caption mt-6" style={{ fontSize: '0.75rem' }}>
                The live catalog is served at <code>/mcp/catalog</code> on your AIUI host.
              </p>
            </section>

            {/* Integration */}
            <section id="integration" className="scroll-mt-24">
              <SectionHeading
                numeral="05"
                eyebrow="Integration"
                title="Drop-in config for four editors."
              />
              <p style={bodyCopyStyle}>
                Grab an API key from{' '}
                <Link href="/api-keys" className="ink-link">
                  /api-keys
                </Link>
                , then paste the relevant snippet into your editor. AIUI works over HTTP, so there
                is no package to install.
              </p>

              <div className="mt-8 flex flex-col gap-8">
                {editors.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      border: '1px solid var(--rule)',
                      background: 'var(--paper-deep)',
                    }}
                  >
                    <header
                      className="flex items-baseline justify-between px-5 py-3"
                      style={{ borderBottom: '1px solid var(--rule)' }}
                    >
                      <span className="display" style={{ fontSize: '1.125rem', lineHeight: 1 }}>
                        {e.name}
                      </span>
                      <span
                        className="text-[0.6875rem]"
                        style={{
                          fontFamily: 'var(--font-mono-editorial)',
                          color: 'var(--ink-muted)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {e.configPath.toUpperCase()}
                      </span>
                    </header>
                    <pre
                      className="specimen"
                      style={{
                        padding: '1.25rem 1.5rem',
                        fontSize: '0.8125rem',
                        border: 0,
                        margin: 0,
                      }}
                    >
                      <code style={{ color: 'var(--ink)' }}>{e.config}</code>
                    </pre>
                  </div>
                ))}
              </div>

              <div
                className="mt-10 p-6"
                style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
              >
                <span className="eyebrow" style={{ color: 'var(--accent)' }}>
                  Required for every editor
                </span>
                <p className="mt-3" style={{ ...bodyCopyStyle, fontSize: '0.9375rem' }}>
                  Add this line to your project&rsquo;s <code>CLAUDE.md</code> so the design memory
                  gets loaded on every message, not just when a tool is explicitly invoked:
                </p>
                <pre
                  className="specimen mt-4"
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    background: 'var(--paper-sunk)',
                  }}
                >
                  <code>See .aiui/design-memory.md for the active design system.</code>
                </pre>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="scroll-mt-24">
              <SectionHeading
                numeral="06"
                eyebrow="Troubleshooting"
                title="Things that come up, and the fixes."
              />
              <dl className="mt-4">
                {troubleshooting.map((t, i) => (
                  <div
                    key={i}
                    className="py-6"
                    style={{
                      borderTop: '1px solid var(--rule)',
                      borderBottom:
                        i === troubleshooting.length - 1 ? '1px solid var(--rule)' : undefined,
                    }}
                  >
                    <dt
                      className="display"
                      style={{ fontSize: '1.125rem', lineHeight: 1.3, fontWeight: 500 }}
                    >
                      {t.q}
                    </dt>
                    <dd className="mt-3" style={{ ...bodyCopyStyle, fontSize: '0.9375rem' }}>
                      {t.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Next steps */}
            <section id="next-steps" className="scroll-mt-24">
              <SectionHeading
                numeral="07"
                eyebrow="Next steps"
                title="Where to go once everything is wired."
              />
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <NextStepCard
                  href="/dashboard"
                  eyebrow="Build"
                  title="Open your dashboard"
                  body="Create a project, assign a pack, pick components."
                />
                <NextStepCard
                  href="/studio"
                  eyebrow="Explore"
                  title="Try the studio"
                  body="Walk the shape-discovery flow — it ranks packs against your brand intent."
                />
                <NextStepCard
                  href="/style-packs"
                  eyebrow="Browse"
                  title="Read the pack library"
                  body="14 seeded packs, each with its own token set and curated component list."
                />
                <NextStepCard
                  href="/components"
                  eyebrow="Browse"
                  title="Read the component library"
                  body="~160 recipes across heroes, pricing, cards, CTAs, footers, and more."
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------------- */
/* Subcomponents                                                             */
/* ------------------------------------------------------------------------- */

const bodyCopyStyle: React.CSSProperties = {
  color: 'var(--ink-soft)',
  fontSize: '1.0625rem',
  lineHeight: 1.65,
  maxWidth: '60ch',
};

function SectionHeading({
  numeral,
  eyebrow,
  title,
}: {
  numeral: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-5">
        <span
          className="display"
          style={{
            fontSize: 'clamp(1.5rem, 2vw, 1.875rem)',
            lineHeight: 1,
            color: 'var(--accent)',
            fontVariantNumeric: 'oldstyle-nums',
          }}
        >
          {numeral}
        </span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <hr className="rule mt-4" style={{ height: 1, border: 0, background: 'var(--rule)' }} />
      <h2
        className="display mt-6"
        style={{
          fontSize: 'clamp(1.875rem, 3.2vw, 2.5rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          maxWidth: '28ch',
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function ToolTable({
  caption,
  tools,
}: {
  caption: string;
  tools: Array<{ name: string; desc: string }>;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="eyebrow">
          {caption} ({tools.length})
        </span>
        <span className="caption" style={{ fontSize: '0.6875rem' }}>
          Handler category
        </span>
      </div>
      <dl>
        {tools.map((t, i) => (
          <div
            key={t.name}
            className="grid grid-cols-12 gap-4 py-3"
            style={{
              borderTop: '1px solid var(--rule)',
              borderBottom: i === tools.length - 1 ? '1px solid var(--rule)' : undefined,
            }}
          >
            <dt
              className="col-span-12 md:col-span-4 text-[0.8125rem]"
              style={{
                fontFamily: 'var(--font-mono-editorial)',
                color: 'var(--ink)',
              }}
            >
              {t.name}
            </dt>
            <dd
              className="col-span-12 md:col-span-8 text-[0.9375rem]"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.55 }}
            >
              {t.desc}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function NextStepCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block transition-colors"
      style={{
        background: 'var(--paper-deep)',
        border: '1px solid var(--rule)',
        padding: '1.5rem',
      }}
    >
      <span className="eyebrow" style={{ fontSize: '0.6875rem', color: 'var(--accent)' }}>
        {eyebrow}
      </span>
      <h3
        className="display mt-2"
        style={{ fontSize: '1.25rem', lineHeight: 1.2, fontWeight: 500 }}
      >
        {title}
      </h3>
      <p
        className="mt-2"
        style={{ color: 'var(--ink-soft)', fontSize: '0.9375rem', lineHeight: 1.55 }}
      >
        {body}
      </p>
      <span
        className="mt-3 inline-block text-[0.8125rem]"
        style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono-editorial)' }}
      >
        {href} →
      </span>
    </Link>
  );
}
