import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Hint text displayed below the input (hidden when error is present) */
  hint?: string;
  /** Icon element rendered on the left side of the input */
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('text-sm font-medium text-gray-700')}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
              icon && 'pl-10',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
