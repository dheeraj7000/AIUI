'use client';

import { useState } from 'react';

interface DemoStylePack {
  name: string;
  label: string;
  description: string;
  colors: {
    surface: string;
    surfaceAlt: string;
    ink: string;
    inkSoft: string;
    accent: string;
    rule: string;
  };
  radius: string;
  fontFamily: string;
  displayFamily: string;
}

const packs: DemoStylePack[] = [
  {
    name: 'paper',
    label: 'Paper Editorial',
    description: 'Warm paper. Oxblood ink. Rules, not shadows.',
    colors: {
      surface: 'oklch(97.5% 0.008 60)',
      surfaceAlt: 'oklch(94% 0.012 60)',
      ink: 'oklch(22% 0.020 30)',
      inkSoft: 'oklch(48% 0.016 45)',
      accent: 'oklch(44% 0.140 28)',
      rule: 'oklch(84% 0.010 55)',
    },
    radius: '2px',
    fontFamily: "'Switzer', sans-serif",
    displayFamily: "'Gambarino', serif",
  },
  {
    name: 'fintech',
    label: 'Fintech Light',
    description: 'Cool slate neutrals with a confident blue.',
    colors: {
      surface: 'oklch(98% 0.004 240)',
      surfaceAlt: 'oklch(95% 0.008 240)',
      ink: 'oklch(28% 0.020 260)',
      inkSoft: 'oklch(50% 0.020 250)',
      accent: 'oklch(48% 0.140 255)',
      rule: 'oklch(87% 0.012 240)',
    },
    radius: '8px',
    fontFamily: "'Switzer', sans-serif",
    displayFamily: "'Switzer', sans-serif",
  },
  {
    name: 'ink',
    label: 'Ink & Rule',
    description: 'Pure typography. Nothing but rules and the letterform.',
    colors: {
      surface: 'oklch(98% 0 0)',
      surfaceAlt: 'oklch(94% 0 0)',
      ink: 'oklch(18% 0 0)',
      inkSoft: 'oklch(45% 0 0)',
      accent: 'oklch(18% 0 0)',
      rule: 'oklch(82% 0 0)',
    },
    radius: '0px',
    fontFamily: "'Switzer', sans-serif",
    displayFamily: "'Gambarino', serif",
  },
  {
    name: 'studio',
    label: 'Studio Dark',
    description: 'For products built to be used at night.',
    colors: {
      surface: 'oklch(16% 0.010 260)',
      surfaceAlt: 'oklch(20% 0.012 260)',
      ink: 'oklch(96% 0.006 240)',
      inkSoft: 'oklch(72% 0.010 240)',
      accent: 'oklch(78% 0.110 85)',
      rule: 'oklch(32% 0.014 260)',
    },
    radius: '6px',
    fontFamily: "'Switzer', sans-serif",
    displayFamily: "'Switzer', sans-serif",
  },
];

