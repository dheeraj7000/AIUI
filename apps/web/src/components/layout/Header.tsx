'use client';

import { usePathname } from 'next/navigation';
import { CircleUser, Menu } from 'lucide-react';

function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    'style-packs': 'Style Packs',
    components: 'Components',
    settings: 'Settings',
    assets: 'Assets',
    integrations: 'Integrations',
    bundle: 'Bundle',
    'api-keys': 'API Keys',
  };

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      {segments.map((segment, i) => {
        const label = labels[segment] || segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">/</span>}
            <span className={isLast ? 'font-medium text-gray-900' : ''}>{label}</span>
          </span>
        );
      })}
    </div>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white transition-all duration-200 hover:shadow-md">
          <CircleUser size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
