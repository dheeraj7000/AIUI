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
    <div className="flex items-center gap-1.5 text-[0.875rem]" style={{ color: 'var(--ink-soft)' }}>
      {segments.map((segment, i) => {
        const label = labels[segment] || segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: 'var(--ink-faint)' }}>/</span>}
            <span
              style={{
                color: isLast ? 'var(--ink)' : 'var(--ink-soft)',
                fontWeight: isLast ? 500 : 400,
              }}
            >
              {label}
            </span>
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

  const dropdownItemStyle = { color: 'var(--ink-soft)' } as React.CSSProperties;

  return (
    <header
      className="relative z-30 flex h-14 items-center justify-between px-4"
      style={{
        background: 'var(--paper)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 transition-colors md:hidden"
          style={{ color: 'var(--ink-soft)' }}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-label="User menu"
          className="flex h-8 w-8 items-center justify-center text-[0.8125rem] font-semibold transition-colors"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: '50%',
          }}
        >
          {userInitial}
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 z-50 w-56 max-w-[calc(100vw-2rem)] overflow-hidden"
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--rule-strong)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.18)',
            }}
          >
            {userEmail && (
              <div
                className="truncate px-3 py-2.5 text-[0.75rem]"
                style={{
                  borderBottom: '1px solid var(--rule)',
                  color: 'var(--ink-muted)',
                  fontFamily: 'var(--font-mono-editorial)',
                }}
              >
                {userEmail}
              </div>
            )}

            <div className="p-1">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[0.875rem] transition-colors"
                style={dropdownItemStyle}
              >
                <User size={14} strokeWidth={1.5} />
                Profile
              </Link>
              <Link
                href="/api-keys"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[0.875rem] transition-colors"
                style={dropdownItemStyle}
              >
                <Key size={14} strokeWidth={1.5} />
                API Keys
              </Link>
            </div>

            <div style={{ borderTop: '1px solid var(--rule)' }} />

            <div className="p-1">
              <Link
                href="/"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[0.875rem] transition-colors"
                style={dropdownItemStyle}
              >
                <ExternalLink size={14} strokeWidth={1.5} />
                Back to Home
              </Link>
            </div>

            <div style={{ borderTop: '1px solid var(--rule)' }} />

            <div className="p-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-[0.875rem] transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
