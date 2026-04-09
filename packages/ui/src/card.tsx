import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to use a dashed border (for empty states) */
  dashed?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ dashed = false, className = '', children, ...props }, ref) => {
    const borderClass = dashed ? 'border-dashed border-zinc-700' : 'border-zinc-800';

    return (
      <div
        ref={ref}
        className={`rounded-xl border ${borderClass} bg-zinc-900 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`px-5 pt-5 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-5 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Standard label styling for use inside cards/forms.
 */
export function Label({ children, className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`text-sm font-medium text-zinc-400 ${className}`} {...props}>
      {children}
    </span>
  );
}
