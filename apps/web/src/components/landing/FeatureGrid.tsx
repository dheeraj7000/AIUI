'use client';

interface Entry {
  id: string;
  title: string;
  body: string;
  specimen: React.ReactNode;
  caption: string;
}

const entries: Entry[] = [
  {
    id: 'L01',
    title: 'Universal Style Packs',
    body: 'Curated design systems mapped to abstract tokens. Export to Tailwind, React Native, or Inline CSS with zero effort.',
    specimen: <SwatchRow />,
    caption: 'PROTOCOL_LAYER_01: TOKENS',
  },
  {
    id: 'L02',
    title: 'Data-Aware Recipes',
    body: '142 logic-backed components. Enforce data requirements like loading, empty, and error states directly in the agent contract.',
    specimen: <RecipeLine />,
    caption: 'PROTOCOL_LAYER_02: RECIPES',
  },
  {
    id: 'L03',
    title: 'Persistent Design Memory',
    body: 'A centralized orchestration layer in .aiui/. Decisions persist across sessions without human intervention.',
    specimen: <TreeSpecimen />,
    caption: 'PROTOCOL_LAYER_03: PERSISTENCE',
  },
  {
    id: 'L04',
    title: 'Agentic Compliance Pass',
    body: 'Real-time AST scanning for design drift. Catch hardcoded values and auto-fix them to semantic tokens before they reach production.',
    specimen: <DiffSpecimen />,
    caption: 'PROTOCOL_LAYER_04: COMPLIANCE',
  },
  {
    id: 'L05',
    title: 'Live Logic Studio',
    body: 'A visual control center to orchestrate your system. Preview Style Packs applied to recipes in real-time.',
    specimen: <StudioRow />,
    caption: 'PROTOCOL_LAYER_05: STUDIO',
  },
  {
    id: 'L06',
    title: 'Pattern Extraction',
    body: 'Autonomously identify emerging design debt. Promote repetitive hardcoded values to formal tokens with one click.',
    specimen: (
      <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px] leading-relaxed">
        <div className="flex gap-2">
          <span className="text-[var(--accent)]">SCAN</span>
          <span>Detecting repetitive patterns...</span>
        </div>
        <div className="mt-1 flex gap-2">
          <span className="text-[var(--success)]">DEBT</span>
          <span>Found "#6366f1" used 12 times.</span>
        </div>
        <div className="mt-1 flex gap-2">
          <span className="text-white bg-[var(--ink)] px-1">PROMOTE</span>
          <span>Convert to "brand-accent"? [Y/n]</span>
        </div>
      </div>
    ),
    caption: 'PROTOCOL_LAYER_06: EVOLUTION',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-24 lg:py-40">
        {/* Section Header */}
        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <span className="section-numeral">LOGIC_01</span>
            <span className="eyebrow">The Orchestration System</span>
          </div>
          <h2
            className="display mt-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95 }}
          >
            An integrated platform for <span>design authority</span>.
          </h2>
          <p className="lede mt-8" style={{ maxWidth: '60ch' }}>
            Most AI tools generate code. AIUI generates architectures. Six integrated protocols that
            keep your design system operational in the age of agents.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[var(--paper)] border border-[var(--rule)] p-10 flex flex-col hover:border-[var(--ink)] transition-colors group"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                  {entry.id}
                </span>
                <div className="h-2 w-2 rounded-full bg-[var(--rule-strong)] group-hover:bg-[var(--accent)]" />
              </div>

              <h3 className="display text-2xl font-bold mb-6">{entry.title}</h3>

              <div className="flex-1">
                <p className="text-[var(--ink-soft)] text-sm leading-relaxed mb-10 max-w-[32ch]">
                  {entry.body}
                </p>
              </div>

              <div className="mt-auto">
                <div className="mb-4">{entry.specimen}</div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] font-bold text-[var(--ink-muted)] tracking-widest">
                    {entry.caption}
                  </span>
                  <span className="h-[1px] flex-1 bg-[var(--rule)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Specimen widgets (Refactored) ────────────────────────────────────── */

function SwatchRow() {
  const palette = [
    'oklch(15% 0.05 260)',
    'oklch(60% 0.2 250)',
    'oklch(100% 0 0)',
    'oklch(92% 0.01 260)',
    'oklch(55% 0.15 260)',
  ];
  return (
    <div className="flex gap-1">
      {palette.map((c) => (
        <span
          key={c}
          aria-hidden
          className="h-10 flex-1 border border-[var(--rule)]"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function RecipeLine() {
  return (
    <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px] text-[var(--ink-soft)]">
      <span className="text-[var(--accent)]">interface</span>{' '}
      <span className="text-[var(--ink)]">RecipeContract</span> {'{'}
      <br />
      &nbsp;&nbsp;requiresLoading: <span className="text-[var(--success)]">true</span>;
      <br />
      &nbsp;&nbsp;strictTokens: <span className="text-[var(--success)]">true</span>;
      <br />
      {'}'}
    </div>
  );
}

function TreeSpecimen() {
  return (
    <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[9px] text-[var(--ink-muted)]">
      .aiui/
      <br />
      ├── design-memory.md
      <br />
      ├── tokens.json
      <br />
      └── components.json
    </div>
  );
}

function DiffSpecimen() {
  return (
    <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px]">
      <div className="text-red-500"> - bg-[#6366f1] </div>
      <div className="text-green-500"> + bg-primary </div>
    </div>
  );
}

function StudioRow() {
  return (
    <div className="h-12 w-full border border-[var(--rule)] bg-[var(--paper-deep)] flex items-center justify-center">
      <div className="flex gap-4">
        <div className="h-4 w-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <span className="font-mono text-[10px] font-bold">STUDIO_LIVE_RENDER</span>
      </div>
    </div>
  );
}
