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
    setDismissed(localStorage.getItem(DISMISSED_KEY) === 'true');
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
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Getting Started</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {completedCount}/{steps.length} complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="Dismiss onboarding checklist"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-lime-500 transition-all duration-500"
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
                step.done ? 'text-zinc-500' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {step.done ? (
                <CheckCircle2 size={16} className="text-lime-400" />
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
