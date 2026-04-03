import * as React from 'react';
import { cn } from '../lib/utils';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface HeaderProps {
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function Header({ breadcrumbs, actions }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6'
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className={cn('flex items-center gap-2 text-sm')}>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className={cn('flex items-center gap-2')}>
                {index > 0 && (
                  <span className={cn('text-gray-400')} aria-hidden="true">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className={cn('text-gray-500 transition-colors hover:text-gray-900')}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={cn('font-medium text-gray-900')}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <div />
      )}
      {actions && <div className={cn('flex items-center gap-2')}>{actions}</div>}
    </header>
  );
}