export function StylePackDemo() {
  const [active, setActive] = useState(0);
  const pack = packs[active];

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-24 lg:py-32">
        {/* Section opener */}
        <div className="grid grid-cols-12 gap-6 items-baseline">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="section-numeral">02</span>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow">Try the control</span>
            <h2
              className="display mt-3"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', lineHeight: 1.05 }}
            >
              One click changes every token. The AI follows, instantly.
            </h2>
            <p className="lede mt-5">
              Select a style pack below. The preview rebuilds itself — colors, radii, type, spacing
              — and the AI working inside your editor does the same.
            </p>
          </div>
        </div>

        <hr className="rule mt-12" style={{ height: 1, border: 0, background: 'var(--ink)' }} />

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Style packs"
          className="mt-10 grid"
          style={{ gridTemplateColumns: `repeat(${packs.length}, 1fr)` }}
          onKeyDown={(e) => {
            if (
              e.key !== 'ArrowLeft' &&
              e.key !== 'ArrowRight' &&
              e.key !== 'Home' &&
              e.key !== 'End'
            )
              return;
            e.preventDefault();
            const next =
              e.key === 'ArrowRight'
                ? (active + 1) % packs.length
                : e.key === 'ArrowLeft'
                  ? (active - 1 + packs.length) % packs.length
                  : e.key === 'Home'
                    ? 0
                    : packs.length - 1;
            setActive(next);
            const btn = e.currentTarget.children[next] as HTMLElement | undefined;
            btn?.focus();
          }}
        >
          {packs.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.name}
                role="tab"
                id={`pack-tab-${p.name}`}
                aria-selected={isActive}
                aria-controls="pack-preview"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(i)}
                className="group flex flex-col items-start gap-2 px-4 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: 'transparent',
                  borderTop: `2px solid ${isActive ? 'var(--ink)' : 'var(--rule)'}`,
                  color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  outlineColor: 'var(--accent)',
                }}
              >
                <span className="flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className="block"
                    style={{
                      width: 10,
                      height: 10,
                      background: p.colors.accent,
                      border: `1px solid ${p.colors.rule}`,
                    }}
                  />
                  <span
                    className="text-[0.6875rem]"
                    style={{
                      fontFamily: 'var(--font-mono-editorial)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Pack {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="display" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>
                  {p.label}
                </span>
                <span
                  className="text-[0.8125rem]"
                  style={{ color: isActive ? 'var(--ink-soft)' : 'var(--ink-muted)' }}
                >
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview */}
        <div
          className="mt-10 grid grid-cols-12 gap-6"
          id="pack-preview"
          role="tabpanel"
          aria-labelledby={`pack-tab-${pack.name}`}
        >
          <div className="col-span-12 lg:col-span-8">
            <PreviewPage pack={pack} />
            <div className="figure-caption mt-4" style={{ justifyContent: 'space-between' }}>
              <span className="fig-id">Fig. 02 · live</span>
              <span className="leader" aria-hidden />
              <span>Re-typeset in real time from the active pack.</span>
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-4">
            <TokenList pack={pack} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function PreviewPage({ pack }: { pack: DemoStylePack }) {
  return (
    <article
      aria-live="polite"
      style={{
        background: pack.colors.surface,
        color: pack.colors.ink,
        fontFamily: pack.fontFamily,
        border: `1px solid ${pack.colors.rule}`,
        borderRadius: pack.radius,
        padding: '2rem 2rem 2.25rem',
        transition: 'all 280ms cubic-bezier(0.21,0.47,0.32,0.98)',
      }}
    >
      {/* Mock app front-matter */}
      <header
        className="flex items-baseline justify-between pb-4"
        style={{ borderBottom: `1px solid ${pack.colors.rule}` }}
      >
        <span
          style={{
            fontFamily: pack.displayFamily,
            color: pack.colors.ink,
            fontSize: '1.125rem',
          }}
        >
          your-product
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono-editorial)',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: pack.colors.inkSoft,
          }}
        >
          Connected · 24 tokens
        </span>
      </header>

      <h3
        style={{
          fontFamily: pack.displayFamily,
          fontSize: '1.75rem',
          lineHeight: 1.1,
          marginTop: '1.5rem',
          color: pack.colors.ink,
          fontWeight: 500,
        }}
      >
        Dashboard
      </h3>
      <p
        style={{
          marginTop: '0.625rem',
          color: pack.colors.inkSoft,
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          maxWidth: '52ch',
        }}
      >
        Tokens loaded. Components in scope. Anything the AI generates from here will use this pack.
      </p>

      {/* Mock metric row — presented as a ruled table, not cards */}
      <dl className="grid grid-cols-3 mt-6" style={{ borderTop: `1px solid ${pack.colors.rule}` }}>
        {[
          { label: 'Tokens', value: '24' },
          { label: 'Components', value: '12' },
          { label: 'Rules', value: '8' },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            style={{
              padding: '0.875rem 0',
              borderRight: idx < 2 ? `1px solid ${pack.colors.rule}` : undefined,
              paddingLeft: idx === 0 ? 0 : '1rem',
              paddingRight: '1rem',
            }}
          >
            <dt
              style={{
                fontFamily: 'var(--font-mono-editorial)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pack.colors.inkSoft,
              }}
            >
              {stat.label}
            </dt>
            <dd
              style={{
                fontFamily: pack.displayFamily,
                fontSize: '1.75rem',
                lineHeight: 1.05,
                marginTop: '0.375rem',
                color: pack.colors.ink,
                fontVariantNumeric: 'oldstyle-nums',
              }}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Mock CTA */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          style={{
            background: pack.colors.accent,
            color: pack.colors.surface,
            border: `1px solid ${pack.colors.accent}`,
            borderRadius: pack.radius,
            padding: '0.75rem 1.125rem',
            fontSize: '0.875rem',
            fontFamily: pack.fontFamily,
            fontWeight: 500,
            transition: 'all 180ms ease',
          }}
        >
          Apply pack
        </button>
        <button
          type="button"
          style={{
            background: 'transparent',
            color: pack.colors.ink,
            border: `1px solid ${pack.colors.rule}`,
            borderRadius: pack.radius,
            padding: '0.75rem 1.125rem',
            fontSize: '0.875rem',
            fontFamily: pack.fontFamily,
          }}
        >
          Preview more
        </button>
      </div>
    </article>
  );
}

function TokenList({ pack }: { pack: DemoStylePack }) {
  const tokens: Array<[string, string, string]> = [
    ['color.surface', pack.colors.surface, 'surface'],
    ['color.ink', pack.colors.ink, 'ink'],
    ['color.accent', pack.colors.accent, 'accent'],
    ['color.rule', pack.colors.rule, 'hairline'],
    ['radius.md', pack.radius, 'radius'],
    ['type.body', pack.fontFamily.split(',')[0].replace(/'/g, ''), 'body'],
    ['type.display', pack.displayFamily.split(',')[0].replace(/'/g, ''), 'display'],
  ];

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        background: 'var(--paper-deep)',
        padding: '1.25rem 1.5rem',
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>
          Tokens resolved
        </span>
        <span
          className="caption"
          style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono-editorial)' }}
        >
          pack = {pack.name}
        </span>
      </div>
      <hr className="rule mt-3" style={{ height: 1, border: 0, background: 'var(--rule)' }} />
      <dl className="mt-3 flex flex-col gap-2">
        {tokens.map(([key, value, kind]) => (
          <div key={key} className="flex items-center gap-3">
            <dt
              className="text-[0.8125rem]"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono-editorial)' }}
            >
              {key}
            </dt>
            <span className="leader" aria-hidden />
            {kind === 'surface' || kind === 'ink' || kind === 'accent' || kind === 'hairline' ? (
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  background: value,
                  border: '1px solid var(--rule)',
                }}
              />
            ) : null}
            <dd
              className="text-[0.6875rem] text-right"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono-editorial)' }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
