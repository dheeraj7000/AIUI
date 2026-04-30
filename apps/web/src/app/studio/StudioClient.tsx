'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Project {
  id: string;
  name: string;
  slug: string;
}

type TokenType = 'color' | 'radius' | 'font' | 'spacing' | 'shadow' | 'elevation';

interface Token {
  id: string;
  tokenKey: string;
  tokenType: TokenType;
  tokenValue: string;
  description: string | null;
}

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

// ---------------------------------------------------------------------------
// Static copy
// ---------------------------------------------------------------------------

const TOKEN_TYPE_ORDER: TokenType[] = ['color', 'font', 'spacing', 'radius', 'shadow', 'elevation'];

const TOKEN_TYPE_LABELS: Record<TokenType, string> = {
  color: 'Color',
  font: 'Typography',
  spacing: 'Spacing',
  radius: 'Radius',
  shadow: 'Shadow',
  elevation: 'Elevation',
};

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

// ---------------------------------------------------------------------------
// Editorial style primitives
//
// Every reusable {style} object lives here so JSX stays scannable. The
// underlying CSS variables live in apps/web/src/app/globals.css — keep this
// file in sync with the editorial tokens (paper / ink / accent / rule).
// ---------------------------------------------------------------------------

const styles = {
  page: { background: 'var(--paper)', color: 'var(--ink)' } as CSSProperties,
  shellHeader: {
    borderBottom: '1px solid var(--rule)',
    background: 'var(--paper)',
  } as CSSProperties,
  display: { fontFamily: 'var(--font-display)' } as CSSProperties,
  monoLabel: {
    fontFamily: 'var(--font-mono-editorial)',
    color: 'var(--ink-muted)',
    letterSpacing: '0.12em',
  } as CSSProperties,
  monoMuted: {
    fontFamily: 'var(--font-mono-editorial)',
    color: 'var(--ink-muted)',
  } as CSSProperties,
  monoSoft: { fontFamily: 'var(--font-mono-editorial)', color: 'var(--ink-soft)' } as CSSProperties,
  monoInk: { fontFamily: 'var(--font-mono-editorial)', color: 'var(--ink)' } as CSSProperties,
  inkSoft: { color: 'var(--ink-soft)' } as CSSProperties,
  inkMuted: { color: 'var(--ink-muted)' } as CSSProperties,
  rule: { borderBottom: '1px solid var(--rule)' } as CSSProperties,
  ruleTop: { borderTop: '1px solid var(--rule)' } as CSSProperties,
  errorBox: {
    border: '1px solid var(--rule-strong)',
    background: 'var(--paper-sunk)',
    color: 'var(--ink)',
  } as CSSProperties,
  input: {
    border: '1px solid var(--rule-strong)',
    background: 'var(--paper)',
    color: 'var(--ink)',
  } as CSSProperties,
  buttonPrimary: { background: 'var(--ink)', color: 'var(--paper)' } as CSSProperties,
  buttonGhost: {
    border: '1px solid var(--rule-strong)',
    background: 'var(--paper)',
    color: 'var(--ink)',
  } as CSSProperties,
  card: { border: '1px solid var(--rule)', background: 'var(--paper)' } as CSSProperties,
  cardDeep: { border: '1px solid var(--rule)', background: 'var(--paper-deep)' } as CSSProperties,
  emptyHint: {
    border: '1px dashed var(--rule-strong)',
    color: 'var(--ink-muted)',
  } as CSSProperties,
  codePill: {
    fontFamily: 'var(--font-mono-editorial)',
    background: 'var(--paper-sunk)',
    padding: '2px 6px',
  } as CSSProperties,
  consoleBlock: {
    fontFamily: 'var(--font-mono-editorial)',
    background: 'var(--ink)',
    color: 'var(--paper)',
  } as CSSProperties,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = 'auth' | 'project' | 'shape' | 'tokens' | 'done';
const STEP_ORDER: Step[] = ['auth', 'project', 'shape', 'tokens', 'done'];

export function StudioClient() {
  const searchParams = useSearchParams();
  const { user, session, signIn, signUp } = useAuth();

  // Wizard state
  const [step, setStep] = useState<Step>('auth');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState(searchParams.get('name') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Shape (intent discovery)
  const [shape, setShape] = useState<ShapeState>(EMPTY_SHAPE);
  const [personalityInput, setPersonalityInput] = useState('');
  const [customAntiRef, setCustomAntiRef] = useState('');

  // Tokens (the actual edit surface). `edits` holds per-key drafts —
  // keys absent from `edits` haven't been touched, which lets us highlight
  // dirty rows and PUT only the diff.
  const [tokens, setTokens] = useState<Token[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [tokensLoading, setTokensLoading] = useState(false);

  // Auth form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Debounced shape autosave. Token edits are NOT autosaved — explicit
  // commit prevents shipping half-typed values like "#ff" to the DB.
  const shapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextShapeSaveRef = useRef(false);

  const projectSlug = searchParams.get('project');

  // --- Per-project hydration ----------------------------------------------
  const loadTokens = useCallback(async (projectId: string) => {
    setTokensLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tokens`, { credentials: 'same-origin' });
      if (res.ok) {
        const body = (await res.json()) as { data: Token[] };
        setTokens(body.data ?? []);
        setEdits({});
      } else {
        setTokens([]);
      }
    } catch {
      setTokens([]);
    } finally {
      setTokensLoading(false);
    }
  }, []);

  const loadProjectState = useCallback(
    async (projectId: string) => {
      if (!session) return;
      // Hydrate the shape slice of studio-draft. Pack/recipe slices are
      // gone post-2026-04 cleanup.
      try {
        const draftRes = await fetch(`/api/projects/${projectId}/studio-draft`, {
          credentials: 'same-origin',
        });
        if (draftRes.ok) {
          const draft = (await draftRes.json()) as { shape?: Partial<ShapeState> };
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
            // The shape we just loaded must not immediately autosave back.
            skipNextShapeSaveRef.current = true;
          }
        }
      } catch {
        // 404 (no draft) is fine — start with EMPTY_SHAPE.
      }
      await loadTokens(projectId);
    },
    [session, loadTokens]
  );

  // --- Bootstrap: auth → org → project list -------------------------------
  const setupOrg = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      if (!res.ok) {
        setError('Failed to load workspace');
        return;
      }
      const data = (await res.json()) as { orgId: string; projects: Project[] };
      setOrgId(data.orgId);
      setProjects(data.projects);

      if (projectSlug) {
        const match = data.projects.find((p) => p.slug === projectSlug);
        if (match) {
          setSelectedProject(match);
          setStep('shape');
          await loadProjectState(match.id);
          return;
        }
      }
      setStep('project');
    } catch {
      setError('Failed to load workspace');
    }
  }, [user, projectSlug, loadProjectState]);

  useEffect(() => {
    if (user && session) setupOrg();
  }, [user, session, setupOrg]);

  // --- Shape autosave (debounced) -----------------------------------------
  useEffect(() => {
    if (!selectedProject || !session) return;
    if (step === 'auth' || step === 'project' || step === 'done') return;
    if (skipNextShapeSaveRef.current) {
      skipNextShapeSaveRef.current = false;
      return;
    }

    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    shapeTimerRef.current = setTimeout(() => {
      const touched =
        shape.audience.trim() !== '' ||
        shape.jobToBeDone.trim() !== '' ||
        shape.emotionAfterUse.length > 0 ||
        shape.brandPersonality.length > 0 ||
        shape.antiReferences.length > 0;
      if (!touched) return;

      fetch(`/api/projects/${selectedProject.id}/studio-draft`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shape: {
            audience: shape.audience.trim() || undefined,
            jobToBeDone: shape.jobToBeDone.trim() || undefined,
            emotionAfterUse: shape.emotionAfterUse.length > 0 ? shape.emotionAfterUse : undefined,
            brandPersonality:
              shape.brandPersonality.length > 0 ? shape.brandPersonality : undefined,
            antiReferences: shape.antiReferences.length > 0 ? shape.antiReferences : undefined,
          },
        }),
      }).catch(() => {
        // Autosave failures must not disrupt the UI.
      });
    }, 500);

    return () => {
      if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    };
  }, [shape, selectedProject, session, step]);

  // --- Auth ---------------------------------------------------------------
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Project create / select --------------------------------------------
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
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Failed to create project');
        return;
      }
      const project = (await res.json()) as Project;
      setSelectedProject(project);
      setStep('shape');
      await loadProjectState(project.id);
    } catch {
      setError('Failed to create project');
    }
  };

  const selectProject = async (p: Project) => {
    setSelectedProject(p);
    setStep('shape');
    await loadProjectState(p.id);
  };

  // --- Shape chip helpers --------------------------------------------------
  const toggleEmotion = (emotion: string) => {
    setShape((prev) => {
      if (prev.emotionAfterUse.includes(emotion)) {
        return { ...prev, emotionAfterUse: prev.emotionAfterUse.filter((e) => e !== emotion) };
      }
      if (prev.emotionAfterUse.length >= 3) return prev;
      return { ...prev, emotionAfterUse: [...prev.emotionAfterUse, emotion] };
    });
  };

  const togglePersonality = (word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setShape((prev) => {
      if (prev.brandPersonality.includes(w)) {
        return { ...prev, brandPersonality: prev.brandPersonality.filter((p) => p !== w) };
      }
      if (prev.brandPersonality.length >= 3) return prev;
      return { ...prev, brandPersonality: [...prev.brandPersonality, w] };
    });
  };

  const toggleAntiRef = (ref: string) => {
    setShape((prev) =>
      prev.antiReferences.includes(ref)
        ? { ...prev, antiReferences: prev.antiReferences.filter((r) => r !== ref) }
        : { ...prev, antiReferences: [...prev.antiReferences, ref] }
    );
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

  // --- Tokens --------------------------------------------------------------
  const tokensByType = useMemo(() => {
    const grouped: Record<string, Token[]> = {};
    for (const t of tokens) {
      if (!grouped[t.tokenType]) grouped[t.tokenType] = [];
      grouped[t.tokenType].push(t);
    }
    for (const list of Object.values(grouped)) {
      list.sort((a, b) => a.tokenKey.localeCompare(b.tokenKey));
    }
    return grouped;
  }, [tokens]);

  const dirtyCount = useMemo(
    () =>
      Object.entries(edits).filter(([key, value]) => {
        const original = tokens.find((t) => t.tokenKey === key);
        return original && original.tokenValue !== value;
      }).length,
    [edits, tokens]
  );

  const setTokenDraft = (key: string, value: string) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const resetEdits = () => setEdits({});

  const saveTokens = async () => {
    if (!selectedProject || !session) return;
    const dirty = tokens
      .filter((t) => edits[t.tokenKey] !== undefined && edits[t.tokenKey] !== t.tokenValue)
      .map((t) => ({
        tokenKey: t.tokenKey,
        tokenType: t.tokenType,
        tokenValue: edits[t.tokenKey],
        description: t.description ?? undefined,
      }));
    if (dirty.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tokens`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: dirty }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Failed to save tokens');
        return;
      }
      const body = (await res.json()) as { data: Token[] };
      setTokens(body.data ?? []);
      setEdits({});
      setStep('done');
    } catch {
      setError('Failed to save tokens');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen" style={styles.page}>
      <header style={styles.shellHeader}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/dashboard" className="text-[1.125rem]" style={styles.display}>
              <span>AI</span>
              <span aria-hidden style={{ color: 'var(--accent)' }}>
                ·
              </span>
              <span>UI</span>
            </a>
            <span className="text-[0.6875rem] uppercase" style={styles.monoLabel}>
              Design Studio
            </span>
          </div>
          {selectedProject && (
            <span className="text-[0.75rem]" style={styles.monoSoft}>
              {selectedProject.name}
            </span>
          )}
        </div>
        <div className="mx-auto max-w-4xl px-6 pb-3">
          <div className="flex gap-1">
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className="h-[2px] flex-1"
                style={{
                  background: i <= STEP_ORDER.indexOf(step) ? 'var(--accent)' : 'var(--ink-faint)',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 text-sm" style={styles.errorBox}>
            {error}
          </div>
        )}

        {step === 'auth' && !user && (
          <AuthStep
            email={email}
            password={password}
            isSignUp={isSignUp}
            authLoading={authLoading}
            onEmail={setEmail}
            onPassword={setPassword}
            onToggleMode={() => setIsSignUp((v) => !v)}
            onSubmit={handleAuth}
          />
        )}

        {step === 'project' && (
          <ProjectStep
            projects={projects}
            newProjectName={newProjectName}
            onSelect={selectProject}
            onNameChange={setNewProjectName}
            onCreate={createProject}
          />
        )}

        {step === 'shape' && selectedProject && (
          <ShapeStep
            shape={shape}
            personalityInput={personalityInput}
            customAntiRef={customAntiRef}
            onShapeChange={setShape}
            onPersonalityInput={setPersonalityInput}
            onCustomAntiRefInput={setCustomAntiRef}
            onToggleEmotion={toggleEmotion}
            onTogglePersonality={togglePersonality}
            onToggleAntiRef={toggleAntiRef}
            onAddCustomAntiRef={addCustomAntiRef}
            onContinue={() => setStep('tokens')}
            onSkip={() => setStep('tokens')}
          />
        )}

        {step === 'tokens' && selectedProject && (
          <TokensStep
            tokens={tokens}
            tokensByType={tokensByType}
            tokensLoading={tokensLoading}
            edits={edits}
            dirtyCount={dirtyCount}
            saving={saving}
            onBack={() => setStep('shape')}
            onResetEdits={resetEdits}
            onSave={saveTokens}
            onTokenDraft={setTokenDraft}
          />
        )}

        {step === 'done' && selectedProject && (
          <DoneStep project={selectedProject} onEditAgain={() => setStep('tokens')} />
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function AuthStep(props: {
  email: string;
  password: string;
  isSignUp: boolean;
  authLoading: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onToggleMode: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { email, password, isSignUp, authLoading, onEmail, onPassword, onToggleMode, onSubmit } =
    props;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center text-[1.75rem]" style={styles.display}>
        {isSignUp ? 'Create an account' : 'Sign in to continue'}
      </h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full px-4 py-2.5 text-sm outline-none"
          style={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          placeholder="Password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className="w-full px-4 py-2.5 text-sm outline-none"
          style={styles.input}
        />
        <button
          type="submit"
          disabled={authLoading}
          className="w-full px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          style={styles.buttonPrimary}
        >
          {authLoading ? '...' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm" style={styles.inkMuted}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={onToggleMode} className="underline" style={{ color: 'var(--accent)' }}>
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

function ProjectStep(props: {
  projects: Project[];
  newProjectName: string;
  onSelect: (p: Project) => void;
  onNameChange: (v: string) => void;
  onCreate: () => void;
}) {
  const { projects, newProjectName, onSelect, onNameChange, onCreate } = props;
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-[1.75rem]" style={styles.display}>
        Pick a project
      </h1>
      <p className="mt-2 text-sm" style={styles.inkSoft}>
        Each project owns its own tokens. Edit them here — they flow into your design memory and
        become the system Claude obeys.
      </p>

      {projects.length > 0 && (
        <div className="mt-8 space-y-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
              style={styles.card}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-deep)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--paper)')}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  {p.name}
                </div>
                <div className="text-[0.6875rem]" style={styles.monoMuted}>
                  /{p.slug}
                </div>
              </div>
              <span
                className="text-[0.6875rem] uppercase"
                style={{ ...styles.monoLabel, color: 'var(--accent)' }}
              >
                Open
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6" style={styles.ruleTop}>
        <h2 className="text-[0.6875rem] uppercase" style={styles.monoLabel}>
          New project
        </h2>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            placeholder="Project name"
            className="flex-1 px-4 py-2 text-sm outline-none"
            style={styles.input}
          />
          <button
            onClick={onCreate}
            disabled={!newProjectName.trim()}
            className="px-4 py-2 text-sm font-medium disabled:opacity-40"
            style={styles.buttonPrimary}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function ShapeStep(props: {
  shape: ShapeState;
  personalityInput: string;
  customAntiRef: string;
  onShapeChange: (updater: (prev: ShapeState) => ShapeState) => void;
  onPersonalityInput: (v: string) => void;
  onCustomAntiRefInput: (v: string) => void;
  onToggleEmotion: (e: string) => void;
  onTogglePersonality: (w: string) => void;
  onToggleAntiRef: (r: string) => void;
  onAddCustomAntiRef: () => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const {
    shape,
    personalityInput,
    customAntiRef,
    onShapeChange,
    onPersonalityInput,
    onCustomAntiRefInput,
    onToggleEmotion,
    onTogglePersonality,
    onToggleAntiRef,
    onAddCustomAntiRef,
    onContinue,
    onSkip,
  } = props;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.75rem]" style={styles.display}>
            Shape the intent
          </h1>
          <p className="mt-1 text-sm" style={styles.inkSoft}>
            A few questions so Claude knows what you&apos;re building, not just how it looks. This
            writes into your design memory.
          </p>
        </div>
        <button onClick={onSkip} className="text-[0.75rem] uppercase" style={styles.monoLabel}>
          Skip
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <ShapeText
          label="Who is this for?"
          hint="One sentence. Your audience."
          value={shape.audience}
          onChange={(v) => onShapeChange((p) => ({ ...p, audience: v }))}
          placeholder="e.g. Senior engineers evaluating AI coding tools"
        />

        <ShapeText
          label="What does your user want to accomplish?"
          hint="One sentence. The job they're hiring this for."
          value={shape.jobToBeDone}
          onChange={(v) => onShapeChange((p) => ({ ...p, jobToBeDone: v }))}
          placeholder="e.g. Ship a design system their AI agent actually respects"
        />

        <div>
          <ShapeLabel>How should they feel after first use?</ShapeLabel>
          <ShapeHint>Pick 3 ({shape.emotionAfterUse.length}/3)</ShapeHint>
          <div className="mt-3 flex flex-wrap gap-2">
            {EMOTION_CHIPS.map((emotion) => {
              const selected = shape.emotionAfterUse.includes(emotion);
              const disabled = !selected && shape.emotionAfterUse.length >= 3;
              return (
                <Chip
                  key={emotion}
                  selected={selected}
                  disabled={disabled}
                  onClick={() => onToggleEmotion(emotion)}
                >
                  {emotion}
                </Chip>
              );
            })}
          </div>
        </div>

        <div>
          <ShapeLabel>Brand personality &mdash; pick 3 words</ShapeLabel>
          <ShapeHint>
            Tap suggestions or type your own ({shape.brandPersonality.length}/3)
          </ShapeHint>
          {shape.brandPersonality.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {shape.brandPersonality.map((word) => (
                <Chip key={word} selected onClick={() => onTogglePersonality(word)}>
                  {word} &times;
                </Chip>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={personalityInput}
              onChange={(e) => onPersonalityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onTogglePersonality(personalityInput);
                  onPersonalityInput('');
                }
              }}
              placeholder="Type a word, hit Enter"
              maxLength={40}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => {
                onTogglePersonality(personalityInput);
                onPersonalityInput('');
              }}
              className="px-3 py-2 text-sm font-medium"
              style={styles.buttonGhost}
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
                    onClick={() => onTogglePersonality(word)}
                    disabled={disabled}
                    className="px-3 py-1 text-[0.75rem]"
                    style={{
                      border: '1px dashed var(--rule-strong)',
                      color: disabled ? 'var(--ink-faint)' : 'var(--ink-soft)',
                      background: 'transparent',
                    }}
                  >
                    + {word}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div>
          <ShapeLabel>What do you NOT want this to look like?</ShapeLabel>
          <ShapeHint>Multi-select. Add your own too.</ShapeHint>
          <div className="mt-3 flex flex-wrap gap-2">
            {ANTI_REFERENCE_OPTIONS.map((opt) => {
              const selected = shape.antiReferences.includes(opt);
              return (
                <Chip key={opt} selected={selected} onClick={() => onToggleAntiRef(opt)}>
                  {selected ? '✓ ' : ''}
                  {opt}
                </Chip>
              );
            })}
          </div>
          {shape.antiReferences.filter(
            (r) => !(ANTI_REFERENCE_OPTIONS as readonly string[]).includes(r)
          ).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {shape.antiReferences
                .filter((r) => !(ANTI_REFERENCE_OPTIONS as readonly string[]).includes(r))
                .map((r) => (
                  <Chip key={r} selected onClick={() => onToggleAntiRef(r)}>
                    {r} &times;
                  </Chip>
                ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customAntiRef}
              onChange={(e) => onCustomAntiRefInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddCustomAntiRef();
                }
              }}
              placeholder="Custom anti-reference"
              maxLength={80}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={styles.input}
            />
            <button
              type="button"
              onClick={onAddCustomAntiRef}
              className="px-3 py-2 text-sm font-medium"
              style={styles.buttonGhost}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end gap-3">
        <button
          onClick={onContinue}
          className="px-5 py-2 text-sm font-medium"
          style={styles.buttonPrimary}
        >
          Continue to tokens
        </button>
      </div>
    </div>
  );
}

function TokensStep(props: {
  tokens: Token[];
  tokensByType: Record<string, Token[]>;
  tokensLoading: boolean;
  edits: Record<string, string>;
  dirtyCount: number;
  saving: boolean;
  onBack: () => void;
  onResetEdits: () => void;
  onSave: () => void;
  onTokenDraft: (key: string, value: string) => void;
}) {
  const {
    tokens,
    tokensByType,
    tokensLoading,
    edits,
    dirtyCount,
    saving,
    onBack,
    onResetEdits,
    onSave,
    onTokenDraft,
  } = props;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem]" style={styles.display}>
            Edit your tokens
          </h1>
          <p className="mt-1 text-sm" style={styles.inkSoft}>
            These are the design primitives Claude reads on every UI generation.
            {dirtyCount > 0 && (
              <>
                {' '}
                <span style={{ color: 'var(--accent)' }}>
                  {dirtyCount} unsaved edit{dirtyCount === 1 ? '' : 's'}.
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium"
            style={styles.buttonGhost}
          >
            Back
          </button>
          {dirtyCount > 0 && (
            <button
              onClick={onResetEdits}
              className="px-4 py-2 text-sm font-medium"
              style={{ ...styles.buttonGhost, color: 'var(--ink-soft)' }}
            >
              Discard
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving || dirtyCount === 0}
            className="px-5 py-2 text-sm font-medium disabled:opacity-40"
            style={styles.buttonPrimary}
          >
            {saving ? 'Saving…' : `Save (${dirtyCount})`}
          </button>
        </div>
      </div>

      <div className="mt-8">
        {tokensLoading ? (
          <p className="text-sm" style={styles.inkMuted}>
            Loading tokens&hellip;
          </p>
        ) : tokens.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={styles.emptyHint}>
            This project has no tokens yet. Run <code style={styles.codePill}>aiui init</code> in
            your project, or call the <code style={styles.codePill}>init_project</code> MCP tool to
            seed defaults.
          </div>
        ) : (
          <div className="space-y-10">
            {TOKEN_TYPE_ORDER.filter((t) => tokensByType[t]?.length).map((type) => {
              const list = tokensByType[type] ?? [];
              return (
                <section key={type}>
                  <header className="flex items-baseline justify-between pb-3" style={styles.rule}>
                    <h2 className="text-[1.125rem]" style={styles.display}>
                      {TOKEN_TYPE_LABELS[type]}
                    </h2>
                    <span className="text-[0.6875rem] uppercase" style={styles.monoLabel}>
                      {list.length} token{list.length === 1 ? '' : 's'}
                    </span>
                  </header>
                  <div>
                    {list.map((token) => (
                      <TokenRow
                        key={token.id}
                        token={token}
                        draftValue={edits[token.tokenKey]}
                        onChange={(v) => onTokenDraft(token.tokenKey, v)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DoneStep({ project, onEditAgain }: { project: Project; onEditAgain: () => void }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="text-[1.75rem]" style={styles.display}>
        Tokens saved.
      </h1>
      <p className="mt-2 text-sm" style={styles.inkSoft}>
        <strong>{project.name}</strong> is up to date.
      </p>

      <div className="mt-8 p-6 text-left" style={styles.cardDeep}>
        <h2 className="text-[0.6875rem] uppercase" style={styles.monoLabel}>
          Now back in Claude
        </h2>
        <div className="mt-3 px-4 py-3 text-sm" style={styles.consoleBlock}>
          &ldquo;Sync the AIUI design memory for{' '}
          <span style={{ color: 'var(--accent)' }}>{project.slug}</span> to this project&rdquo;
        </div>
        <p className="mt-3 text-[0.75rem]" style={styles.inkMuted}>
          Claude will call <code style={styles.codePill}>sync_design_memory</code> and rewrite{' '}
          <code style={styles.codePill}>.aiui/design-memory.md</code> with your tokens and intent.
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <a
          href={`/projects/${project.slug}`}
          className="px-4 py-2 text-sm font-medium"
          style={styles.buttonGhost}
        >
          View project
        </a>
        <button
          onClick={onEditAgain}
          className="px-4 py-2 text-sm font-medium"
          style={styles.buttonPrimary}
        >
          Edit again
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leaf components
// ---------------------------------------------------------------------------

function ShapeLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold" style={{ color: 'var(--ink)' }}>
      {children}
    </label>
  );
}

function ShapeHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.75rem]" style={styles.inkMuted}>
      {children}
    </p>
  );
}

function ShapeText(props: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const { label, hint, value, onChange, placeholder } = props;
  return (
    <div>
      <ShapeLabel>{label}</ShapeLabel>
      <ShapeHint>{hint}</ShapeHint>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        className="mt-3 w-full px-4 py-2.5 text-sm outline-none"
        style={styles.input}
      />
    </div>
  );
}

function Chip(props: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { children, selected, disabled, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1 text-[0.75rem] font-medium transition-colors"
      style={{
        border: selected ? '1px solid var(--accent)' : '1px solid var(--rule-strong)',
        background: selected ? 'var(--accent)' : 'var(--paper)',
        color: selected ? 'var(--paper)' : disabled ? 'var(--ink-faint)' : 'var(--ink-soft)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function TokenRow({
  token,
  draftValue,
  onChange,
}: {
  token: Token;
  draftValue: string | undefined;
  onChange: (v: string) => void;
}) {
  const value = draftValue ?? token.tokenValue;
  const dirty = draftValue !== undefined && draftValue !== token.tokenValue;
  const isColor = token.tokenType === 'color';

  return (
    <div
      className="flex flex-col sm:grid sm:grid-cols-[16rem_2.25rem_1fr] sm:items-center gap-3 py-3"
      style={styles.rule}
    >
      <div>
        <div className="text-[0.8125rem]" style={styles.monoInk}>
          {token.tokenKey}
        </div>
        {token.description && (
          <div className="mt-0.5 text-[0.6875rem]" style={styles.inkMuted}>
            {token.description}
          </div>
        )}
      </div>
      <div
        className="h-8 w-8"
        style={{
          background: isColor ? value : 'var(--paper-sunk)',
          border: '1px solid var(--rule)',
        }}
        aria-hidden
      />
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full px-3 py-1.5 text-[0.8125rem] outline-none"
          style={{
            fontFamily: 'var(--font-mono-editorial)',
            border: dirty ? '1px solid var(--accent)' : '1px solid var(--rule-strong)',
            background: dirty ? 'var(--accent-soft)' : 'var(--paper)',
            color: 'var(--ink)',
          }}
        />
        {dirty && (
          <span
            className="text-[0.6875rem] uppercase"
            style={{ ...styles.monoLabel, color: 'var(--accent)' }}
          >
            Edited
          </span>
        )}
      </div>
    </div>
  );
}
