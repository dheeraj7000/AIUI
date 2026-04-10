'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, User, LogOut, ExternalLink, Key } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

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
    profile: 'Profile',
  };

  return (
    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
      {segments.map((segment, i) => {
        const label = labels[segment] || segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-700">/</span>}
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
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email ?? '';
  const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  return (
    <header className="relative z-30 flex h-14 items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-400 transition-all duration-200 hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-label="User menu"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/20"
        >
          {userInitial}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40">
            {userEmail && (
              <div className="truncate border-b border-white/5 px-3 py-2.5 text-xs text-zinc-500">
                {userEmail}
              </div>
            )}

            <div className="p-1">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <User size={16} />
                Profile
              </Link>
              <Link
                href="/api-keys"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Key size={16} />
                API Keys
              </Link>
            </div>

            <div className="border-t border-white/5" />

            <div className="p-1">
              <Link
                href="/"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ExternalLink size={16} />
                Back to Home
              </Link>
            </div>

            <div className="border-t border-white/5" />

            <div className="p-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
