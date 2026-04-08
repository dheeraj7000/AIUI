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
    <div className="flex items-center gap-1 text-sm text-zinc-400">
      {segments.map((segment, i) => {
        const label = labels[segment] || segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-zinc-600">/</span>}
            <span className={isLast ? 'font-medium text-white' : ''}>{label}</span>
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
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lime-500 to-cyan-500 text-zinc-950 transition-all duration-200 hover:shadow-md">
          <CircleUser size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
