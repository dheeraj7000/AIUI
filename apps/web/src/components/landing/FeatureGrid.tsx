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
    id: '01',
    title: 'Style packs',
    body: 'Fourteen curated design systems, each a complete kit — colors, type, spacing, radii, shadows. Pick one and the whole interface locks to it on day one.',
    specimen: <SwatchRow />,
    caption: 'Fig. 01 — a pack is 24 tokens, give or take.',
  },
  {
    id: '02',
    title: 'Component recipes',
    body: 'A library of 142 ready-made components, each with its prop shape and the usage rules Claude needs to place them correctly. No more inventing a third button style.',
    specimen: <RecipeLine />,
    caption: 'Fig. 02 — the recipe for Button.primary.',
  },
  {
    id: '03',
    title: 'Design memory',
    body: 'AIUI writes a small folder of files into your project — .aiui/ — that Claude reads every session. Your design decisions persist across conversations without you reminding anyone.',
    specimen: <TreeSpecimen />,
    caption: 'Fig. 03 — what lives in .aiui/.',
  },
  {
    id: '04',
    title: 'Token compliance',
    body: 'When the AI generates UI, we check the output against your approved tokens. Hard-coded hex that doesn\u2019t match gets flagged, auto-fixed, and reported — so drift is caught before it reaches a PR.',
    specimen: <DiffSpecimen />,
    caption: 'Fig. 04 — a compliance pass, shortened.',
  },
  {
    id: '05',
    title: 'Visual studio',
    body: 'A guided flow for picking a style pack and the components you want exposed to the AI. Preview everything live; export the config in one click.',
    specimen: <StudioRow />,
    caption: 'Fig. 05 — style pack preview, trimmed.',
  },
  {
    id: '06',
    title: 'One-line install',
    body: 'One command to connect your editor. No packages to install, no build plugins to configure, no yak to shave. Works with Claude Code, Cursor, Windsurf, and VS Code.',
    specimen: (
      <pre className="specimen" style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem' }}>
        <code>
          <span className="cm-dim">$</span> <span className="cm-key">claude</span>{' '}
          <span className="cm-tag">mcp</span> <span className="cm-attr">add</span>{' '}
          <span className="cm-string">aiui</span>
        </code>
      </pre>
    ),
    caption: 'Fig. 06 — sixty seconds, tops.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-24 lg:py-32">
        {/* Section opener */}
        <div className="grid grid-cols-12 gap-6 items-baseline">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="section-numeral">01</span>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow">The system</span>
            <h2
              className="display mt-3"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', lineHeight: 1.05 }}
            >
              Six pieces that together keep your design in place.
            </h2>
            <p className="lede mt-5">
              Each entry below is one of the tools AIUI gives you. They work on their own; they work
              better together.
            </p>
          </div>
        </div>

        <hr className="rule mt-12" style={{ height: 1, border: 0, background: 'var(--ink)' }} />

        {/* Entries */}
        <ol className="mt-0">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="grid grid-cols-12 gap-6 py-10 lg:py-14"
              style={{ borderBottom: '1px solid var(--rule)' }}
            >
              {/* Numeral gutter */}
              <div className="col-span-2 md:col-span-1">
                <span
                  className="display"
                  style={{
                    fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                    color: 'var(--accent)',
                    fontVariantNumeric: 'oldstyle-nums',
                  }}
                >
                  {entry.id}
                </span>
              </div>

              {/* Title + body */}
              <div className="col-span-10 md:col-span-5 lg:col-span-5">
                <h3
                  className="display"
                  style={{
                    fontSize: 'clamp(1.5rem, 2vw, 1.875rem)',
                    lineHeight: 1.1,
                  }}
                >
                  {entry.title}
                </h3>
                <p
                  className="mt-4"
                  style={{
                    color: 'var(--ink-soft)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    maxWidth: '52ch',
                  }}
                >
                  {entry.body}
                </p>
              </div>

              {/* Specimen */}
              <div className="col-span-12 md:col-span-6 lg:col-span-6 md:pl-4">
                {entry.specimen}
                <div className="figure-caption" style={{ justifyContent: 'space-between' }}>
                  <span className="fig-id">Fig. {entry.id}</span>
                  <span className="leader" aria-hidden />
                  <span>{entry.caption.replace(/^Fig\.\s*\d+\s*—\s*/, '')}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Specimen widgets ────────────────────────────────────────────────── */

function SwatchRow() {
  const palette = [
    'oklch(44% 0.140 28)',
    'oklch(52% 0.110 45)',
    'oklch(60% 0.090 82)',
    'oklch(58% 0.100 180)',
    'oklch(45% 0.110 260)',
    'oklch(22% 0.020 30)',
    'oklch(97.5% 0.008 60)',
  ];
  return (
    <div
      className="flex"
      style={{
        border: '1px solid var(--rule)',
        background: 'var(--paper-deep)',
      }}
    >
      {palette.map((c, i) => (
        <span
          key={c}
          aria-hidden
          style={{
            flex: 1,
            height: 72,
            background: c,
            borderRight: i < palette.length - 1 ? '1px solid var(--rule)' : undefined,
          }}
        />
      ))}
    </div>
  );
}

function RecipeLine() {
  return (
    <pre className="specimen" style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem' }}>
      <code>
        <span className="cm-punct">{'<'}</span>
        <span className="cm-tag">Button</span> <span className="cm-attr">variant</span>
        <span className="cm-punct">=</span>
        <span className="cm-string">&quot;primary&quot;</span> <span className="cm-attr">size</span>
        <span className="cm-punct">=</span>
        <span className="cm-string">&quot;md&quot;</span>
        <span className="cm-punct">{'>'}</span>
        {'\n  '}
        <span className="cm-key">Save changes</span>
        {'\n'}
        <span className="cm-punct">{'</'}</span>
        <span className="cm-tag">Button</span>
        <span className="cm-punct">{'>'}</span>
        {'\n\n'}
        <span className="cm-dim">// allowed variants</span>
        {'\n'}
        <span className="cm-dim">// primary · ghost · danger</span>
      </code>
    </pre>
  );
}

function TreeSpecimen() {
  return (
    <pre
      className="specimen"
      style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', lineHeight: 1.7 }}
    >
      <code>
        <span className="cm-dim">your-project/</span>
        {'\n'}
        <span className="cm-punct">└ </span>
        <span className="cm-tag">.aiui/</span>
        {'\n   '}
        <span className="cm-punct">├ </span>
        <span className="cm-key">design-memory.md</span>
        {'   '}
        <span className="cm-dim">· rules Claude reads</span>
        {'\n   '}
        <span className="cm-punct">├ </span>
        <span className="cm-key">tokens.json</span>
        {'          '}
        <span className="cm-dim">· color, type, space</span>
        {'\n   '}
        <span className="cm-punct">├ </span>
        <span className="cm-key">components.json</span>
        {'      '}
        <span className="cm-dim">· what is in scope</span>
        {'\n   '}
        <span className="cm-punct">└ </span>
        <span className="cm-key">assets/</span>
        {'              '}
        <span className="cm-dim">· your logos + marks</span>
      </code>
    </pre>
  );
}

function DiffSpecimen() {
  return (
    <pre
      className="specimen"
      style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', lineHeight: 1.7 }}
    >
      <code>
        <span className="cm-dim">- </span>
        <span style={{ color: 'oklch(40% 0.14 28)' }}>bg-[</span>
        <span style={{ color: 'oklch(40% 0.14 28)' }}>#6366f1</span>
        <span style={{ color: 'oklch(40% 0.14 28)' }}>]</span>
        {'\n'}
        <span className="cm-dim">+ </span>
        <span className="cm-string">bg-primary-500</span>
        {'   '}
        <span className="cm-dim">· matches tokens.color.primary</span>
        {'\n\n'}
        <span className="cm-dim">1 violation · 1 auto-fix · 0 warnings</span>
      </code>
    </pre>
  );
}

function StudioRow() {
  const packs = [
    { name: 'Paper Editorial', color: 'oklch(44% 0.14 28)' },
    { name: 'Warm Minimal', color: 'oklch(52% 0.11 45)' },
    { name: 'Ink & Paper', color: 'oklch(22% 0.02 30)' },
    { name: 'Studio Blue', color: 'oklch(45% 0.11 260)' },
  ];
  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        background: 'var(--paper-deep)',
        padding: '1rem 1.25rem',
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>
          Available packs
        </span>
        <span className="caption" style={{ fontSize: '0.6875rem' }}>
          14 total
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {packs.map((p) => (
          <li key={p.name} className="flex items-center gap-3">
            <span
              aria-hidden
              style={{
                width: 14,
                height: 14,
                background: p.color,
                border: '1px solid var(--rule)',
              }}
            />
            <span className="text-[0.8125rem]" style={{ color: 'var(--ink)' }}>
              {p.name}
            </span>
            <span className="leader" aria-hidden />
            <span
              className="text-[0.6875rem]"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono-editorial)' }}
            >
              24 tokens
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
