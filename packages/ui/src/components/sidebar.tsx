import * as React from 'react';
import { cn } from '../lib/utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  footer?: React.ReactNode;
}

export function Sidebar({ items, footer }: SidebarProps) {
  return (
    <nav className={cn('flex h-full flex-col justify-between')}>
      <ul className={cn('flex flex-col gap-1 p-4')}>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {item.icon && (
                <span className={cn('flex h-5 w-5 items-center justify-center')}>{item.icon}</span>
              )}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
      {footer && <div className={cn('border-t border-gray-200 p-4')}>{footer}</div>}
    </nav>
  );
}
