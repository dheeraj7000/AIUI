'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="editorial editorial-app flex h-screen" style={{ background: 'var(--paper)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 transition-opacity duration-300"
            style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 transition-transform duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="relative flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--paper)' }}
        >
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
