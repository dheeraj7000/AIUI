'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Copy, Check, X } from 'lucide-react';

interface Props {
  projectSlug: string;
  /** Days since last successful sync_design_memory, or null if never synced. */
  daysStale: number | null;
}

const DISMISS_KEY_PREFIX = 'aiui-design-memory-staleness-dismissed-';
const TOOL_NAME = 'sync_design_memory';

export function DesignMemoryStalenessBanner({ projectSlug, daysStale }: Props) {
  const dismissKey = `${DISMISS_KEY_PREFIX}${projectSlug}`;
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(dismissKey) === 'true');
    setHydrated(true);
  }, [dismissKey]);

  if (!hydrated || dismissed) return null;

  const message =
    daysStale === null
      ? "Design memory hasn't been synced yet."
      : `Design memory hasn't been synced in ${daysStale} days.`;

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, 'true');
    setDismissed(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(TOOL_NAME).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
      <div className="flex-1">
        <span>{message}</span>{' '}
        <span className="text-amber-300/80">
          Run{' '}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs text-amber-100 hover:bg-amber-500/30"
            title="Copy tool name"
          >
            <code>{TOOL_NAME}</code>
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>{' '}
          from your editor to refresh.{' '}
          <Link href="/dashboard" className="underline hover:text-amber-100">
            Open walkthrough
          </Link>
        </span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-200"
      >
        <X size={14} />
      </button>
    </div>
  );
}
