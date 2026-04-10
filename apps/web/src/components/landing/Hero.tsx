'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Copy, ArrowRight, Sparkles } from 'lucide-react';

const installCommand = 'claude mcp add aiui';

const trustItems = [
  { label: 'Works with Claude' },
  { label: 'Works with Cursor' },
  { label: 'Works with Windsurf' },
  { label: 'Works with VS Code' },
];

export function Hero() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(installCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="relative overflow-hidden bg-zinc-950 noise-overlay">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-aurora" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />

      {/* Decorative blurs */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-lime-500/8 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-400/8 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-lime-500/4 blur-[150px]" />

      {/* Floating token cards */}
      <div
        className="absolute top-24 left-[8%] hidden lg:block animate-float"
        style={{ '--float-rotate': '-6deg' } as React.CSSProperties}
      >
        <div className="rounded-lg bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-zinc-400 border border-white/10 shadow-lg shadow-black/20">
          color.primary.600
        </div>
      </div>
      <div
        className="absolute top-44 right-[6%] hidden lg:block animate-float-delayed"
        style={{ '--float-rotate': '4deg' } as React.CSSProperties}
      >
        <div className="rounded-lg bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-zinc-400 border border-white/10 shadow-lg shadow-black/20">
          radius.lg: 12px
        </div>
      </div>
      <div
        className="absolute bottom-36 left-[4%] hidden lg:block animate-float-slow"
        style={{ '--float-rotate': '3deg' } as React.CSSProperties}
      >
        <div className="rounded-lg bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-zinc-400 border border-white/10 shadow-lg shadow-black/20">
          shadow.md
        </div>
      </div>
      <div
        className="absolute bottom-28 right-[10%] hidden lg:block animate-float"
        style={{ '--float-rotate': '-3deg' } as React.CSSProperties}
      >
        <div className="rounded-lg bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-zinc-400 border border-white/10 shadow-lg shadow-black/20">
          font.heading: Inter
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 px-4 py-1.5 text-sm font-medium text-lime-400 backdrop-blur-sm border border-lime-500/20 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Design Control Layer
            </motion.div>

            <h1
              className="text-5xl font-extrabold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl"
              style={{ lineHeight: '1.05' }}
            >
              Your Design System,{' '}
              <span className="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Always in Sync
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-lg leading-8 text-zinc-400 max-w-xl mx-auto lg:mx-0"
            >
              Every AI tool generates UI differently. AIUI ensures your tokens, components, and
              design rules are followed in every conversation — so your product stays consistent no
              matter who (or what) builds it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/sign-up"
                className="group w-full sm:w-auto rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-7 py-3.5 text-center text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/30 hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-7 py-3.5 text-center text-sm font-semibold text-zinc-300 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              >
                See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Right: install command terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
              {/* Terminal title bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-2 text-xs text-zinc-500 font-mono">Terminal</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-zinc-200"
                  aria-label="Copy install command"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-lime-400" />
                      <span className="text-lime-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Command content */}
              <div className="p-6">
                <pre className="text-base leading-relaxed font-mono">
                  <code>
                    <span className="text-zinc-600">$</span>{' '}
                    <span className="text-lime-400">claude mcp add aiui</span>
                  </code>
                </pre>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-lime-400 animate-pulse" />
                  <p className="text-sm text-zinc-500">
                    One command. That&apos;s it. Your design system is now connected.
                  </p>
                </div>
              </div>
            </div>

            {/* Glow effect behind terminal */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-lime-500/20 via-emerald-500/10 to-cyan-500/20 blur-2xl" />
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20"
        >
          <div className="section-divider" />
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-8">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm text-zinc-400">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-500/15">
                  <Check className="h-3 w-3 text-lime-400" />
                </div>
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
