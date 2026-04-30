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
    <section className="relative border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-28 lg:pt-32 lg:pb-40">
        <div className="grid grid-cols-12 gap-x-12 gap-y-16">
          {/* Left — Technical Authority */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="section-numeral">LOGIC_00</span>
              <span className="eyebrow">Design Authority for AI Agents</span>
            </div>

            <h1
              className="display mt-12"
              style={{
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: '-0.05em',
              }}
            >
              Design that <br />
              doesn&rsquo;t <span>drift</span>.
            </h1>

            <div className="mt-12 space-y-6">
              <p
                style={{
                  fontSize: '1.5rem',
                  lineHeight: 1.3,
                  color: 'var(--ink)',
                  maxWidth: '42ch',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                AI generates UI, but it doesn&rsquo;t understand your brand. AIUI enforces design
                compliance at the token level.
              </p>

              <p
                className="lede"
                style={{ fontSize: '1.125rem', maxWidth: '50ch', fontWeight: 400 }}
              >
                A persistent design orchestration layer for Claude and Cursor. Your tokens, your
                components, your rules — hardcoded into the agent&rsquo;s memory.
              </p>
            </div>

            {/* Tactical Install Panel */}
            <div className="mt-12 p-1 border border-[var(--rule)] rounded-lg bg-[var(--paper-deep)] max-w-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--rule)]">
                <span className="font-mono text-[10px] font-bold text-[var(--ink-muted)]">
                  MCP_PROTOCOL_V1
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hover:text-[var(--accent)] transition-colors"
                  style={{ color: copied ? 'var(--success)' : 'var(--ink-muted)' }}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Success' : 'Copy'}
                </button>
              </div>
              <div className="p-4 font-mono text-sm overflow-x-auto whitespace-nowrap">
                <span className="text-[var(--ink-muted)]">$</span>{' '}
                <span className="text-[var(--accent)]">claude</span> mcp add aiui
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/sign-up" className="btn-ink px-8 py-4">
                Access the Studio
                <span aria-hidden className="ml-2">
                  →
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="font-bold text-sm underline decoration-2 underline-offset-4 hover:text-[var(--accent)] transition-colors"
              >
                System Documentation
              </a>
            </div>
          </div>

          {/* Right — Design Logic Manifest */}
          <aside className="col-span-12 lg:col-span-5">
            <DesignLogicManifest />
          </aside>
        </div>
      </div>
    </section>
  );
}

function DesignLogicManifest() {
  return (
    <div className="relative">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--rule-strong)_0.5px,transparent_0.5px)] [background-size:20px_20px] -z-10 opacity-30" />

      <figure className="bg-[var(--paper)] border-2 border-[var(--ink)] shadow-[8px_8px_0px_var(--rule-strong)] p-8">
        <header className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-bold text-[var(--ink-muted)]">
              MANIFEST_TYPE
            </span>
            <span className="font-bold text-sm">DESIGN_SYSTEM_MEMORY</span>
          </div>
          <div className="h-8 w-8 bg-[var(--ink)] flex items-center justify-center text-[var(--paper)] font-bold text-xs">
            01
          </div>
        </header>

        <div className="mt-8 space-y-8">
          {/* Tokens Layer */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L01_FOUNDATION_TOKENS
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'BRAND_PRIMARY', value: '#0F172A', color: 'oklch(15% 0.05 260)' },
                { label: 'ACCENT_CORE', value: '#3B82F6', color: 'oklch(60% 0.2 250)' },
                { label: 'SURFACE_100', value: '#FFFFFF', color: 'oklch(100% 0 0)' },
                { label: 'RULE_HAIRLINE', value: '#E2E8F0', color: 'oklch(92% 0.01 260)' },
              ].map((t) => (
                <div
                  key={t.label}
                  className="p-3 border border-[var(--rule)] bg-[var(--paper-deep)] flex items-center gap-3"
                >
                  <div
                    className="w-4 h-4 border border-[var(--ink)]"
                    style={{ background: t.color }}
                  />
                  <div className="flex flex-col leading-none">
                    <span className="font-mono text-[9px] font-bold">{t.label}</span>
                    <span className="font-mono text-[8px] text-[var(--ink-muted)] mt-1">
                      {t.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Logic Layer */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L02_COMPLIANCE_LOGIC
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="bg-[var(--paper-sunk)] p-4 font-mono text-[10px] leading-relaxed border border-[var(--rule)] text-[var(--ink-soft)]">
              <div className="flex gap-2">
                <span className="text-[var(--success)]">PASS</span>
                <span>validate_ui_output(projectId, code)</span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-[var(--accent)]">INFO</span>
                <span>Checking typographic hierarchy...</span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-[var(--success)]">DONE</span>
                <span>100% token compliance detected.</span>
              </div>
            </div>
          </section>

          {/* Component Schema */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L03_COMPONENT_CONTRACT
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="flex items-end gap-2">
              {[4, 8, 12, 16, 24, 32].map((h) => (
                <div key={h} className="bg-[var(--ink)] w-full" style={{ height: h }} />
              ))}
            </div>
            <p className="mt-3 font-mono text-[9px] text-[var(--ink-muted)] text-right">
              SPACING_SCALE_4PX_OPTIMIZED
            </p>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-[var(--rule)] flex items-center justify-between">
          <span className="font-mono text-[9px] text-[var(--ink-muted)] italic">
            AIUI_SYSTEM_ORCHESTRATOR
          </span>
          <span className="font-mono text-[9px] font-bold text-[var(--ink)]">REV_2026.04</span>
        </footer>
      </figure>
    </div>
  );
}
