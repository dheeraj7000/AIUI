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
  codeTemplate?: string;
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

type Step = 'auth' | 'project' | 'shape' | 'style-pack' | 'components' | 'done';

// Palettes for the "shape" discovery step. Kept local — these are copy,
// not design tokens, so they don't belong in the design system.
const EMOTION_CHIPS = [
  'control',
  'delight',
  'trust',
  'calm',
  'speed',
  'power',
  'clarity',
  'warmth',
  'focus',
  'fun',
  'confidence',
  'surprise',
] as const;

const PERSONALITY_SUGGESTIONS = [
  'calm',
  'exacting',
  'playful',
  'bold',
  'warm',
  'precise',
  'raw',
  'refined',
  'mature',
  'energetic',
  'serious',
  'inviting',
] as const;

const ANTI_REFERENCE_OPTIONS = [
  'generic AI SaaS',
  'dark mode with purple glow',
  'dashboard template',
  'Linear clone',
  'Vercel clone',
  'shadcn default',
  'cyan-on-dark',
  'neon',
] as const;

interface ShapeState {
  audience: string;
  jobToBeDone: string;
  emotionAfterUse: string[];
  brandPersonality: string[];
  antiReferences: string[];
}

const EMPTY_SHAPE: ShapeState = {
  audience: '',
  jobToBeDone: '',
  emotionAfterUse: [],
  brandPersonality: [],
  antiReferences: [],
};

const categoryColors: Record<string, string> = {
  saas: 'border-blue-300 bg-blue-50',
  fintech: 'border-emerald-300 bg-emerald-50',
  startup: 'border-purple-300 bg-purple-50',
  'ui-library': 'border-orange-300 bg-orange-50',
  animations: 'border-pink-300 bg-pink-50',
  creative: 'border-cyan-300 bg-cyan-50',
};

// ---------------------------------------------------------------------------
// Shape-driven pack recommendation
//
// Takes the user's emotion + personality picks and produces a score per pack
// category. A pack earns points when its category or description contains a
// keyword that maps to the user's selections. Ties are broken by pack name
// so the order stays deterministic for a given shape.
//
// This is intentionally simple: it's a ranking hint, not a classifier. The
// user can still pick any pack — we just surface the best matches first and
// mark them with a "Recommended" chip so the shape questionnaire feels like
// it *does* something instead of being decorative.
// ---------------------------------------------------------------------------

const EMOTION_CATEGORY_BIAS: Record<string, string[]> = {
  control: ['saas', 'fintech', 'ui-library', 'minimal'],
  delight: ['animations', 'creative', 'startup'],
  trust: ['fintech', 'healthcare', 'saas'],
  calm: ['healthcare', 'minimal', 'saas'],
  speed: ['saas', 'startup', 'ai'],
  power: ['fintech', 'saas', 'startup'],
  clarity: ['saas', 'minimal', 'ui-library'],
  warmth: ['healthcare', 'creative', 'ecommerce'],
  focus: ['minimal', 'ui-library', 'saas'],
  fun: ['creative', 'animations', 'startup'],
  confidence: ['fintech', 'saas', 'startup'],
  surprise: ['animations', 'creative'],
};

const PERSONALITY_CATEGORY_BIAS: Record<string, string[]> = {
  calm: ['healthcare', 'minimal', 'saas'],
  exacting: ['fintech', 'minimal', 'ui-library'],
  playful: ['creative', 'animations', 'startup'],
  bold: ['startup', 'creative', 'ai'],
  warm: ['healthcare', 'ecommerce', 'creative'],
  precise: ['fintech', 'minimal', 'saas'],
  raw: ['startup', 'creative'],
  refined: ['minimal', 'fintech', 'saas'],
  mature: ['fintech', 'saas', 'healthcare'],
  energetic: ['startup', 'animations', 'creative'],
  serious: ['fintech', 'minimal', 'healthcare'],
  inviting: ['ecommerce', 'healthcare', 'creative'],
};

