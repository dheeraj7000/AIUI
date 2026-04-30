import * as React from 'react';
import { useState } from 'react';

const NAV_LINKS = ['Dashboard', 'Projects', 'Reports', 'Team', 'Settings'];

export default function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-[1280px] mx-auto px-[24px] h-[60px] flex items-center justify-between">
        <a
          href="/"
          className="text-[20px] font-bold text-[#111827]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Acme
        </a>

        <div className="hidden md:flex items-center gap-[6px]">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className={[
                'px-[12px] py-[6px] text-[14px] rounded-[6px]',
                i === 0
                  ? 'bg-[#EEF2FF] text-[#4338CA] font-semibold'
                  : 'text-[#374151] hover:bg-[#F3F4F6]',
              ].join(' ')}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-[12px]">
          <div className="hidden sm:block relative">
            <input
              type="search"
              aria-label="Search"
              placeholder="Search…"
              className="w-[220px] px-[12px] py-[7px] text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[7px] focus:bg-white focus:border-[#6366F1] outline-none"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications (3 unread)"
            className="relative w-[36px] h-[36px] rounded-[8px] hover:bg-[#F3F4F6] flex items-center justify-center text-[#374151]"
          >
            <span className="text-[18px]">🔔</span>
            <span className="absolute top-[8px] right-[10px] w-[8px] h-[8px] rounded-full bg-[#EF4444] border-[2px] border-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-[12px] font-bold flex items-center justify-center"
            >
              DK
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-[8px] w-[180px] bg-white border border-[#E5E7EB] rounded-[8px] shadow-[0_8px_24px_rgba(17,24,39,0.12)] py-[6px]"
              >
                {['Profile', 'Settings', 'Sign out'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-[14px] py-[7px] text-[13px] text-[#374151] hover:bg-[#F3F4F6]"
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
            className="md:hidden w-[36px] h-[36px] rounded-[8px] hover:bg-[#F3F4F6] flex items-center justify-center text-[#374151]"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-[16px] py-[10px] flex flex-col gap-[2px]">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="px-[12px] py-[8px] text-[14px] text-[#374151] hover:bg-[#F3F4F6] rounded-[6px]"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
