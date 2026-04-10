'use client';

import { X, Check } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FadeUp, FadeLeft, FadeRight } from './motion';

/* ── Chaos-to-Order UI elements ─────────────────────────────────── */

interface UIBlock {
  id: string;
  chaos: { x: number; y: number; rotate: number; color: string; width: number; height: number };
  order: { x: number; y: number; rotate: number; color: string; width: number; height: number };
  label: string;
}

const blocks: UIBlock[] = [
  {
    id: 'btn',
    chaos: { x: -60, y: -30, rotate: -15, color: '#ef4444', width: 90, height: 32 },
    order: { x: 0, y: 0, rotate: 0, color: '#6366F1', width: 90, height: 32 },
    label: 'Button',
  },
  {
    id: 'card',
    chaos: { x: 70, y: -50, rotate: 12, color: '#f59e0b', width: 110, height: 70 },
    order: { x: 110, y: 0, rotate: 0, color: '#6366F1', width: 110, height: 70 },
    label: 'Card',
  },
  {
    id: 'input',
    chaos: { x: -40, y: 60, rotate: -8, color: '#22c55e', width: 100, height: 28 },
    order: { x: 240, y: 0, rotate: 0, color: '#6366F1', width: 100, height: 28 },
    label: 'Input',
  },
  {
    id: 'text',
    chaos: { x: 80, y: 40, rotate: 20, color: '#ec4899', width: 120, height: 10 },
    order: { x: 0, y: 50, rotate: 0, color: '#818CF8', width: 120, height: 10 },
    label: '',
  },
  {
    id: 'text2',
    chaos: { x: -80, y: 10, rotate: -25, color: '#06b6d4', width: 80, height: 10 },
    order: { x: 0, y: 68, rotate: 0, color: '#818CF8', width: 80, height: 10 },
    label: '',
  },
  {
    id: 'badge',
    chaos: { x: 30, y: -60, rotate: 30, color: '#a855f7', width: 60, height: 22 },
    order: { x: 110, y: 80, rotate: 0, color: '#6366F1', width: 60, height: 22 },
    label: 'Tag',
  },
];

function ChaosOrderVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="mb-16">
      <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Chaos side */}
        <div className="text-center">
          <p className="text-sm font-medium text-red-400 mb-4">Without a design system</p>
          <div className="relative h-40 rounded-2xl border border-red-500/15 bg-red-950/10 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {blocks.map((b, i) => (
                <motion.div
                  key={b.id}
                  className="absolute rounded-md flex items-center justify-center"
                  initial={{
                    x: b.chaos.x,
                    y: b.chaos.y,
                    rotate: b.chaos.rotate,
                    opacity: 0,
                  }}
                  animate={
                    inView
                      ? {
                          x: b.chaos.x + Math.sin(i * 2) * 5,
                          y: b.chaos.y + Math.cos(i * 2) * 5,
                          rotate: b.chaos.rotate,
                          opacity: 1,
                        }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  style={{
                    width: b.chaos.width,
                    height: b.chaos.height,
                    backgroundColor: `${b.chaos.color}30`,
                    border: `1px solid ${b.chaos.color}50`,
                  }}
                >
                  {b.label && (
                    <span className="text-[9px] font-mono" style={{ color: b.chaos.color }}>
                      {b.label}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Order side */}
        <div className="text-center">
          <p className="text-sm font-medium text-indigo-400 mb-4">With AIUI tokens</p>
          <div className="relative h-40 rounded-2xl border border-indigo-500/15 bg-indigo-950/10 overflow-hidden">
            <div className="absolute inset-0 p-4">
              {blocks.map((b, i) => (
                <motion.div
                  key={b.id}
                  className="absolute rounded-md flex items-center justify-center"
                  initial={{
                    x: b.chaos.x + 150,
                    y: b.chaos.y + 70,
                    rotate: b.chaos.rotate,
                    opacity: 0,
                  }}
                  animate={
                    inView
                      ? {
                          x: b.order.x + 16,
                          y: b.order.y + 16,
                          rotate: 0,
                          opacity: 1,
                        }
                      : { opacity: 0 }
                  }
                  transition={{
                    duration: 0.8,
                    delay: 0.6 + i * 0.1,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  style={{
                    width: b.order.width,
                    height: b.order.height,
                    backgroundColor: `${b.order.color}20`,
                    border: `1px solid ${b.order.color}40`,
                  }}
                >
                  {b.label && (
                    <span className="text-[9px] font-mono" style={{ color: b.order.color }}>
                      {b.label}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Code snippets ──────────────────────────────────────────────── */

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
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              The Difference
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Design consistency,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                automatically
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400 mb-16">
              Without AIUI, Claude invents styles on the fly. With AIUI, every component follows
              your exact design system.
            </p>
          </div>
        </FadeUp>

        {/* Chaos-to-Order animation */}
        <ChaosOrderVisual />

        {/* Comparison blocks */}
        <div className="grid gap-6 md:grid-cols-2">
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
            <div className="h-full rounded-2xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
              <div className="flex items-center gap-2.5 border-b border-indigo-500/15 bg-indigo-950/40 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30">
                  <Check className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-indigo-400">With AIUI</span>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-indigo-400/80">
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
