'use client';

import { useEffect, useMemo, useState } from 'react';

interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
}

interface PersonaRow {
  id: string;
  name: string;
  audience: string | null;
  jobToBeDone: string | null;
  emotionalState: string | null;
  emotionAfterUse: string[] | null;
  brandPersonality: string[] | null;
  antiReferences: string[] | null;
  constraints: string[] | null;
  isDefault: boolean;
}

interface CritiqueResponse {
  score: number;
  persona: {
    source: string;
    name: string;
    audience: string | null;
    jobToBeDone: string | null;
    emotionalState: string | null;
    emotionAfterUse: string[] | null;
    brandPersonality: string[] | null;
    antiReferences: string[] | null;
    constraints: string[];
  };
  signals: {
    interactiveElements: number;
    decisionPoints: number;
    wordCount: number;
    paragraphCount: number;
    headings: Array<{ level: number; text: string }>;
    primaryCtas: string[];
    competingCtas: number;
    requiredFormFields: number;
    totalFormFields: number;
    modalsAndOverlays: number;
    trustElements: string[];
    formalIndicators: number;
    casualIndicators: number;
    density: 'compact' | 'default' | 'airy';
  };
  designContext: {
    colorTokens: string[];
    fontTokens: string[];
    fontSizeTokens: string[];
    spacingTokens: string[];
    voiceTone: Record<string, unknown> | null;
  };
  prompt: string;
  summary: string;
}

const SURFACES = ['landing', 'dashboard', 'form', 'pricing', 'settings', 'auth', 'other'] as const;
type Surface = (typeof SURFACES)[number];

const SAMPLE_CODE = `<section className="py-24 text-center">
  <h1 className="text-5xl font-bold">Build faster.</h1>
  <p className="mt-4 text-lg text-gray-600">
    The AI-native way to ship UI.
  </p>
  <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg">
    Get started
  </button>
</section>`;

