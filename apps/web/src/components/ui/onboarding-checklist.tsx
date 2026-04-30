'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, X, FolderOpen, Key, Download } from 'lucide-react';

interface OnboardingStep {
  label: string;
  href: string;
  icon: typeof FolderOpen;
  done: boolean;
}

interface OnboardingChecklistProps {
  hasProject: boolean;
  hasApiKey: boolean;
}

const DISMISSED_KEY = 'aiui-onboarding-dismissed';

/**
 * Fire-and-forget PATCH to /api/onboarding. Failures are swallowed so the
 * UI stays responsive even offline — sessionStorage keeps local state in
 * sync until the next successful request.
 */
function patchOnboarding(patch: Record<string, unknown>): void {
  fetch('/api/onboarding', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }).catch(() => {
    /* non-blocking */
  });
}

export function OnboardingChecklist({ hasProject, hasApiKey }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    // Migrate from localStorage (permanent) to sessionStorage (per-session)
    localStorage.removeItem(DISMISSED_KEY);

    // Optimistic hydration from sessionStorage so we don't flash on reload.
    const localDismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';
    setDismissed(localDismissed);

    // Prefer the server's durable state. If the fetch fails we keep the
    // sessionStorage-derived value so the UI still works offline.
    let cancelled = false;
    fetch('/api/onboarding', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const state = data.onboardingState ?? {};
        if (state.checklistDismissedAt) {
          setDismissed(true);
          sessionStorage.setItem(DISMISSED_KEY, 'true');
        }
      })
      .catch(() => {
        /* keep local value */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const steps: OnboardingStep[] = [
    { label: 'Create a project', href: '/projects', icon: FolderOpen, done: hasProject },
    { label: 'Import design tokens', href: '/import', icon: Download, done: hasProject },
    { label: 'Generate an API key', href: '/api-keys', icon: Key, done: hasApiKey },
  ];

  // Mirror the prop-derived "done" flags into the durable server state so
  // other surfaces (other tabs, future refactors, analytics) can read a
  // single source of truth.
  useEffect(() => {
    patchOnboarding({
      checklistSteps: {
        project_created: hasProject,
        api_key_created: hasApiKey,
      },
    });
  }, [hasProject, hasApiKey]);

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
    patchOnboarding({ checklistDismissedAt: new Date().toISOString() });
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Getting Started</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {completedCount}/{steps.length} complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          aria-label="Dismiss onboarding checklist"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.label}
              href={step.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                step.done ? 'text-zinc-500' : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              {step.done ? (
                <CheckCircle2 size={16} className="text-indigo-400" />
              ) : (
                <Circle size={16} className="text-zinc-600" />
              )}
              <Icon size={16} className={step.done ? 'text-zinc-600' : 'text-zinc-400'} />
              <span className={step.done ? 'line-through' : ''}>{step.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
