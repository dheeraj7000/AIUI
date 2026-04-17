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
    <section id="beta" className="relative" style={{ background: 'var(--paper-deep)' }}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-24 lg:py-32">
        {/* Closing statement */}
        <div className="grid grid-cols-12 gap-6 items-baseline">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="section-numeral">05</span>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow">Closing</span>
            <h2
              className="display mt-3"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                lineHeight: 1.02,
                maxWidth: '22ch',
              }}
            >
              Take the controls <em>back</em>.
            </h2>
            <p className="lede mt-6" style={{ maxWidth: '52ch' }}>
              AIUI is in open beta — free to use, no credit card. If your AI has been quietly
              redesigning your product for months, this is the quickest way to stop it.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/sign-up" className="btn-ink">
                Join the beta
                <span aria-hidden style={{ fontFamily: 'var(--font-display)' }}>
                  →
                </span>
              </Link>
              <Link href="/docs" className="ink-link text-[0.9375rem]">
                Read the docs
              </Link>
            </div>
          </div>
        </div>

        <hr className="rule mt-20" style={{ height: 1, border: 0, background: 'var(--rule)' }} />

        {/* Colophon — contact addresses */}
        <div id="contact" className="pt-12">
          <div className="flex items-baseline gap-3">
            <span className="eyebrow">Colophon · reach the makers</span>
            <span className="leader" aria-hidden />
          </div>

          <dl className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-x-10">
            {contactLines.map((line) => (
              <div key={line.label}>
                <dt className="eyebrow" style={{ fontSize: '0.6875rem' }}>
                  {line.label}
                </dt>
                <dd className="mt-3">
                  <a href={line.href} className="ink-link text-[1rem]">
                    {line.target}
                  </a>
                </dd>
                {line.note && (
                  <dd
                    className="mt-2 text-[0.8125rem]"
                    style={{ color: 'var(--ink-muted)', maxWidth: '28ch' }}
                  >
                    {line.note}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
