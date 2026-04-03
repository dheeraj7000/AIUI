import * as React from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon element to display */
  icon: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action element (e.g. a Button) */
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
