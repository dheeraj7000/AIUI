import * as React from 'react';
import { cn } from '../lib/utils';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({ title, description, actions, children }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-6 py-8')}>
      {(title || description || actions) && (
        <div className={cn('mb-8 flex items-start justify-between')}>
          <div>
            {title && (
              <h1 className={cn('text-2xl font-bold tracking-tight text-gray-900')}>{title}</h1>
            )}
            {description && <p className={cn('mt-1 text-sm text-gray-500')}>{description}</p>}
          </div>
          {actions && <div className={cn('flex items-center gap-2')}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
