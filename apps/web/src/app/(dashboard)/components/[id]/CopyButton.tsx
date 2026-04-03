'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
    >
      {copied ? (
        <>
          <Check size={13} />
          Copied
        </>
      ) : (
        <>
          <Copy size={13} />
          Copy
        </>
      )}
    </button>
  );
}
