import type { ReactNode } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/ui/Wordmark';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-aurora" />
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-400/8 blur-[120px]" />

        <div className="relative max-w-md">
          <Link href="/">
            <Wordmark />
          </Link>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Control how AI builds your UI. Pick a design system, get a config block, and Claude
            follows it everywhere.
          </p>
          <h2 className="mt-10 text-xl font-semibold text-white">
            Design systems that work everywhere
          </h2>
          <ul className="mt-5 space-y-3.5 text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
              Consistent tokens across every AI tool
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
              One source of truth for your design system
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              Works with Claude, Cursor, VS Code, and more
            </li>
          </ul>
          <div className="mt-10 flex items-center gap-6 text-sm text-zinc-500">
            <span>360+ tokens</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>142 components</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>14 style packs</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>12 MCP tools</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="lg:hidden">
              <Wordmark />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
