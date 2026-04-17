'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';

const installCommand = 'claude mcp add aiui';

export function Hero() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(installCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-20 pb-28 lg:pt-28 lg:pb-36">
        {/* Front matter: section numeral + eyebrow meta */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          {/* Left — editorial opening */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-baseline gap-6">
              <span className="section-numeral">00</span>
              <span className="eyebrow">The AI design control layer</span>
            </div>

            <hr className="rule mt-8" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

            <h1
              className="display mt-10"
              style={{
                fontSize: 'clamp(2.75rem, 6.5vw, 5rem)',
                lineHeight: 0.98,
                fontWeight: 400,
                letterSpacing: '-0.02em',
              }}
            >
              Design that doesn&rsquo;t <em>drift</em>,
              <br />
              no matter who builds it.
            </h1>

            <p
              className="mt-8"
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.45,
                color: 'var(--ink)',
                maxWidth: '48ch',
                fontWeight: 500,
              }}
            >
              Every time your AI generates UI, it invents new colors, spacing, and components —
              quietly breaking your design system. AIUI stops that.
            </p>

            <p className="lede mt-6" style={{ maxWidth: '52ch' }}>
              A persistent design memory for Claude, Cursor, and your other AI tools. Your tokens,
              your components, your rules — followed on every screen, in every conversation.
            </p>

            <p
              className="mt-4 text-[0.8125rem]"
              style={{
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-mono-editorial)',
                letterSpacing: '0.04em',
              }}
            >
              Free in open beta · No credit card · Ninety-second install
            </p>

            {/* Install, first. Morgan copies in one click. */}
            <div className="mt-10 flex flex-col gap-3" style={{ maxWidth: '34rem' }}>
              <div className="flex items-baseline gap-3">
                <span className="eyebrow shrink-0">Already using Claude? Copy one line</span>
                <span className="leader" aria-hidden />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    fontFamily: 'var(--font-mono-editorial)',
                    color: copied ? 'var(--accent)' : 'var(--ink-muted)',
                    outlineColor: 'var(--accent)',
                  }}
                  aria-label="Copy install command"
                >
                  {copied ? (
                    <Check className="h-3 w-3" strokeWidth={1.5} />
                  ) : (
                    <Copy className="h-3 w-3" strokeWidth={1.5} />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="specimen text-left transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  padding: '1.25rem 1.5rem',
                  fontSize: '0.9375rem',
                  background: copied ? 'var(--accent-soft)' : 'var(--paper-sunk)',
                  outlineColor: 'var(--accent)',
                }}
                aria-label="Copy claude mcp add aiui"
              >
                <code>
                  <span className="cm-dim">$</span> <span className="cm-key">claude</span>{' '}
                  <span className="cm-tag">mcp</span> <span className="cm-attr">add</span>{' '}
                  <span className="cm-string">aiui</span>
                </code>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/sign-up" className="btn-ink">
                Start free in the studio
                <span aria-hidden style={{ fontFamily: 'var(--font-display)' }}>
                  →
                </span>
              </Link>
              <a href="#how-it-works" className="ink-link text-[0.9375rem]">
                Or see how it works
              </a>
            </div>
          </div>

          {/* Right — token specimen sheet */}
          <aside className="col-span-12 lg:col-span-5 lg:pl-8">
            <TokenSpecimen />
          </aside>
        </div>
      </div>

      {/* Bottom rule + colophon-style meta */}
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <hr className="rule" style={{ height: 1, border: 0, background: 'var(--rule)' }} />
        <div className="py-5 flex flex-wrap items-baseline justify-between gap-y-2">
          <span className="eyebrow">Compatible with</span>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {['Claude Code', 'Cursor', 'Windsurf', 'VS Code'].map((item) => (
              <span
                key={item}
                className="text-sm"
                style={{ color: 'var(--ink-soft)', fontFeatureSettings: '"ss01","kern"' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* Right-column specimen: shows AIUI as a design specimen sheet              */
/* ------------------------------------------------------------------------- */

function TokenSpecimen() {
  const swatches = [
    { name: 'color.surface', sample: 'oklch(97.5% 0.008 60)' },
    { name: 'color.ink', sample: 'oklch(22% 0.020 30)' },
    { name: 'color.accent', sample: 'oklch(44% 0.140 28)' },
    { name: 'color.muted', sample: 'oklch(48% 0.016 45)' },
  ];

  return (
    <figure
      style={{
        background: 'var(--paper-deep)',
        border: '1px solid var(--rule)',
        padding: '1.75rem 1.75rem 1.5rem',
      }}
    >
      {/* Header row */}
      <header className="flex items-baseline justify-between">
        <span className="eyebrow">Specimen</span>
        <span
          className="text-[0.6875rem]"
          style={{
            fontFamily: 'var(--font-mono-editorial)',
            color: 'var(--ink-muted)',
            letterSpacing: '0.08em',
          }}
        >
          PROFILE · WARM PAPER
        </span>
      </header>

      <h3 className="display mt-3" style={{ fontSize: '1.625rem', lineHeight: 1.05 }}>
        Your tokens,
        <br />
        set in type.
      </h3>

      <hr className="rule mt-5" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

      {/* Color section */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>
            § 01 · Color
          </span>
          <span className="caption" style={{ fontSize: '0.6875rem' }}>
            4 of 360
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {swatches.map((s) => (
            <li key={s.name} className="flex items-center gap-3">
              <span
                aria-hidden
                className="block"
                style={{
                  width: 22,
                  height: 22,
                  background: s.sample,
                  border: '1px solid var(--rule)',
                }}
              />
              <span
                className="text-[0.8125rem]"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono-editorial)' }}
              >
                {s.name}
              </span>
              <span className="leader" aria-hidden />
              <span
                className="text-[0.6875rem] text-right tabular-nums"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono-editorial)' }}
              >
                {s.sample}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <hr className="rule mt-5" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

      {/* Type section */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>
            § 02 · Type
          </span>
          <span className="caption" style={{ fontSize: '0.6875rem' }}>
            Display + Body
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <span
            className="display"
            style={{ fontSize: '2.75rem', lineHeight: 1, color: 'var(--ink)' }}
          >
            Aa
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.75rem]" style={{ color: 'var(--ink)' }}>
              Gambarino · Display
            </span>
            <span className="caption" style={{ fontSize: '0.6875rem' }}>
              type.display · 400
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-4">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.875rem',
              lineHeight: 1,
              color: 'var(--ink)',
              fontWeight: 500,
            }}
          >
            Aa
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.75rem]" style={{ color: 'var(--ink)' }}>
              Switzer · Body
            </span>
            <span className="caption" style={{ fontSize: '0.6875rem' }}>
              type.body · 500
            </span>
          </div>
        </div>
      </section>

      <hr className="rule mt-5" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

      {/* Radius + spacing */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>
            § 03 · Measure
          </span>
          <span className="caption" style={{ fontSize: '0.6875rem' }}>
            scale.step · 1.333
          </span>
        </div>
        <div className="flex items-end gap-2 h-10">
          {[6, 9, 12, 18, 24, 32, 44].map((w) => (
            <span
              key={w}
              aria-hidden
              style={{
                width: w,
                height: w,
                border: '1px solid var(--ink)',
                background: 'var(--paper)',
              }}
            />
          ))}
        </div>
      </section>

      <figcaption
        className="figure-caption"
        style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--rule)' }}
      >
        <span className="fig-id">Fig. 00.2</span>
        <span className="leader" aria-hidden />
        <span>A slice of one project&rsquo;s design memory.</span>
      </figcaption>
    </figure>
  );
}
