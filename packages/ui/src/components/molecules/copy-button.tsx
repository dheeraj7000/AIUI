'use client';

import * as React from 'react';
import { Check, Clipboard } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The text value to copy to clipboard */
  value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        className
      )}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      {...props}
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Clipboard className="h-4 w-4" />}
    </button>
  );
}
