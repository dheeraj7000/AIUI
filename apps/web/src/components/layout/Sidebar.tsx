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
  User,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

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
          ? 'bg-lime-500/10 text-lime-400 shadow-sm'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-lime-400' : 'text-zinc-500'} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const userEmail = user?.email ?? '';

  const handleSignOut = async () => {
    onClose?.();
    await signOut();
  };

  return (
    <nav className="flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
            AIUI
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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
        <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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
        <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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

      {/* User section */}
      <div className="border-t border-zinc-800 px-3 py-3">
        {userEmail && <p className="mb-2 truncate px-2 text-xs text-zinc-500">{userEmail}</p>}
        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <User size={14} />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center gap-1 px-2 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <ExternalLink size={12} />
          aiui.store
        </Link>
      </div>
    </nav>
  );
}
