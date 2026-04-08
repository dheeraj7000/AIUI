'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Docs', href: '/docs' },
  { label: 'Quick Setup', href: '/quick-setup' },
  { label: 'Pricing', href: '#pricing' },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
            AIUI
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/quick-setup"
            className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition-colors hover:bg-lime-400"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-2 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/quick-setup"
                className="rounded-lg bg-lime-500 px-3 py-2 text-center text-sm font-medium text-zinc-950 hover:bg-lime-400"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
