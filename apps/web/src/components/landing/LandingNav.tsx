'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Docs', href: '/docs' },
  { label: 'Contact', href: '#contact' },
];

function EditorialMark() {
  return (
    <span
      className="inline-flex items-baseline gap-[1px] text-[1.375rem] leading-none"
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

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const resolveHref = (href: string) => {
    if (href.startsWith('#') && !isHomePage) return `/${href}`;
    return href;
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'color-mix(in oklab, var(--paper) 88%, transparent)',
        backdropFilter: 'saturate(1.4) blur(6px)',
        WebkitBackdropFilter: 'saturate(1.4) blur(6px)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-10 px-6 lg:px-10">
        <Link href="/" className="flex items-center" aria-label="AIUI home">
          <EditorialMark />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex flex-1 items-center gap-7">
          {navLinks.map((link) => {
            const href = resolveHref(link.href);
            const isPage = href.startsWith('/') && !href.startsWith('/#');
            const className =
              'group relative text-[0.875rem] leading-none transition-colors duration-150';
            const style = { color: 'var(--ink-soft)' } as React.CSSProperties;
            const children = (
              <>
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-[18px] left-0 h-px w-0 transition-[width] duration-200 group-hover:w-full"
                  style={{ background: 'var(--ink)' }}
                />
              </>
            );
            return isPage ? (
              <Link key={link.href} href={href} className={className} style={style}>
                {children}
              </Link>
            ) : (
              <a key={link.href} href={href} className={className} style={style}>
                {children}
              </a>
            );
          })}
        </div>

        <div className="ml-auto hidden md:flex items-center gap-5">
          <Link
            href="/sign-in"
            className="text-[0.875rem] transition-colors duration-150"
            style={{ color: 'var(--ink-soft)' }}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-ink !py-2 !px-4 !text-sm">
            Get started
          </Link>
        </div>

        {/* Mobile */}
        <button
          type="button"
          className="md:hidden ml-auto p-2 -mr-2 rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: 'var(--ink)', outlineColor: 'var(--accent)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={1.25} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}
        >
          <div className="px-6 py-6 flex flex-col gap-5">
            {navLinks.map((link) => {
              const href = resolveHref(link.href);
              const isPage = href.startsWith('/') && !href.startsWith('/#');
              return isPage ? (
                <Link
                  key={link.href}
                  href={href}
                  className="text-base"
                  style={{ color: 'var(--ink)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={href}
                  className="text-base"
                  style={{ color: 'var(--ink)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <hr className="rule" style={{ margin: '4px 0' }} />
            <Link
              href="/sign-in"
              className="text-base"
              style={{ color: 'var(--ink-soft)' }}
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="btn-ink w-full justify-center"
              onClick={() => setMobileOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
