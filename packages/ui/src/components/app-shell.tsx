import * as React from 'react';
import { cn } from '../lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps) {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden')}>
      {sidebar && (
        <aside className={cn('w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50')}>
          {sidebar}
        </aside>
      )}
      <div className={cn('flex flex-1 flex-col overflow-hidden')}>
        {header && <div className={cn('flex-shrink-0')}>{header}</div>}
        <main className={cn('flex-1 overflow-auto')}>{children}</main>
      </div>
    </div>
  );
}
