'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The code string to display */
  code: string;
  /** Programming language label */
  language?: string;
  /** Show a copy-to-clipboard button */
  copyable?: boolean;
}

export function CodeBlock({
  code,
  language,
  copyable = false,
  className,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <div className={cn('relative rounded-lg bg-gray-900 text-sm', className)} {...props}>
      {(language || copyable) && (
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
          {language && <span className="text-xs font-medium text-gray-400">{language}</span>}
          {!language && <span />}
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200'
              )}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-gray-100">{code}</code>
      </pre>
    </div>
  );
}
