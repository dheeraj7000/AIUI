'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';

const installCommand = 'claude mcp add aiui';

const trustItems = [
  { label: 'Works with Claude', value: null },
  { label: 'Works with Cursor', value: null },
  { label: 'Works with Windsurf', value: null },
  { label: 'Works with VS Code', value: null },
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
    <section className="relative overflow-hidden bg-zinc-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-lime-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-lime-500/5 blur-3xl" />
        {/* Floating token cards */}
        <div className="absolute top-20 left-[10%] hidden lg:block rounded-lg bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 text-xs font-mono text-zinc-400 border border-zinc-700/50 rotate-[-6deg]">
          color.primary.600
        </div>
        <div className="absolute top-40 right-[8%] hidden lg:block rounded-lg bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 text-xs font-mono text-zinc-400 border border-zinc-700/50 rotate-[4deg]">
          radius.lg: 12px
        </div>
        <div className="absolute bottom-32 left-[15%] hidden lg:block rounded-lg bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 text-xs font-mono text-zinc-400 border border-zinc-700/50 rotate-[3deg]">
          shadow.md
        </div>
        <div className="absolute bottom-24 right-[12%] hidden lg:block rounded-lg bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 text-xs font-mono text-zinc-400 border border-zinc-700/50 rotate-[-3deg]">
          font.heading: Inter
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 px-4 py-1.5 text-sm font-medium text-lime-400 backdrop-blur-sm border border-lime-500/20 mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              AI Design Control Layer
            </div>
            <h1
              className="text-5xl font-extrabold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl"
              style={{ lineHeight: '1.1' }}
            >
              Your Design System,{' '}
              <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
                Always in Sync
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-xl mx-auto lg:mx-0">
              Every AI tool generates UI differently. AIUI ensures your tokens, components, and
              design rules are followed in every conversation -- so your product stays consistent no
              matter who (or what) builds it.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/quick-setup"
                className="w-full sm:w-auto rounded-lg bg-lime-500 px-6 py-3.5 text-center text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/20 transition-all hover:bg-lime-400 hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3.5 text-center text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-800"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right: install command */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="rounded-xl bg-gray-950 shadow-2xl shadow-lime-500/10 border border-zinc-800 overflow-hidden">
              {/* Terminal title bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-2 text-xs text-gray-400 font-mono">Terminal</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
                  aria-label="Copy install command"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
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
                    <span className="text-gray-500">$</span>{' '}
                    <span className="text-lime-400">claude mcp add aiui</span>
                  </code>
                </pre>
                <p className="mt-4 text-sm text-gray-500">
                  One command. That&apos;s it. Your design system is now connected.
                </p>
              </div>
            </div>
            {/* Glow effect behind code block */}
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-lime-500/15 to-cyan-500/15 blur-2xl" />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-zinc-800 pt-8">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-zinc-500">
              <Check className="h-4 w-4 text-zinc-600" />
              {item.value && <span className="font-semibold text-white">{item.value}</span>}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
