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
      { label: 'Quick Setup', href: '/quick-setup' },
      { label: 'API Keys', href: '/api-keys' },
      { label: 'MCP Tools', href: '/projects' },
      { label: 'GitHub', href: 'https://gitlab.com/dkumar70/AIUI', external: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/quick-setup' },
      { label: 'Self-Hosting', href: '/quick-setup' },
      { label: 'Status', href: '/api/health' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'GitLab', href: 'https://gitlab.com/dkumar70/AIUI', external: true },
      { label: 'Email', href: 'mailto:hello@aiui.dev', external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: logo + tagline */}
        <div className="mb-12">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            AIUI
          </span>
          <p className="mt-2 max-w-xs text-sm text-gray-400">
            The AI Design Control Layer. Pick your design system, add one config block, and Claude
            follows it everywhere.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white"
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
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AIUI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