function scorePack(
  pack: { category: string; description: string | null; name: string },
  shape: ShapeState
): number {
  let score = 0;
  const haystack = `${pack.category} ${pack.name} ${pack.description ?? ''}`.toLowerCase();
  for (const emo of shape.emotionAfterUse) {
    const prefs = EMOTION_CATEGORY_BIAS[emo] ?? [];
    for (const p of prefs) if (haystack.includes(p)) score += 2;
  }
  for (const pers of shape.brandPersonality) {
    const prefs = PERSONALITY_CATEGORY_BIAS[pers.toLowerCase()] ?? [];
    for (const p of prefs) if (haystack.includes(p)) score += 2;
  }
  // Audience + JTBD free-text hints: match raw substrings (light heuristic).
  const free = `${shape.audience} ${shape.jobToBeDone}`.toLowerCase();
  if (free.includes('finance') || free.includes('bank') || free.includes('fintech')) {
    if (haystack.includes('fintech')) score += 3;
  }
  if (free.includes('health') || free.includes('clinic') || free.includes('medical')) {
    if (haystack.includes('health')) score += 3;
  }
  if (free.includes('shop') || free.includes('commerce') || free.includes('retail')) {
    if (haystack.includes('ecommerce')) score += 3;
  }
  return score;
}

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
  const [shape, setShape] = useState<ShapeState>(EMPTY_SHAPE);
  const [personalityInput, setPersonalityInput] = useState('');
  const [customAntiRef, setCustomAntiRef] = useState('');

  const [activeTokens, setActiveTokens] = useState<Array<{ tokenKey: string; tokenValue: string }>>(
    []
  );
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  // Fetch tokens when pack changes
  useEffect(() => {
    if (!selectedPackId) {
      setActiveTokens([]);
      return;
    }
    fetch(`/api/style-packs/${selectedPackId}/tokens`)
      .then((res) => res.json())
      .then((data) => setActiveTokens(data))
      .catch(() => setActiveTokens([]));
  }, [selectedPackId]);

  const getPreviewCode = (recipe: Recipe) => {
    let code = recipe.codeTemplate || '';
    activeTokens.forEach((t) => {
      const regex = new RegExp(`{{token:${t.tokenKey}}}`, 'g');
      code = code.replace(regex, t.tokenValue);
    });
    // Replace some common variables for demo
    code = code.replace(/{headline}/g, 'Beautiful UI, Controlled by AI');
    code = code.replace(/{subheadline}/g, 'The bridge between your design system and Claude.');
    code = code.replace(/{ctaText}/g, 'Get Started');
    return code;
  };

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
            setStep('shape');
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
      // Only send shape if user has touched it — avoids wiping a saved
      // shape with an empty object on unrelated autosaves.
      const shapeTouched =
        shape.audience.trim() !== '' ||
        shape.jobToBeDone.trim() !== '' ||
        shape.emotionAfterUse.length > 0 ||
        shape.brandPersonality.length > 0 ||
        shape.antiReferences.length > 0;
      const body: Record<string, unknown> = {
        packId: selectedPackId,
        selectedComponentIds: [...selectedRecipeIds],
      };
      if (shapeTouched) {
        body.shape = {
          audience: shape.audience.trim() || undefined,
          jobToBeDone: shape.jobToBeDone.trim() || undefined,
          emotionAfterUse: shape.emotionAfterUse.length > 0 ? shape.emotionAfterUse : undefined,
          brandPersonality: shape.brandPersonality.length > 0 ? shape.brandPersonality : undefined,
          antiReferences: shape.antiReferences.length > 0 ? shape.antiReferences : undefined,
        };
      }
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
  }, [selectedPackId, selectedRecipeIds, selectedProject, session, step, shape]);

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
    setShape(EMPTY_SHAPE);
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
          shape?: Partial<ShapeState>;
        };
        if (draft.packId) setSelectedPackId(draft.packId);
        if (Array.isArray(draft.selectedComponentIds)) {
          setSelectedRecipeIds(new Set(draft.selectedComponentIds));
        }
        if (draft.shape) {
          setShape({
            audience: draft.shape.audience ?? '',
            jobToBeDone: draft.shape.jobToBeDone ?? '',
            emotionAfterUse: Array.isArray(draft.shape.emotionAfterUse)
              ? draft.shape.emotionAfterUse
              : [],
            brandPersonality: Array.isArray(draft.shape.brandPersonality)
              ? draft.shape.brandPersonality
              : [],
            antiReferences: Array.isArray(draft.shape.antiReferences)
              ? draft.shape.antiReferences
              : [],
          });
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
      setStep('shape');
    } catch {
      setError('Failed to create project');
    }
  };

  // Select existing project
  const selectProject = async (p: Project) => {
    setSelectedProject(p);
    await loadProjectState(p.id);
    setStep('shape');
  };

  // Shape step helpers — toggle chips in bounded multi-selects.
  const toggleEmotion = (emotion: string) => {
    setShape((prev) => {
      const has = prev.emotionAfterUse.includes(emotion);
      if (has) {
        return { ...prev, emotionAfterUse: prev.emotionAfterUse.filter((e) => e !== emotion) };
      }
      // Cap at 3 per the brief — silently drop overflow.
      if (prev.emotionAfterUse.length >= 3) return prev;
      return { ...prev, emotionAfterUse: [...prev.emotionAfterUse, emotion] };
    });
  };

  const togglePersonality = (word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setShape((prev) => {
      const has = prev.brandPersonality.includes(w);
      if (has) {
        return { ...prev, brandPersonality: prev.brandPersonality.filter((p) => p !== w) };
      }
      if (prev.brandPersonality.length >= 3) return prev;
      return { ...prev, brandPersonality: [...prev.brandPersonality, w] };
    });
  };

  const toggleAntiRef = (ref: string) => {
    setShape((prev) => {
      const has = prev.antiReferences.includes(ref);
      if (has) {
        return { ...prev, antiReferences: prev.antiReferences.filter((r) => r !== ref) };
      }
      return { ...prev, antiReferences: [...prev.antiReferences, ref] };
    });
  };

  const addCustomAntiRef = () => {
    const v = customAntiRef.trim();
    if (!v) return;
    setShape((prev) =>
      prev.antiReferences.includes(v)
        ? prev
        : { ...prev, antiReferences: [...prev.antiReferences, v] }
    );
    setCustomAntiRef('');
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
            {['auth', 'project', 'shape', 'style-pack', 'components', 'done'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <=
                  ['auth', 'project', 'shape', 'style-pack', 'components', 'done'].indexOf(step)
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

        {/* STEP: Shape — pre-pack discovery interview.
            Captures product intent (audience, JTBD, emotional target,
            brand personality, anti-references) and persists to
            studio_draft.shape. On sync_design_memory, these flow into
            design-memory.md under `## Intent` so Claude reads them on
            every MCP call. Skippable, but "Continue" is the default CTA. */}
        {step === 'shape' && (
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shape the intent</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Answer a few questions so Claude knows what you&apos;re building — not just how it
                  should look. This writes into your design memory.
                </p>
              </div>
              <button
                onClick={() => setStep('style-pack')}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Skip this
              </button>
            </div>

            <div className="mt-8 space-y-8">
              {/* Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  Who is this for?
                </label>
                <p className="text-xs text-gray-500">One sentence. Your audience.</p>
                <input
                  type="text"
                  value={shape.audience}
                  onChange={(e) => setShape((p) => ({ ...p, audience: e.target.value }))}
                  placeholder="e.g. Senior engineers evaluating AI coding tools"
                  maxLength={500}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Job to be done */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  What does your user want to accomplish?
                </label>
                <p className="text-xs text-gray-500">
                  One sentence. The job they&apos;re hiring this for.
                </p>
                <input
                  type="text"
                  value={shape.jobToBeDone}
                  onChange={(e) => setShape((p) => ({ ...p, jobToBeDone: e.target.value }))}
                  placeholder="e.g. Ship a design system their AI agent actually respects"
                  maxLength={500}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Emotion after first use */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  How should they feel after first use?
                </label>
                <p className="text-xs text-gray-500">Pick 3 ({shape.emotionAfterUse.length}/3)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOTION_CHIPS.map((emotion) => {
                    const selected = shape.emotionAfterUse.includes(emotion);
                    const disabled = !selected && shape.emotionAfterUse.length >= 3;
                    return (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => toggleEmotion(emotion)}
                        disabled={disabled}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : disabled
                              ? 'border-gray-200 bg-gray-50 text-gray-300'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {emotion}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand personality */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  Brand personality — pick 3 words
                </label>
                <p className="text-xs text-gray-500">
                  Tap suggestions or type your own ({shape.brandPersonality.length}/3)
                </p>
                {shape.brandPersonality.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shape.brandPersonality.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => togglePersonality(word)}
                        className="rounded-full border border-blue-600 bg-blue-600 px-3 py-1 text-xs font-medium text-white"
                      >
                        {word} \u00d7
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={personalityInput}
                    onChange={(e) => setPersonalityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        togglePersonality(personalityInput);
                        setPersonalityInput('');
                      }
                    }}
                    placeholder="Type a word, hit Enter"
                    maxLength={40}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      togglePersonality(personalityInput);
                      setPersonalityInput('');
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PERSONALITY_SUGGESTIONS.filter((s) => !shape.brandPersonality.includes(s)).map(
                    (word) => {
                      const disabled = shape.brandPersonality.length >= 3;
                      return (
                        <button
                          key={word}
                          type="button"
                          onClick={() => togglePersonality(word)}
                          disabled={disabled}
                          className={`rounded-full border border-dashed px-3 py-1 text-xs ${
                            disabled
                              ? 'border-gray-200 text-gray-300'
                              : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                          }`}
                        >
                          + {word}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Anti-references */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  What do you NOT want this to look like?
                </label>
                <p className="text-xs text-gray-500">Multi-select. Add your own too.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ANTI_REFERENCE_OPTIONS.map((opt) => {
                    const selected = shape.antiReferences.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleAntiRef(opt)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {selected ? '\u2713 ' : ''}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {/* Custom anti-refs already in state but not in preset list */}
                {shape.antiReferences.filter(
                  (r) => !(ANTI_REFERENCE_OPTIONS as readonly string[]).includes(r)
                ).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shape.antiReferences
                      .filter((r) => !(ANTI_REFERENCE_OPTIONS as readonly string[]).includes(r))
                      .map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleAntiRef(r)}
                          className="rounded-full border border-red-600 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                        >
                          {r} \u00d7
                        </button>
                      ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customAntiRef}
                    onChange={(e) => setCustomAntiRef(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAntiRef();
                      }
                    }}
                    placeholder="Custom anti-reference"
                    maxLength={80}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomAntiRef}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3">
              <button
                onClick={() => setStep('style-pack')}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continue
              </button>
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
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('shape')}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('components')}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {selectedPackId ? 'Next: Components' : 'Skip'}
                </button>
              </div>
            </div>

            {(() => {
              // Re-rank packs with the shape-discovery heuristic. The top
              // match (if any) gets a "Recommended" chip; everything else
              // falls back to alphabetical order under the recommendation.
              const scored = packs.map((p) => ({ pack: p, score: scorePack(p, shape) }));
              const maxScore = scored.reduce((m, s) => Math.max(m, s.score), 0);
              scored.sort((a, b) => b.score - a.score || a.pack.name.localeCompare(b.pack.name));
              return (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {scored.map(({ pack, score }) => {
                    const isRecommended = maxScore > 0 && score === maxScore;
                    return (
                      <button
                        key={pack.id}
                        onClick={() =>
                          setSelectedPackId(pack.id === selectedPackId ? null : pack.id)
                        }
                        className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                          selectedPackId === pack.id
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                            : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm`
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Recommended
                          </span>
                        )}
                        <div
                          className={`mb-3 flex h-20 items-center justify-center rounded-lg ${categoryColors[pack.category] ?? 'bg-gray-50 border border-gray-200'}`}
                        >
                          <span className="text-xs font-medium text-gray-500">{pack.category}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{pack.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {pack.description}
                        </p>
                        <div className="mt-2 flex gap-2 text-xs text-gray-400">
                          <span>{pack.tokenCount} tokens</span>
                          <span>{pack.recipeCount} components</span>
                        </div>
                        {selectedPackId === pack.id && (
                          <div className="mt-2 text-xs font-medium text-blue-600">Selected</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP: Components */}
        {step === 'components' && (
          <div className="flex h-[calc(100vh-280px)] flex-col">
            <div className="flex items-center justify-between pb-6">
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

            <div className="flex flex-1 gap-6 overflow-hidden">
              {/* Left: Component List */}
              <div className="w-1/2 overflow-y-auto pr-2">
                {selectedPackId && (
                  <div className="mb-4">
                    <button
                      onClick={() => selectAllFromPack(selectedPackId)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      + Add all from {packs.find((p) => p.id === selectedPackId)?.name}
                    </button>
                  </div>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
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

                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredRecipes.map((r) => {
                    const selected = selectedRecipeIds.has(r.id);
                    return (
                      <div
                        key={r.id}
                        onMouseEnter={() => setPreviewRecipe(r)}
                        className={`group cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => toggleRecipe(r.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.type] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {r.type}
                          </span>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 text-xs ${
                              selected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {selected && '\u2713'}
                          </div>
                        </div>
                        <h3 className="mt-2 font-medium text-gray-900">{r.name}</h3>
                        <p className="mt-1 text-xs text-gray-400">Preview on hover</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Preview Canvas */}
              <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-1">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Live Preview
                    </span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                      <div className="h-2 w-2 rounded-full bg-yellow-400" />
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8">
                    {previewRecipe ? (
                      <div className="mx-auto max-w-4xl">
                        <div
                          className="rounded-lg shadow-sm"
                          dangerouslySetInnerHTML={{ __html: getPreviewCode(previewRecipe) }}
                        />
                        <div className="mt-8 border-t border-gray-100 pt-6">
                          <h4 className="text-sm font-semibold text-gray-900">AI Usage Rules</h4>
                          <p className="mt-2 text-xs leading-relaxed text-gray-500">
                            {previewRecipe.aiUsageRules || 'No special rules defined.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl">✨</div>
                          <p className="mt-2 text-sm">
                            Hover over a component to preview it with your tokens.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  setStep('shape');
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
