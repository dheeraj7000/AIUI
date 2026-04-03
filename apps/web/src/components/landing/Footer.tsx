import Link from 'next/link';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Visual Studio', href: '/studio' },
      { label: 'Style Packs', href: '/studio' },
      { label: 'Component Recipes', href: '/studio' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'GitLab', href: 'https://gitlab.com/nicholasthompson/aiui', external: true },
      { label: 'Discord', href: '#', external: true },
      { label: 'Twitter', href: '#', external: true },
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
