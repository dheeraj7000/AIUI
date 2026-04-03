import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const iconBadgeVariants = cva('inline-flex items-center justify-center rounded-full', {
  variants: {
    variant: {
      default: 'bg-blue-100 text-blue-600',
      secondary: 'bg-gray-100 text-gray-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-amber-100 text-amber-600',
      destructive: 'bg-red-100 text-red-600',
    },
    size: {
      sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
      md: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
      lg: 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface IconBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof iconBadgeVariants> {
  /** A lucide-react icon element */
  children: React.ReactNode;
}

export function IconBadge({ className, variant, size, children, ...props }: IconBadgeProps) {
  return (
    <span className={cn(iconBadgeVariants({ variant, size, className }))} {...props}>
      {children}
    </span>
  );
}
