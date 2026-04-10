import Link from 'next/link';
import { Wordmark } from '@/components/ui/Wordmark';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Style Packs', href: '/#features' },
      { label: 'Components', href: '/#features' },
      { label: 'Visual Studio', href: '/#features' },
      { label: 'Get Started', href: '/sign-up' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'MCP Integration', href: '/#how-it-works' },
      { label: 'Status', href: '/api/health' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Self-Hosting', href: '/docs' },
      { label: 'Beta Access', href: '/sign-up' },
    ],
  },
  {
    title: 'Connect',
    links: [{ label: 'Email', href: 'mailto:hello@aiui.dev', external: true }],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: logo + tagline */}
        <div className="mb-12">
          <Wordmark size="lg" />
          <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-500">
            The AI Design Control Layer. Pick your design system, add one config block, and Claude
            follows it everywhere.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-zinc-300">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-500 transition-colors hover:text-indigo-400"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 transition-colors hover:text-indigo-400"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright */}
        <div className="mt-12 pt-8">
          <div className="section-divider mb-8" />
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} AIUI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
