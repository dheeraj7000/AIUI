import * as React from 'react';
import { useState } from 'react';

const NAV_LINKS = ['Dashboard', 'Projects', 'Reports', 'Team', 'Settings'];

export default function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav aria-label="Primary" className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-bold text-foreground">
          Acme
        </a>

        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className={[
                'px-3 py-2 text-sm rounded-md',
                i === 0 ? 'bg-muted text-primary font-semibold' : 'text-foreground hover:bg-muted',
              ].join(' ')}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block relative">
            <input
              type="search"
              aria-label="Search"
              placeholder="Search…"
              className="w-56 px-3 py-2 text-sm bg-muted border border-border rounded-md focus:bg-background focus:border-primary outline-none"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications (3 unread)"
            className="relative w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center text-foreground"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full bg-primary text-background text-xs font-bold flex items-center justify-center"
            >
              DK
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 bg-background border border-border rounded-md py-2"
              >
                {['Profile', 'Settings', 'Sign out'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            className="md:hidden w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center text-foreground"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
