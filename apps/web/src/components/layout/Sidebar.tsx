'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '▦' },
  { label: 'Projects', href: '/projects', icon: '📁' },
];

const designItems = [
  { label: 'Style Packs', href: '/style-packs', icon: '🎨' },
  { label: 'Components', href: '/components', icon: '🧩' },
];

const integrationItems = [{ label: 'API Keys', href: '/api-keys', icon: '🔑' }];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          AIUI
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main
        </div>
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Design
        </div>
        {designItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Integration
        </div>
        {integrationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
