'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Key,
  BookOpen,
  Download,
  Sparkles,
  MessageSquare,
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
  { label: 'Adopt', href: '/adopt', icon: Sparkles },
  { label: 'Critique', href: '/critique', icon: MessageSquare },
  { label: 'Import', href: '/import', icon: Download },
];

const integrationItems: NavItem[] = [
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'MCP Tools', href: '/mcp-tools', icon: BookOpen },
];

function EditorialMark() {
  return (
    <span
      className="inline-flex items-baseline gap-[1px] text-[1.375rem] leading-none"
      style={{ fontFamily: 'var(--font-display)' }}
      aria-label="AIUI"
    >
      <span style={{ color: 'var(--ink)' }}>AI</span>
      <span aria-hidden style={{ color: 'var(--accent)' }}>
        ·
      </span>
      <span style={{ color: 'var(--ink)' }}>UI</span>
    </span>
  );
}

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
      className="mb-0.5 flex items-center gap-3 px-3 py-2 text-[0.875rem] transition-colors duration-150"
      style={{
        color: active ? 'var(--ink)' : 'var(--ink-soft)',
        background: active ? 'var(--paper-sunk)' : 'transparent',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        fontWeight: active ? 500 : 400,
      }}
    >
      <Icon
        size={16}
        strokeWidth={1.5}
        style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)' }}
      />
      {item.label}
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-2 px-3 text-[0.6875rem] uppercase"
      style={{
        fontFamily: 'var(--font-mono-editorial)',
        color: 'var(--ink-muted)',
        letterSpacing: '0.12em',
      }}
    >
      {children}
    </div>
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
    <nav
      className="flex h-full w-60 flex-col"
      style={{
        background: 'var(--paper-deep)',
        borderRight: '1px solid var(--rule)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center px-4"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <Link href="/dashboard" aria-label="AIUI dashboard">
          <EditorialMark />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <SectionLabel>Main</SectionLabel>
        {mainItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={!!pathname?.startsWith(item.href)}
            onClose={onClose}
          />
        ))}

        <div className="mt-6">
          <SectionLabel>Design</SectionLabel>
        </div>
        {designItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={!!pathname?.startsWith(item.href)}
            onClose={onClose}
          />
        ))}

        <div className="mt-6">
          <SectionLabel>Integration</SectionLabel>
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
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--rule)' }}>
        {userEmail && (
          <p
            className="mb-2 truncate px-2 text-[0.75rem]"
            style={{
              fontFamily: 'var(--font-mono-editorial)',
              color: 'var(--ink-muted)',
            }}
          >
            {userEmail}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1.5 text-[0.75rem] transition-colors"
            style={{ color: 'var(--ink-soft)' }}
          >
            <User size={14} strokeWidth={1.5} />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-2 py-1.5 text-[0.75rem] transition-colors"
            style={{ color: 'var(--ink-soft)' }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center gap-1 px-2 text-[0.75rem] transition-colors"
          style={{ color: 'var(--ink-muted)' }}
        >
          <ExternalLink size={12} strokeWidth={1.5} />
          aiui.store
        </Link>
      </div>
    </nav>
  );
}
