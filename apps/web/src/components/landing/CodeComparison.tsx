'use client';

import { X, Check } from 'lucide-react';
import { FadeUp, FadeLeft, FadeRight } from './motion';

const withoutAiui = `// Prompt: "Build me a settings page"

<div style={{ padding: 20 }}>
  <h1 style={{ fontSize: 24, color: "navy" }}>
    Settings
  </h1>
  <button style={{
    background: "cornflowerblue",
    padding: "8px 16px",
    borderRadius: 4,
  }}>
    Save Changes
  </button>
</div>`;

const withAiui = `// Prompt: "Build me a settings page"

<div className="p-6 space-y-6">
  <h1 className="text-heading-lg font-semibold
    text-gray-900">
    Settings
  </h1>
  <Button
    variant="primary"
    size="md"
    className="bg-primary-600 rounded-radius-lg
      shadow-shadow-sm"
  >
    Save Changes
  </Button>
</div>`;

export function CodeComparison() {
  return (
    <section className="relative bg-zinc-950 py-24 sm:py-32 noise-overlay">
      <div className="absolute inset-0 bg-aurora-subtle" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
              The Difference
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Design consistency,{' '}
              <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
                automatically
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              Without AIUI, Claude invents styles on the fly. With AIUI, every component follows
              your exact design system.
            </p>
          </div>
        </FadeUp>

        {/* Comparison blocks */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Without AIUI */}
          <FadeLeft delay={0.1}>
            <div className="h-full rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center gap-2.5 border-b border-red-500/15 bg-red-950/40 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                  <X className="h-3.5 w-3.5 text-red-400" />
                </div>
                <span className="text-sm font-semibold text-red-400">Without AIUI</span>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-red-400/80">
                  Inconsistent styles, inline CSS, arbitrary colors, no design tokens.
                </p>
                <div className="rounded-xl bg-zinc-950/80 border border-white/5 p-4 overflow-x-auto">
                  <pre className="text-xs leading-relaxed font-mono text-zinc-400">
                    {withoutAiui}
                  </pre>
                </div>
              </div>
            </div>
          </FadeLeft>

          {/* With AIUI */}
          <FadeRight delay={0.1}>
            <div className="h-full rounded-2xl border border-lime-500/20 bg-lime-950/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-lime-500/30 hover:shadow-lg hover:shadow-lime-500/5">
              <div className="flex items-center gap-2.5 border-b border-lime-500/15 bg-lime-950/40 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500/20 border border-lime-500/30">
                  <Check className="h-3.5 w-3.5 text-lime-400" />
                </div>
                <span className="text-sm font-semibold text-lime-400">With AIUI</span>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-lime-400/80">
                  Your exact tokens, approved components, consistent output every time.
                </p>
                <div className="rounded-xl bg-zinc-950/80 border border-white/5 p-4 overflow-x-auto">
                  <pre className="text-xs leading-relaxed font-mono text-zinc-400">{withAiui}</pre>
                </div>
              </div>
            </div>
          </FadeRight>
        </div>
      </div>
    </section>
  );
}
