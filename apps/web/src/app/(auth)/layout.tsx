import type { ReactNode } from 'react';
import Link from 'next/link';

function EditorialMark() {
  return (
    <span
      className="inline-flex items-baseline gap-[1px] text-[1.75rem] leading-none"
      style={{ fontFamily: 'var(--font-display)' }}
      aria-label="AIUI"
    >
      <span style={{ color: 'var(--ink)' }}>AI</span>
      <span aria-hidden style={{ color: 'var(--accent)' }}>
        ·
      </span>
      <span style={{ color: 'var(--ink)' }}>UI</span>
    </span>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="editorial flex flex-col lg:flex-row min-h-screen"
      style={{ background: 'var(--paper)' }}
    >
      {/* Left panel — editorial branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden"
        style={{ background: 'var(--paper-deep)', borderRight: '1px solid var(--rule)' }}
      >
        <div className="relative max-w-md">
          <Link href="/" aria-label="AIUI home">
            <EditorialMark />
          </Link>
          <p
            className="mt-6 text-[1.0625rem]"
            style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}
          >
            Control how AI builds your UI. Pick a design system, get a config block, and Claude
            follows it everywhere.
          </p>
          <h2
            className="mt-12 text-[1.5rem] leading-[1.15]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            Design systems that work everywhere.
          </h2>
          <ul className="mt-6 flex flex-col gap-3.5">
            {[
              'Consistent tokens across every AI tool',
              'One source of truth for your design system',
              'Works with Claude, Cursor, VS Code, and more',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[0.9375rem]"
                style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
                {item}
              </li>
            ))}
          </ul>
          <div
            className="mt-12 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[0.75rem]"
            style={{
              fontFamily: 'var(--font-mono-editorial)',
              color: 'var(--ink-muted)',
              letterSpacing: '0.06em',
            }}
          >
            <span>360+ tokens</span>
            <span aria-hidden>·</span>
            <span>142 components</span>
            <span aria-hidden>·</span>
            <span>14 style packs</span>
            <span aria-hidden>·</span>
            <span>12 MCP tools</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="lg:hidden inline-block" aria-label="AIUI home">
              <EditorialMark />
            </Link>
          </div>
          <div
            className="p-8"
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--rule)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
