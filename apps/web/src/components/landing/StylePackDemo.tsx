'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp } from './motion';

interface DemoStylePack {
  name: string;
  label: string;
  colors: { primary: string; bg: string; text: string; accent: string; muted: string };
  radius: string;
  fontFamily: string;
}

const packs: DemoStylePack[] = [
  {
    name: 'indigo',
    label: 'Midnight Indigo',
    colors: {
      primary: '#6366F1',
      bg: '#1e1b4b',
      text: '#e0e7ff',
      accent: '#818CF8',
      muted: '#4338ca',
    },
    radius: '0.75rem',
    fontFamily: 'Inter, sans-serif',
  },
  {
    name: 'sunset',
    label: 'Warm Sunset',
    colors: {
      primary: '#F59E0B',
      bg: '#451a03',
      text: '#fef3c7',
      accent: '#FBBF24',
      muted: '#b45309',
    },
    radius: '1rem',
    fontFamily: 'Inter, sans-serif',
  },
  {
    name: 'forest',
    label: 'Forest',
    colors: {
      primary: '#10B981',
      bg: '#022c22',
      text: '#d1fae5',
      accent: '#34D399',
      muted: '#047857',
    },
    radius: '0.5rem',
    fontFamily: 'Inter, sans-serif',
  },
  {
    name: 'neon',
    label: 'Neon Tokyo',
    colors: {
      primary: '#EC4899',
      bg: '#1a0a14',
      text: '#fce7f3',
      accent: '#F472B6',
      muted: '#9d174d',
    },
    radius: '0rem',
    fontFamily: 'JetBrains Mono, monospace',
  },
];

export function StylePackDemo() {
  const [active, setActive] = useState(0);
  const pack = packs[active];

  return (
    <section className="relative bg-zinc-950 py-24 sm:py-32">
      <div className="absolute inset-0 bg-aurora-subtle" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Live Preview
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Pick a style pack.{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                Watch it transform.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              This is what AIUI does. One click changes every token — colors, radii, typography.
              Your AI follows the new system instantly.
            </p>
          </div>
        </FadeUp>

        {/* Pack selector pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {packs.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActive(i)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                i === active
                  ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                  : 'text-zinc-400 border border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: p.colors.primary }}
              />
              {p.label}
              {i === active && (
                <motion.span
                  layoutId="pack-indicator"
                  className="absolute inset-0 rounded-full border border-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Live preview card */}
        <div className="mt-10 mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 0.68, 0, 1] }}
              className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl shadow-black/40"
              style={{
                background: pack.colors.bg,
                fontFamily: pack.fontFamily,
                borderRadius: `calc(${pack.radius} + 8px)`,
              }}
            >
              {/* Mock app header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: `${pack.colors.primary}20` }}
              >
                <span
                  className="text-sm font-bold tracking-tight font-mono"
                  style={{ color: pack.colors.accent }}
                >
                  AI|UI
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: pack.colors.primary }}
                  />
                  <span className="text-xs" style={{ color: pack.colors.muted }}>
                    Connected
                  </span>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: pack.colors.text }}>
                    Dashboard
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: `${pack.colors.text}99` }}>
                    Your design system is active. 24 tokens loaded.
                  </p>
                </div>

                {/* Mock stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  {['Tokens', 'Components', 'Rules'].map((label, i) => (
                    <div
                      key={label}
                      className="p-3 border transition-all duration-300"
                      style={{
                        borderColor: `${pack.colors.primary}25`,
                        borderRadius: pack.radius,
                        background: `${pack.colors.primary}08`,
                      }}
                    >
                      <div className="text-lg font-bold" style={{ color: pack.colors.accent }}>
                        {[24, 12, 8][i]}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: `${pack.colors.text}77` }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock CTA button */}
                <button
                  className="w-full py-2.5 text-sm font-semibold text-white transition-all duration-300"
                  style={{
                    backgroundColor: pack.colors.primary,
                    borderRadius: pack.radius,
                  }}
                >
                  Apply Style Pack
                </button>
              </div>

              {/* Token bar at bottom */}
              <div
                className="flex items-center gap-2 px-6 py-3 border-t overflow-x-auto"
                style={{ borderColor: `${pack.colors.primary}15` }}
              >
                {['color.primary', 'radius.md', 'font.body'].map((token) => (
                  <span
                    key={token}
                    className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-mono border transition-all duration-300"
                    style={{
                      color: pack.colors.accent,
                      borderColor: `${pack.colors.primary}30`,
                      background: `${pack.colors.primary}10`,
                    }}
                  >
                    {token}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
