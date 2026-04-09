import Link from 'next/link';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Style Packs', href: '/style-packs' },
      { label: 'Components', href: '/components' },
      { label: 'Visual Studio', href: '/studio' },
      { label: 'Import', href: '/import' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API Keys', href: '/api-keys' },
      { label: 'MCP Tools', href: '/projects' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Self-Hosting', href: '/docs' },
      { label: 'Status', href: '/api/health' },
    ],
  },
  {
    title: 'Connect',
    links: [{ label: 'Email', href: 'mailto:hello@aiui.dev', external: true }],
  },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: logo + tagline */}
        <div className="mb-12">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
            AIUI
          </span>
          <p className="mt-2 max-w-xs text-sm text-zinc-500">
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
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
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
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} AIUI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
