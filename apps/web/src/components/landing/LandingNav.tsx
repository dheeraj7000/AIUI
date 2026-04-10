'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Wordmark } from '@/components/ui/Wordmark';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Docs', href: '/docs' },
  { label: 'Contact', href: '#contact' },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // On non-home pages, anchor links should navigate to the homepage sections
  const resolveHref = (href: string) => {
    if (href.startsWith('#') && !isHomePage) return `/${href}`;
    return href;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Wordmark size="lg" />
        </Link>

        {/* Desktop nav links — centered */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => {
            const href = resolveHref(link.href);
            const isPage = href.startsWith('/') && !href.startsWith('/#');
            return isPage ? (
              <Link
                key={link.href}
                href={href}
                className="relative text-sm font-medium text-zinc-400 transition-colors hover:text-white group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-400 to-indigo-300 transition-all duration-300 group-hover:w-full" />
              </Link>
            ) : (
              <a
                key={link.href}
                href={href}
                className="relative text-sm font-medium text-zinc-400 transition-colors hover:text-white group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-400 to-indigo-300 transition-all duration-300 group-hover:w-full" />
              </a>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-all duration-200 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/25"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const href = resolveHref(link.href);
                const isPage = href.startsWith('/') && !href.startsWith('/#');
                return isPage ? (
                  <Link
                    key={link.href}
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2.5 text-center text-sm font-medium text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
