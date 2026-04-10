'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, X, Palette, FolderOpen, Key, LayoutGrid } from 'lucide-react';

interface OnboardingStep {
  label: string;
  href: string;
  icon: typeof Palette;
  done: boolean;
}

interface OnboardingChecklistProps {
  hasProject: boolean;
  hasStylePack: boolean;
  hasApiKey: boolean;
  hasComponent: boolean;
}

const DISMISSED_KEY = 'aiui-onboarding-dismissed';

export function OnboardingChecklist({
  hasProject,
  hasStylePack,
  hasApiKey,
  hasComponent,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    // Migrate from localStorage (permanent) to sessionStorage (per-session)
    localStorage.removeItem(DISMISSED_KEY);
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === 'true');
  }, []);

  const steps: OnboardingStep[] = [
    { label: 'Browse style packs', href: '/style-packs', icon: Palette, done: hasStylePack },
    { label: 'Create a project', href: '/projects', icon: FolderOpen, done: hasProject },
    { label: 'Add components', href: '/components', icon: LayoutGrid, done: hasComponent },
    { label: 'Generate an API key', href: '/api-keys', icon: Key, done: hasApiKey },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
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
