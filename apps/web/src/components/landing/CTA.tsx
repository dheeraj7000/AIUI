'use client';

import Link from 'next/link';

interface ContactLine {
  label: string;
  target: string;
  href: string;
  note?: string;
}

const contactLines: ContactLine[] = [
  {
    label: 'Report a bug',
    target: 'bugs@aiui.store',
    href: 'mailto:bugs@aiui.store',
    note: 'Something broken. We fix it fast.',
  },
  {
    label: 'Request a feature',
    target: 'features@aiui.store',
    href: 'mailto:features@aiui.store',
    note: 'We ship based on what you ask for.',
  },
  {
    label: 'Say hello',
    target: 'hello@aiui.store',
    href: 'mailto:hello@aiui.store',
    note: 'Everything else.',
  },
];

export function CTA() {
  return (
    <section id="beta" className="relative border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-32 lg:py-48">
        {/* Closing statement */}
        <div className="grid grid-cols-12 gap-12 items-start">
          <div className="col-span-12 lg:col-span-2">
            <span className="section-numeral">LOGIC_04</span>
          </div>
          <div className="col-span-12 lg:col-span-10">
            <span className="eyebrow">Termination Phase</span>
            <h2
              className="display mt-8"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: '-0.06em',
                maxWidth: '20ch',
              }}
            >
              Enforce your <span>authority</span>.
            </h2>
            <p className="lede mt-12 text-xl" style={{ maxWidth: '45ch' }}>
              AIUI is the first production-grade orchestration layer for agentic design. If your AI
              has been quietly redesigned your product, this is how you take control.
            </p>

            <div className="mt-16 flex flex-wrap items-center gap-8">
              <Link href="/sign-up" className="btn-ink px-10 py-5 text-lg">
                Initialize Beta
                <span aria-hidden className="ml-3">
                  →
                </span>
              </Link>
              <Link
                href="/docs"
                className="font-bold text-sm underline decoration-2 underline-offset-4 hover:text-[var(--accent)] transition-colors"
              >
                System Documentation
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-1 bg-[var(--rule)] border border-[var(--rule)]">
          {contactLines.map((line) => (
            <div
              key={line.label}
              className="bg-[var(--paper)] p-12 group hover:bg-[var(--paper-deep)] transition-colors"
            >
              <dt className="font-mono text-[10px] font-black text-[var(--accent)] tracking-widest uppercase mb-6">
                {line.label.replace(' ', '_')}
              </dt>
              <dd className="mb-4">
                <a
                  href={line.href}
                  className="text-xl font-bold hover:text-[var(--accent)] transition-colors"
                >
                  {line.target}
                </a>
              </dd>
              {line.note && (
                <dd className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-[24ch]">
                  {line.note}
                </dd>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
