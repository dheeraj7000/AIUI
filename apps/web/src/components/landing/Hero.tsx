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
              <span className="eyebrow">Adopt · Discover · Crystallize · Enforce</span>
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
              Your design system, <br />
              learned from your <span>code</span>.
            </h1>

            <div className="mt-12 space-y-6">
              <p
                style={{
                  fontSize: '1.5rem',
                  lineHeight: 1.3,
                  color: 'var(--ink)',
                  maxWidth: '46ch',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                Point AIUI at your existing repo. It ingests the patterns you already use, memorizes
                them, and enforces them on every UI your AI writes after that.
              </p>

              <p
                className="lede"
                style={{ fontSize: '1.125rem', maxWidth: '54ch', fontWeight: 400 }}
              >
                A persistent design memory for Claude and Cursor. Adopts an existing codebase in one
                command, validates generated UI against your tokens, auto-fixes drift before it
                ships.
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

            {/* Four-verb loop */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
              <LoopStep
                index="00"
                verb="ADOPT"
                description="Ingest an existing codebase. One command, scans every file, imports detected tokens."
                tool="aiui adopt"
              />
              <LoopStep
                index="01"
                verb="DISCOVER"
                description="Continuously surface new repeated values worth promoting."
                tool="aiui watch"
              />
              <LoopStep
                index="02"
                verb="CRYSTALLIZE"
                description="Promote a recurring value into a project token, captured in design memory."
                tool="promote_pattern"
              />
              <LoopStep
                index="03"
                verb="ENFORCE"
                description="Validate every AI-generated component against the active tokens, auto-fix drift."
                tool="validate_ui_output"
              />
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

function LoopStep({
  index,
  verb,
  description,
  tool,
}: {
  index: string;
  verb: string;
  description: string;
  tool: string;
}) {
  return (
    <div className="border-t-2 border-[var(--ink)] pt-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] font-bold text-[var(--ink-muted)]">{index}</span>
        <span className="font-mono text-xs font-extrabold tracking-widest text-[var(--accent)]">
          {verb}
        </span>
      </div>
      <p className="mt-3 text-sm leading-snug" style={{ color: 'var(--ink-soft)' }}>
        {description}
      </p>
      <code className="mt-3 inline-block font-mono text-[10px] text-[var(--ink-muted)]">
        {tool.startsWith('aiui ') ? `$ ${tool}` : `${tool}()`}
      </code>
    </div>
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
          {/* Discovered patterns */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L01_DISCOVERED_PATTERNS
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="bg-[var(--paper-sunk)] p-4 font-mono text-[10px] leading-relaxed border border-[var(--rule)] text-[var(--ink-soft)] space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="text-[var(--accent)]">●</span> #FF5733
                </span>
                <span className="text-[var(--ink-muted)]">×12 uses · bg, border</span>
                <span className="text-[var(--success)]">→ promote</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="text-[var(--accent)]">●</span> 0.875rem
                </span>
                <span className="text-[var(--ink-muted)]">×8 uses · text</span>
                <span className="text-[var(--success)]">→ promote</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="text-[var(--accent)]">●</span> 12px
                </span>
                <span className="text-[var(--ink-muted)]">×6 uses · rounded</span>
                <span className="text-[var(--success)]">→ promote</span>
              </div>
            </div>
          </section>

          {/* Crystallized tokens */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L02_CRYSTALLIZED_TOKENS
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'COLOR.BRAND', value: '#FF5733', color: 'oklch(60% 0.18 30)' },
                { label: 'FONT-SIZE.BODY', value: '0.875rem', color: 'oklch(96% 0.01 260)' },
                { label: 'RADIUS.MD', value: '12px', color: 'oklch(96% 0.01 260)' },
                { label: 'SURFACE_100', value: '#FFFFFF', color: 'oklch(100% 0 0)' },
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

          {/* Enforcement */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                L03_ENFORCEMENT_LOG
              </span>
              <span className="h-[2px] flex-1 mx-4 bg-[var(--rule)]" />
            </div>
            <div className="bg-[var(--paper-sunk)] p-4 font-mono text-[10px] leading-relaxed border border-[var(--rule)] text-[var(--ink-soft)]">
              <div className="flex gap-2">
                <span className="text-[var(--accent)]">INFO</span>
                <span>validate_ui_output(projectId, code)</span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-[var(--ink-muted)]">→</span>
                <span>Found 1 violation: bg-[#0070F3] not in token set.</span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-[var(--accent)]">EXEC</span>
                <span>fix_compliance_issues(...)</span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-[var(--success)]">DONE</span>
                <span>bg-[#0070F3] → bg-brand · 100% compliant.</span>
              </div>
            </div>
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
