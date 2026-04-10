'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KeyRound, Terminal, Sparkles, CheckCircle2, Circle, Copy, Check, X } from 'lucide-react';
import { getActiveOrgId } from '@/lib/session';

interface McpWalkthroughProps {
  hasApiKey: boolean;
  hasProject: boolean;
}

const DISMISSED_KEY = 'aiui-mcp-walkthrough-dismissed';
const STEP_KEY_PREFIX = 'aiui-mcp-walkthrough-step-';
const TOTAL_STEPS = 5;
const POLL_INTERVAL_MS = 15_000;

const INIT_SNIPPET = 'init_project { slug: "my-app", targetDir: "/absolute/path/to/your/repo" }';

export function McpWalkthrough({ hasApiKey, hasProject }: McpWalkthroughProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash
  const [manualDone, setManualDone] = useState<boolean[]>(() => Array(TOTAL_STEPS).fill(false));
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [liveHasProject, setLiveHasProject] = useState<boolean>(hasProject);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === 'true');
    const next: boolean[] = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      next.push(sessionStorage.getItem(`${STEP_KEY_PREFIX}${i}`) === 'true');
    }
    setManualDone(next);
    setHydrated(true);
  }, []);

  // Poll /api/projects to detect when the user's first init_project lands
  // from their editor, so step 3 auto-ticks without a page refresh. Stops
  // polling the moment a project is found or the walkthrough is dismissed.
  useEffect(() => {
    if (!hydrated || dismissed || liveHasProject) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const orgId = getActiveOrgId();
        if (!orgId) {
          timer = setTimeout(tick, POLL_INTERVAL_MS);
          return;
        }
        const res = await fetch(`/api/projects?orgId=${encodeURIComponent(orgId)}&limit=1`, {
          credentials: 'same-origin',
        });
        if (!cancelled && res.ok) {
          const body = (await res.json()) as { total?: number };
          if ((body.total ?? 0) > 0) {
            setLiveHasProject(true);
            return;
          }
        }
      } catch {
        /* non-blocking */
      }
      if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [hydrated, dismissed, liveHasProject]);

  const isStepDone = (index: number): boolean => {
    if (index === 0 && hasApiKey) return true;
    if (index === 2 && liveHasProject) return true;
    return manualDone[index] ?? false;
  };

  const completedCount = Array.from({ length: TOTAL_STEPS }, (_, i) => isStepDone(i)).filter(
    Boolean
  ).length;
  const allDone = completedCount === TOTAL_STEPS;

  if (!hydrated || dismissed || allDone) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  const toggleStep = (index: number) => {
    const next = [...manualDone];
    next[index] = !next[index];
    setManualDone(next);
    sessionStorage.setItem(`${STEP_KEY_PREFIX}${index + 1}`, String(next[index]));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INIT_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">MCP Walkthrough</h3>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Go from zero to an AI coding agent that respects your design tokens.{' '}
            <span className="text-zinc-400">
              {completedCount}/{TOTAL_STEPS} complete
            </span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          aria-label="Dismiss MCP walkthrough"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${(completedCount / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <ol className="mt-4 space-y-3">
        {/* Step 1 */}
        <StepCard
          index={0}
          done={isStepDone(0)}
          title="Create an API key"
          description="Head to API Keys and create a new key."
          onToggle={toggleStep}
          autoDone={hasApiKey}
          icon={<KeyRound size={16} className="text-indigo-400" />}
        >
          <Link
            href="/api-keys"
            className="inline-flex items-center rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20 transition-colors hover:bg-indigo-500/20"
          >
            Go to API Keys
          </Link>
        </StepCard>

        {/* Step 2 */}
        <StepCard
          index={1}
          done={isStepDone(1)}
          title="Copy your MCP client config"
          description="After you create a key, the API Keys page shows ready-to-paste snippets for Claude Code, Cursor, VS Code, and Windsurf. Pick your editor's snippet and paste it into the config."
          onToggle={toggleStep}
          icon={<Terminal size={16} className="text-violet-400" />}
        >
          <Link
            href="/api-keys"
            className="inline-flex items-center rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 ring-1 ring-inset ring-violet-500/20 transition-colors hover:bg-violet-500/20"
          >
            View config snippets
          </Link>
        </StepCard>

        {/* Step 3 */}
        <StepCard
          index={2}
          done={isStepDone(2)}
          title="Initialize your project from your editor"
          description="Your MCP client (Claude Code, Cursor, etc.) calls this tool. It creates your project in the dashboard, seeds it with shadcn/ui Essentials tokens, and writes .aiui/design-memory.md into your repo."
          onToggle={toggleStep}
          autoDone={liveHasProject}
          icon={<Terminal size={16} className="text-emerald-400" />}
        >
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-xs text-zinc-300 font-mono whitespace-nowrap">
              {INIT_SNIPPET}
            </code>
            <button
              onClick={handleCopy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10"
              aria-label="Copy init_project snippet"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
        </StepCard>

        {/* Step 4 */}
        <StepCard
          index={3}
          done={isStepDone(3)}
          title="Verify .aiui/ appeared in your repo"
          description="Check that .aiui/design-memory.md, tokens.json, and project.json exist in the directory you passed. Claude will now load them via CLAUDE.md on every conversation."
          onToggle={toggleStep}
          icon={<CheckCircle2 size={16} className="text-amber-400" />}
        />

        {/* Step 5 */}
        <StepCard
          index={4}
          done={isStepDone(4)}
          title="Make an edit and watch it flow"
          description="Edit a token from the dashboard or call update_tokens from your editor. Run sync_design_memory to refresh the local files, or see the staleWarning field on the next read call."
          onToggle={toggleStep}
          icon={<Sparkles size={16} className="text-pink-400" />}
        >
          <Link
            href="/projects"
            className="inline-flex items-center rounded-lg bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-300 ring-1 ring-inset ring-pink-500/20 transition-colors hover:bg-pink-500/20"
          >
            Go to Projects
          </Link>
        </StepCard>
      </ol>
    </div>
  );
}

interface StepCardProps {
  index: number;
  done: boolean;
  title: string;
  description: string;
  onToggle: (index: number) => void;
  autoDone?: boolean;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

function StepCard({
  index,
  done,
  title,
  description,
  onToggle,
  autoDone,
  icon,
  children,
}: StepCardProps) {
  return (
    <li className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3">
      <div className="flex items-start gap-3">
        <button
          onClick={() => !autoDone && onToggle(index)}
          disabled={autoDone}
          className="mt-0.5 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed"
          aria-label={
            done ? `Mark step ${index + 1} as not done` : `Mark step ${index + 1} as done`
          }
        >
          {done ? (
            <CheckCircle2 size={18} className="text-indigo-400" />
          ) : (
            <Circle size={18} className="text-zinc-600 hover:text-zinc-400" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <h4
              className={`text-sm font-semibold ${done ? 'text-zinc-500 line-through' : 'text-white'}`}
            >
              {index + 1}. {title}
            </h4>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
          {children && <div className="mt-3">{children}</div>}
          {!autoDone && (
            <button
              onClick={() => onToggle(index)}
              className="mt-3 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {done ? 'Mark not done' : 'Mark done'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
