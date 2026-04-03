import * as React from 'react';
import { cn } from '../../lib/utils';
import { IconBadge } from '../atoms/icon-badge';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon element */
  icon: React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Icon badge color variant */
  iconVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  /** Enable a subtle gradient background */
  gradient?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconVariant = 'default',
  gradient = false,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 p-6 transition-all hover:-translate-y-1 hover:shadow-lg',
        gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white',
        className
      )}
      {...props}
    >
      <IconBadge variant={iconVariant} size="md">
        {icon}
      </IconBadge>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
