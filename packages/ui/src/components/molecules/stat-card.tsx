import * as React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconBadge } from '../atoms/icon-badge';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon element */
  icon: React.ReactNode;
  /** Metric label */
  label: string;
  /** Metric value */
  value: string | number;
  /** Optional trend direction and percentage */
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

export function StatCard({ icon, label, value, trend, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <IconBadge variant="default" size="sm">
          {icon}
        </IconBadge>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