export function CritiqueClient() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [personaId, setPersonaId] = useState<string>(''); // '' = use project default / shape
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [surface, setSurface] = useState<Surface>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CritiqueResponse | null>(null);
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load projects on mount
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: { data?: ProjectSummary[] }) => {
        const list = d.data ?? [];
        setProjects(list);
        if (list[0]) setProjectId(list[0].id);
      })
      .catch(() => setError('Could not load projects'));
  }, []);

  // Reload personas when project changes
  useEffect(() => {
    if (!projectId) {
      setPersonas([]);
      return;
    }
    fetch(`/api/projects/${projectId}/personas`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: { data?: PersonaRow[] }) => setPersonas(d.data ?? []))
      .catch(() => setPersonas([]));
  }, [projectId]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId]
  );

  async function runCritique() {
    if (!projectId) {
      setError('Pick a project first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/critique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          surface,
          ...(personaId ? { personaId } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setResult((await res.json()) as CritiqueResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run critique');
    } finally {
      setLoading(false);
    }
  }

  function copyPrompt() {
    if (!result) return;
    navigator.clipboard.writeText(result.prompt + '\n\n## Code\n\n```tsx\n' + code + '\n```');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-4">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--ink-muted)' }}
        >
          CRITIQUE
        </span>
      </div>
      <h1
        className="mt-6 font-mono text-4xl font-bold leading-none"
        style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
      >
        Critique a snippet
      </h1>
      <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Paste a UI snippet, pick a persona, and AIUI extracts cognitive-load + hierarchy + friction
        + trust signals grounded in your project&rsquo;s tokens. Copy the rendered prompt into
        Claude / Cursor to compose the actual critique.
      </p>

      {/* Form */}
      <div
        className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
        style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}
      >
        <Field label="Project">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPersonaId('');
            }}
            className="mt-1 w-full font-mono text-sm"
            style={inputStyle}
          >
            {projects.length === 0 && <option value="">No projects yet</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Persona">
          <select
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            className="mt-1 w-full font-mono text-sm"
            style={inputStyle}
          >
            <option value="">
              {personas.find((p) => p.isDefault)
                ? `Default (${personas.find((p) => p.isDefault)?.name})`
                : 'Project default / studio shape'}
            </option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.isDefault ? ' · default' : ''}
              </option>
            ))}
          </select>
          {selectedProject && (
            <button
              type="button"
              onClick={() => setShowCreatePersona((v) => !v)}
              className="mt-1 font-mono text-[11px] underline"
              style={{ color: 'var(--ink-muted)' }}
            >
              {showCreatePersona ? '— hide' : '+ create new persona'}
            </button>
          )}
        </Field>

        <Field label="Surface">
          <select
            value={surface}
            onChange={(e) => setSurface(e.target.value as Surface)}
            className="mt-1 w-full font-mono text-sm"
            style={inputStyle}
          >
            {SURFACES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {showCreatePersona && projectId && (
        <CreatePersonaForm
          projectId={projectId}
          onCreated={(p) => {
            setPersonas((list) => [...list, p].sort((a, b) => a.name.localeCompare(b.name)));
            setPersonaId(p.id);
            setShowCreatePersona(false);
          }}
          onCancel={() => setShowCreatePersona(false)}
        />
      )}

      <Field label="Code (JSX, HTML, or CSS)">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          className="mt-1 w-full font-mono text-sm"
          style={inputStyle}
        />
      </Field>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={runCritique}
          disabled={loading || !projectId || !code}
          className="px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-opacity disabled:opacity-50"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {loading ? 'Analyzing…' : '→ Run critique'}
        </button>
        {error && (
          <span className="font-mono text-xs" style={{ color: 'var(--destructive, #b91c1c)' }}>
            {error}
          </span>
        )}
      </div>

      {result && (
        <div className="mt-12">
          <ResultBlock result={result} onCopyPrompt={copyPrompt} copied={copied} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="font-mono text-[11px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--ink-muted)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--paper-sunk)',
  color: 'var(--ink)',
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius-md)',
  padding: '0.625rem 0.75rem',
};

function CreatePersonaForm({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: string;
  onCreated: (p: PersonaRow) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('');
  const [jobToBeDone, setJobToBeDone] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setErr('Name is required');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          audience: audience.trim() || undefined,
          jobToBeDone: jobToBeDone.trim() || undefined,
          emotionalState: emotionalState.trim() || undefined,
          isDefault,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? `HTTP ${res.status}`);
      }
      const { data } = (await res.json()) as { data: PersonaRow };
      onCreated(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="mt-4 grid grid-cols-1 gap-3 p-4 md:grid-cols-2"
      style={{
        background: 'var(--paper-sunk)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <Field label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full font-mono text-sm"
          style={inputStyle}
          placeholder="e.g. Free user"
        />
      </Field>
      <Field label="Audience">
        <input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="mt-1 w-full font-mono text-sm"
          style={inputStyle}
          placeholder="Who they are"
        />
      </Field>
      <Field label="Job-to-be-done">
        <input
          value={jobToBeDone}
          onChange={(e) => setJobToBeDone(e.target.value)}
          className="mt-1 w-full font-mono text-sm"
          style={inputStyle}
          placeholder="What they're trying to do"
        />
      </Field>
      <Field label="Emotional state">
        <input
          value={emotionalState}
          onChange={(e) => setEmotionalState(e.target.value)}
          className="mt-1 w-full font-mono text-sm"
          style={inputStyle}
          placeholder="How they feel arriving"
        />
      </Field>
      <div className="md:col-span-2 flex items-center gap-3">
        <label className="flex items-center gap-2 font-mono text-xs">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Make this the default persona
        </label>
        <div className="ml-auto flex items-center gap-2">
          {err && (
            <span className="font-mono text-xs" style={{ color: 'var(--destructive, #b91c1c)' }}>
              {err}
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 font-mono text-xs uppercase tracking-[0.12em]"
            style={{ color: 'var(--ink-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] disabled:opacity-50"
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {submitting ? 'Saving…' : 'Save persona'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultBlock({
  result,
  onCopyPrompt,
  copied,
}: {
  result: CritiqueResponse;
  onCopyPrompt: () => void;
  copied: boolean;
}) {
  const grade =
    result.score >= 80
      ? 'on-brand'
      : result.score >= 60
        ? 'mostly aligned'
        : result.score >= 40
          ? 'drifting'
          : 'off-brand';
  return (
    <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}>
      <div className="flex items-baseline gap-3">
        <span
          className="font-mono text-xs uppercase tracking-[0.12em]"
          style={{ color: 'var(--accent)' }}
        >
          Result · {grade}
        </span>
        <span className="font-mono text-3xl font-bold" style={{ color: 'var(--ink)' }}>
          {result.score}/100
        </span>
      </div>
      <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
        {result.summary}
      </p>

      {/* Persona used */}
      <Section title={`Persona used (source: ${result.persona.source})`}>
        <KV label="Audience" value={result.persona.audience ?? '—'} />
        <KV label="Job-to-be-done" value={result.persona.jobToBeDone ?? '—'} />
        {result.persona.emotionAfterUse && (
          <KV label="Emotion after use" value={result.persona.emotionAfterUse.join(', ')} />
        )}
        {result.persona.brandPersonality && (
          <KV label="Brand personality" value={result.persona.brandPersonality.join(', ')} />
        )}
        {result.persona.antiReferences && (
          <KV label="Anti-references" value={result.persona.antiReferences.join(', ')} />
        )}
      </Section>

      <Section title="Signals">
        <KV label="Interactive elements" value={String(result.signals.interactiveElements)} />
        <KV label="Decision points" value={String(result.signals.decisionPoints)} />
        <KV label="Headings" value={String(result.signals.headings.length)} />
        <KV label="Primary CTAs" value={result.signals.primaryCtas.join(', ') || '—'} />
        <KV label="Competing CTAs" value={String(result.signals.competingCtas)} />
        <KV
          label="Form fields"
          value={`${result.signals.totalFormFields} (${result.signals.requiredFormFields} required)`}
        />
        <KV label="Modals / overlays" value={String(result.signals.modalsAndOverlays)} />
        <KV label="Word count" value={String(result.signals.wordCount)} />
        <KV
          label="Tone"
          value={`formal ${result.signals.formalIndicators}, casual ${result.signals.casualIndicators}`}
        />
        <KV label="Trust signals" value={result.signals.trustElements.join(', ') || 'none'} />
        <KV label="Visual density" value={result.signals.density} />
      </Section>

      <Section title="Critique prompt (copy + paste into Claude / Cursor)">
        <pre
          className="overflow-x-auto p-4 font-mono text-xs"
          style={{
            background: 'var(--paper-sunk)',
            color: 'var(--ink)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {result.prompt}
        </pre>
        <button
          type="button"
          onClick={onCopyPrompt}
          className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em]"
          style={{
            background: copied ? 'var(--success, #059669)' : 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {copied ? '✓ Copied' : 'Copy prompt + code'}
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8" style={{ borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
      <h2
        className="font-mono text-xs font-extrabold uppercase tracking-[0.12em]"
        style={{ color: 'var(--accent)' }}
      >
        {title}
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-1 md:grid-cols-2">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-mono text-xs">
      <span style={{ color: 'var(--ink-muted)' }}>{label}:</span>{' '}
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}
