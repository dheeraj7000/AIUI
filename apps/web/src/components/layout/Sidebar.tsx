'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Palette,
  LayoutGrid,
  Key,
  Download,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
];

const designItems: NavItem[] = [
  { label: 'Style Packs', href: '/style-packs', icon: Palette },
  { label: 'Components', href: '/components', icon: LayoutGrid },
  { label: 'Import', href: '/import', icon: Download },
];

const integrationItems: NavItem[] = [
  { label: 'Quick Setup', href: '/quick-setup', icon: Zap },
  { label: 'API Keys', href: '/api-keys', icon: Key },
];

function NavLink({
  item,
  active,
  onClose,
}: {
  item: NavItem;
  active: boolean;
  onClose?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-50 text-blue-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900 tracking-tight">
          AIUI
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Main
        </div>
        {mainItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={!!pathname?.startsWith(item.href)}
            onClose={onClose}
          />
        ))}
        <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Design
        </div>
        {designItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={!!pathname?.startsWith(item.href)}
            onClose={onClose}
          />
        ))}
        <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Integration
        </div>
        {integrationItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={!!pathname?.startsWith(item.href)}
            onClose={onClose}
          />
        ))}
      </div>
    </nav>
  );
}
