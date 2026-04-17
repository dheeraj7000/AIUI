'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StylePack {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  version: string;
  tokenCount: number;
  recipeCount: number;
}

interface Recipe {
  id: string;
  name: string;
  slug: string;
  type: string;
  stylePackId: string | null;
  aiUsageRules: string | null;
  packName: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface StudioClientProps {
  packs: StylePack[];
  recipes: Recipe[];
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

type Step = 'auth' | 'project' | 'style-pack' | 'components' | 'done';

const categoryColors: Record<string, string> = {
  saas: 'border-blue-300 bg-blue-50',
  fintech: 'border-emerald-300 bg-emerald-50',
  startup: 'border-purple-300 bg-purple-50',
  'ui-library': 'border-orange-300 bg-orange-50',
  animations: 'border-pink-300 bg-pink-50',
  creative: 'border-cyan-300 bg-cyan-50',
};

const typeColors: Record<string, string> = {
  hero: 'bg-violet-100 text-violet-800',
  cta: 'bg-rose-100 text-rose-800',
  card: 'bg-orange-100 text-orange-800',
  feature: 'bg-indigo-100 text-indigo-800',
  contact: 'bg-teal-100 text-teal-800',
  faq: 'bg-amber-100 text-amber-800',
  footer: 'bg-gray-200 text-gray-800',
  header: 'bg-blue-100 text-blue-800',
  testimonial: 'bg-cyan-100 text-cyan-800',
  pricing: 'bg-green-100 text-green-800',
  navigation: 'bg-sky-100 text-sky-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StudioClient({ packs, recipes }: StudioClientProps) {
  const searchParams = useSearchParams();
  const { user, session, signIn, signUp } = useAuth();

  // State
  const [step, setStep] = useState<Step>('auth');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [newProjectName, setNewProjectName] = useState(searchParams.get('name') ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [hasDraft, setHasDraft] = useState(false);

  // Debounced autosave for Design Studio drafts. Stored server-side so a
  // user who closes the tab can resume on next open. Fire-and-forget — a
  // failed PUT must never break the UI.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Suppress the first autosave after hydrating from the server, so we
  // don't immediately overwrite the draft we just loaded.
  const skipNextSaveRef = useRef(false);

  // Auth form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Derived
  const projectSlug = searchParams.get('project');
  const allTypes = useMemo(() => ['All', ...new Set(recipes.map((r) => r.type))], [recipes]);
  const filteredRecipes = useMemo(
    () => (typeFilter === 'All' ? recipes : recipes.filter((r) => r.type === typeFilter)),
    [recipes, typeFilter]
  );

  // Setup org + projects after auth
  const setupOrg = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrgId(data.orgId);
        setProjects(data.projects);

        // Auto-select project if slug matches
        if (projectSlug) {
          const match = data.projects.find((p: Project) => p.slug === projectSlug);
          if (match) {
            setSelectedProject(match);
            setStep('style-pack');
            await loadProjectState(match.id);
            return;
          }
        }
        setStep('project');
      }
    } catch {
      setError('Failed to load workspace');
    }
  }, [user, projectSlug]);

  useEffect(() => {
    if (user && session) {
      setupOrg();
    }
  }, [user, session, setupOrg]);

  // Debounced draft autosave (500ms). Only runs once a project is selected.
  // Not fired on `step === 'done'` — once saved for real, the draft is
  // cleared explicitly below.
  useEffect(() => {
    if (!selectedProject || !session) return;
    if (step === 'auth' || step === 'project' || step === 'done') return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const body = {
        packId: selectedPackId,
        selectedComponentIds: [...selectedRecipeIds],
      };
      fetch(`/api/projects/${selectedProject.id}/studio-draft`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (res.ok) setHasDraft(true);
        })
        .catch(() => {
          // Intentional no-op — autosave failures must not disrupt the UI.
        });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [selectedPackId, selectedRecipeIds, selectedProject, session, step]);

  // Clear the server-side draft. Resets the in-memory edits too so the
  // user sees the wizard in its persisted state.
  const clearDraft = useCallback(async () => {
    if (!selectedProject || !session) return;
    // Cancel any pending autosave so it doesn't resurrect the draft we're
    // about to delete.
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    skipNextSaveRef.current = true;
    setSelectedPackId(null);
    setSelectedRecipeIds(new Set());
    setHasDraft(false);
    try {
      await fetch(`/api/projects/${selectedProject.id}/studio-draft`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch {
      // Fire-and-forget — local state is already reset.
    }
  }, [selectedProject, session]);

  // Load existing project state (style pack + components). Draft takes
  // precedence over persisted config — it represents the user's in-flight
  // edits from a previous studio session.
  const loadProjectState = async (projectId: string) => {
    if (!session) return;
    try {
      // Load style pack
      const packRes = await fetch(`/api/projects/${projectId}/style-pack`, {
        credentials: 'same-origin',
      });
      if (packRes.ok) {
        const data = await packRes.json();
        if (data.stylePackId) setSelectedPackId(data.stylePackId);
      }

      // Load components
      const compRes = await fetch(`/api/projects/${projectId}/components`, {
        credentials: 'same-origin',
      });
      if (compRes.ok) {
        const data = await compRes.json();
        const items = Array.isArray(data) ? data : [];
        setSelectedRecipeIds(new Set(items.map((c: { id: string }) => c.id)));
      }

      // Hydrate unsaved draft last so it overrides persisted state.
      const draftRes = await fetch(`/api/projects/${projectId}/studio-draft`, {
        credentials: 'same-origin',
      });
      if (draftRes.ok) {
        const draft = (await draftRes.json()) as {
          packId?: string;
          selectedComponentIds?: string[];
        };
        if (draft.packId) setSelectedPackId(draft.packId);
        if (Array.isArray(draft.selectedComponentIds)) {
          setSelectedRecipeIds(new Set(draft.selectedComponentIds));
        }
        setHasDraft(true);
        // Skip the next autosave — state just came from the server and
        // doesn't represent a user edit.
        skipNextSaveRef.current = true;
      }
      // 404 (no draft) is fine — we keep the persisted state.
    } catch {
      // Ignore — start fresh
    }
  };

  // Auth handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Create project
  const createProject = async () => {
    if (!newProjectName.trim() || !orgId || !session) return;
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, name: newProjectName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create project');
        return;
      }
      const project = await res.json();
      setSelectedProject(project);
      setStep('style-pack');
    } catch {
      setError('Failed to create project');
    }
  };

  // Select existing project
  const selectProject = async (p: Project) => {
    setSelectedProject(p);
    await loadProjectState(p.id);
    setStep('style-pack');
  };

  // Toggle recipe selection
  const toggleRecipe = (id: string) => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all components from a pack
  const selectAllFromPack = (packId: string) => {
    const packRecipes = recipes.filter((r) => r.stylePackId === packId);
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      packRecipes.forEach((r) => next.add(r.id));
      return next;
    });
  };

  // Save everything
  const handleSave = async () => {
    if (!selectedProject || !session) return;
    setSaving(true);
    setError(null);
    try {
      // Apply style pack
      if (selectedPackId) {
        const res = await fetch(`/api/projects/${selectedProject.id}/style-pack`, {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stylePackId: selectedPackId }),
        });
        if (!res.ok) throw new Error('Failed to apply style pack');
      }

      // Save components
      const res = await fetch(`/api/projects/${selectedProject.id}/components`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentRecipeIds: [...selectedRecipeIds] }),
      });
      if (!res.ok) throw new Error('Failed to save components');

      // Persisted successfully — clear the in-flight draft. Fire-and-forget.
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      fetch(`/api/projects/${selectedProject.id}/studio-draft`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
        .then(() => setHasDraft(false))
        .catch(() => {
          // Intentional no-op — draft cleanup failure is not user-facing.
        });

      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-xl font-bold text-gray-900">
              AIUI
            </a>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-600">Design Studio</span>
          </div>
          {selectedProject && (
            <div className="flex items-center gap-2">
              {hasDraft && step !== 'done' && (
                <button
                  onClick={clearDraft}
                  title="Discard unsaved draft and reset the wizard"
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Clear draft
                </button>
              )}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {selectedProject.name}
              </span>
            </div>
          )}
        </div>
        {/* Progress */}
        <div className="mx-auto max-w-6xl px-6 pb-4">
          <div className="flex gap-1">
            {['auth', 'project', 'style-pack', 'components', 'done'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= ['auth', 'project', 'style-pack', 'components', 'done'].indexOf(step)
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STEP: Auth */}
        {step === 'auth' && !user && (
          <div className="mx-auto max-w-sm">
            <h1 className="text-center text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create an account' : 'Sign in to continue'}
            </h1>
            <form onSubmit={handleAuth} className="mt-8 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {authLoading ? '...' : isSignUp ? 'Sign up' : 'Sign in'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        )}

        {/* STEP: Project */}
        {step === 'project' && (
          <div className="mx-auto max-w-lg">
            <h1 className="text-2xl font-bold text-gray-900">Select or create a project</h1>
            <p className="mt-2 text-sm text-gray-500">
              Each project has its own design system — style pack, components, and tokens.
            </p>

            {projects.length > 0 && (
              <div className="mt-6 space-y-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProject(p)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-blue-300 hover:shadow-sm"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">/{p.slug}</div>
                    </div>
                    <span className="text-sm text-blue-600">Configure</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold text-gray-700">New project</h2>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  placeholder="Project name"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Style Pack */}
        {step === 'style-pack' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Choose a style pack</h1>
                <p className="mt-1 text-sm text-gray-500">
                  This defines your color palette, typography, spacing, and shadows.
                </p>
              </div>
              <button
                onClick={() => setStep('components')}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {selectedPackId ? 'Next: Components' : 'Skip'}
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id === selectedPackId ? null : pack.id)}
                  className={`rounded-xl border-2 p-5 text-left transition-all ${
                    selectedPackId === pack.id
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                      : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm`
                  }`}
                >
                  <div
                    className={`mb-3 flex h-20 items-center justify-center rounded-lg ${categoryColors[pack.category] ?? 'bg-gray-50 border border-gray-200'}`}
                  >
                    <span className="text-xs font-medium text-gray-500">{pack.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{pack.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{pack.description}</p>
                  <div className="mt-2 flex gap-2 text-xs text-gray-400">
                    <span>{pack.tokenCount} tokens</span>
                    <span>{pack.recipeCount} components</span>
                  </div>
                  {selectedPackId === pack.id && (
                    <div className="mt-2 text-xs font-medium text-blue-600">Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: Components */}
        {step === 'components' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pick components</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRecipeIds.size} selected — these become Claude&apos;s building blocks.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('style-pack')}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Save & Finish (${selectedRecipeIds.size})`}
                </button>
              </div>
            </div>

            {/* Quick-add by pack */}
            {selectedPackId && (
              <div className="mt-4">
                <button
                  onClick={() => selectAllFromPack(selectedPackId)}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  + Add all from {packs.find((p) => p.id === selectedPackId)?.name}
                </button>
              </div>
            )}

            {/* Type filter */}
            <div className="mt-4 flex flex-wrap gap-2">
              {allTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    typeFilter === t
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Component grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((r) => {
                const selected = selectedRecipeIds.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRecipe(r.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.type] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {r.type}
                      </span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 text-xs ${
                          selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {selected && '\u2713'}
                      </div>
                    </div>
                    <h3 className="mt-2 font-medium text-gray-900">{r.name}</h3>
                    {r.packName && <p className="text-xs text-gray-400">{r.packName}</p>}
                    {r.aiUsageRules && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{r.aiUsageRules}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && selectedProject && (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              \u2713
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Design system configured!</h1>
            <p className="mt-2 text-gray-500">
              <strong>{selectedProject.name}</strong> now has{' '}
              {selectedPackId ? packs.find((p) => p.id === selectedPackId)?.name : 'no style pack'}{' '}
              and {selectedRecipeIds.size} components.
            </p>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left">
              <h2 className="text-sm font-semibold text-gray-900">
                Now go back to Claude and say:
              </h2>
              <div className="mt-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-gray-200">
                &quot;Sync the AIUI design memory for{' '}
                <span className="text-blue-400">{selectedProject.slug}</span> to this project&quot;
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Claude will call{' '}
                <code className="rounded bg-gray-100 px-1">sync_design_memory</code> to generate{' '}
                <code className="rounded bg-gray-100 px-1">.aiui/design-memory.md</code> with your
                tokens, components, and rules.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <a
                href={`/projects/${selectedProject.slug}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View project
              </a>
              <button
                onClick={() => {
                  setStep('style-pack');
                  setError(null);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit design
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
