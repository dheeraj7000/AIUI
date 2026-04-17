import Link from 'next/link';

const sections = [
  {
    title: 'Product',
    links: [
      { label: 'Style packs', href: '/#features' },
      { label: 'Components', href: '/#features' },
      { label: 'Visual studio', href: '/studio' },
      { label: 'Start free', href: '/sign-up' },
    ],
  },
  {
    title: 'For builders',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'MCP integration', href: '/#how-it-works' },
      { label: 'Status', href: '/api/health' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Self-hosting', href: '/docs' },
      { label: 'Beta access', href: '/sign-up' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
];

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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <hr className="rule" style={{ height: 1, border: 0, background: 'var(--ink)' }} />

        <div className="grid grid-cols-12 gap-y-10 gap-x-6 py-16 lg:py-20">
          {/* Masthead */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <EditorialMark />
            <p
              className="mt-5 text-[0.9375rem]"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: '32ch' }}
            >
              A persistent design memory for your AI coding tools. Your tokens, your components,
              your rules — followed everywhere.
            </p>
            <p
              className="mt-6 text-[0.75rem]"
              style={{
                fontFamily: 'var(--font-mono-editorial)',
                color: 'var(--ink-muted)',
                letterSpacing: '0.06em',
              }}
            >
              Set in Gambarino &amp; Switzer · Oxblood on warm paper · v1.0 beta
            </p>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="col-span-12 md:col-span-7 lg:col-span-8 grid grid-cols-3 gap-6"
          >
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="eyebrow" style={{ fontSize: '0.6875rem' }}>
                  {section.title}
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[0.9375rem] transition-colors duration-150"
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Colophon rule + copyright row */}
        <div
          className="flex flex-wrap items-baseline justify-between gap-y-3 py-6"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <span
            className="text-[0.75rem]"
            style={{
              fontFamily: 'var(--font-mono-editorial)',
              color: 'var(--ink-muted)',
              letterSpacing: '0.06em',
            }}
          >
            © {year} AIUI · All rights reserved
          </span>
          <div className="flex items-baseline gap-6">
            <Link href="/docs" className="text-[0.8125rem]" style={{ color: 'var(--ink-muted)' }}>
              Privacy
            </Link>
            <Link href="/docs" className="text-[0.8125rem]" style={{ color: 'var(--ink-muted)' }}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
