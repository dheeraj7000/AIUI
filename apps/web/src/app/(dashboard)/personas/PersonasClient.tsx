'use client';

import { useEffect, useState } from 'react';

interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
}

interface PersonaRow {
  id: string;
  projectId: string;
  name: string;
  audience: string | null;
  jobToBeDone: string | null;
  emotionalState: string | null;
  emotionAfterUse: string[] | null;
  brandPersonality: string[] | null;
  antiReferences: string[] | null;
  constraints: string[] | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormDraft {
  name: string;
  audience: string;
  jobToBeDone: string;
  emotionalState: string;
  emotionAfterUse: string;
  brandPersonality: string;
  antiReferences: string;
  constraints: string;
  isDefault: boolean;
}

const EMPTY_DRAFT: FormDraft = {
  name: '',
  audience: '',
  jobToBeDone: '',
  emotionalState: '',
  emotionAfterUse: '',
  brandPersonality: '',
  antiReferences: '',
  constraints: '',
  isDefault: false,
};

function csv(s: string): string[] | undefined {
  const arr = s
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return arr.length === 0 ? undefined : arr;
}

function rowToDraft(p: PersonaRow): FormDraft {
  return {
    name: p.name,
    audience: p.audience ?? '',
    jobToBeDone: p.jobToBeDone ?? '',
    emotionalState: p.emotionalState ?? '',
    emotionAfterUse: (p.emotionAfterUse ?? []).join(', '),
    brandPersonality: (p.brandPersonality ?? []).join(', '),
    antiReferences: (p.antiReferences ?? []).join(', '),
    constraints: (p.constraints ?? []).join(', '),
    isDefault: p.isDefault,
  };
}

export function PersonasClient() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<FormDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!projectId) {
      setPersonas([]);
      return;
    }
    setLoading(true);
    fetch(`/api/projects/${projectId}/personas`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: { data?: PersonaRow[] }) => setPersonas(d.data ?? []))
      .catch(() => setError('Could not load personas'))
      .finally(() => setLoading(false));
  }, [projectId]);

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setCreating(true);
    setEditingId(null);
  }

  function startEdit(p: PersonaRow) {
    setDraft(rowToDraft(p));
    setEditingId(p.id);
    setCreating(false);
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  async function save() {
    if (!projectId) return;
    if (!draft.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      name: draft.name.trim(),
      audience: draft.audience.trim() || undefined,
      jobToBeDone: draft.jobToBeDone.trim() || undefined,
      emotionalState: draft.emotionalState.trim() || undefined,
      emotionAfterUse: csv(draft.emotionAfterUse),
      brandPersonality: csv(draft.brandPersonality),
      antiReferences: csv(draft.antiReferences),
      constraints: csv(draft.constraints),
      isDefault: draft.isDefault,
    };
    try {
      const url = editingId
        ? `/api/projects/${projectId}/personas/${editingId}`
        : `/api/projects/${projectId}/personas`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      // Refresh list
      const list = await fetch(`/api/projects/${projectId}/personas`).then(
        (r) => r.json() as Promise<{ data: PersonaRow[] }>
      );
      setPersonas(list.data ?? []);
      cancelForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function setAsDefault(p: PersonaRow) {
    if (p.isDefault) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/personas/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await fetch(`/api/projects/${projectId}/personas`).then(
        (r) => r.json() as Promise<{ data: PersonaRow[] }>
      );
      setPersonas(list.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set default');
    }
  }

  async function deletePersona(p: PersonaRow) {
    if (!confirm(`Delete persona "${p.name}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/personas/${p.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPersonas((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-4">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--ink-muted)' }}
        >
          PERSONAS
        </span>
      </div>
      <h1
        className="mt-6 font-mono text-4xl font-bold leading-none"
        style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
      >
        Personas
      </h1>
      <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Define one or more user personas per project. Each persona gets used by{' '}
        <code className="font-mono text-sm">critique_for_persona</code> (MCP) and the{' '}
        <a href="/critique" style={{ color: 'var(--accent)' }} className="underline">
          /critique
        </a>{' '}
        page to ground UX feedback in a specific user&rsquo;s perspective.
      </p>

      {/* Project picker */}
      <div
        className="mt-10 flex items-end gap-4"
        style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}
      >
        <div className="flex-1">
          <label
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--ink-muted)' }}
          >
            Project
          </label>
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              cancelForm();
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
        </div>
        <button
          type="button"
          onClick={startCreate}
          disabled={!projectId}
          className="px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] disabled:opacity-50"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          + New persona
        </button>
      </div>

      {error && (
        <div
          className="mt-4 px-4 py-2 font-mono text-xs"
          style={{
            background: 'var(--paper-sunk)',
            color: 'var(--destructive, #b91c1c)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </div>
      )}

      {(creating || editingId) && (
        <PersonaForm
          draft={draft}
          setDraft={setDraft}
          isEditing={!!editingId}
          saving={saving}
          onCancel={cancelForm}
          onSave={save}
        />
      )}

      {loading && (
        <p className="mt-6 font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
          Loading…
        </p>
      )}

      {!loading && personas.length === 0 && projectId && !creating && (
        <p className="mt-10 font-mono text-sm" style={{ color: 'var(--ink-muted)' }}>
          No personas yet for this project. Hit{' '}
          <span style={{ color: 'var(--ink)' }}>+ New persona</span> to create your first one.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {personas.map((p) => (
          <li key={p.id}>
            <PersonaCard
              persona={p}
              isEditingThis={editingId === p.id}
              onEdit={() => startEdit(p)}
              onDelete={() => deletePersona(p)}
              onSetDefault={() => setAsDefault(p)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonaCard({
  persona,
  isEditingThis,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  persona: PersonaRow;
  isEditingThis: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <div
      className="px-4 py-4"
      style={{
        background: isEditingThis ? 'var(--paper-sunk)' : 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold" style={{ color: 'var(--ink)' }}>
              {persona.name}
            </h3>
            {persona.isDefault && (
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-soft, var(--paper-sunk))',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}
              >
                default
              </span>
            )}
          </div>
          <dl className="mt-2 grid grid-cols-1 gap-1 text-xs md:grid-cols-2">
            {persona.audience && <Pair label="Audience" value={persona.audience} />}
            {persona.jobToBeDone && <Pair label="JTBD" value={persona.jobToBeDone} />}
            {persona.emotionalState && (
              <Pair label="Emotional state" value={persona.emotionalState} />
            )}
            {persona.emotionAfterUse?.length ? (
              <Pair label="After use" value={persona.emotionAfterUse.join(', ')} />
            ) : null}
            {persona.brandPersonality?.length ? (
              <Pair label="Brand personality" value={persona.brandPersonality.join(', ')} />
            ) : null}
            {persona.antiReferences?.length ? (
              <Pair label="Anti-references" value={persona.antiReferences.join(', ')} />
            ) : null}
            {persona.constraints?.length ? (
              <Pair label="Constraints" value={persona.constraints.join(', ')} />
            ) : null}
          </dl>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!persona.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              className="font-mono text-[11px] underline"
              style={{ color: 'var(--ink-muted)' }}
            >
              Set default
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="font-mono text-[11px] underline"
            style={{ color: 'var(--ink-soft)' }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="font-mono text-[11px] underline"
            style={{ color: 'var(--destructive, #b91c1c)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-mono">
      <dt className="inline" style={{ color: 'var(--ink-muted)' }}>
        {label}:
      </dt>{' '}
      <dd className="inline" style={{ color: 'var(--ink)' }}>
        {value}
      </dd>
    </div>
  );
}

function PersonaForm({
  draft,
  setDraft,
  isEditing,
  saving,
  onCancel,
  onSave,
}: {
  draft: FormDraft;
  setDraft: (d: FormDraft) => void;
  isEditing: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  function set<K extends keyof FormDraft>(k: K, v: FormDraft[K]) {
    setDraft({ ...draft, [k]: v });
  }

  return (
    <div
      className="mt-6 grid grid-cols-1 gap-3 p-4 md:grid-cols-2"
      style={{
        background: 'var(--paper-sunk)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="md:col-span-2">
        <h2
          className="font-mono text-xs font-extrabold uppercase tracking-[0.12em]"
          style={{ color: 'var(--accent)' }}
        >
          {isEditing ? 'Edit persona' : 'New persona'}
        </h2>
      </div>

      <FieldInput
        label="Name *"
        value={draft.name}
        onChange={(v) => set('name', v)}
        placeholder="e.g. Free user"
      />
      <FieldInput
        label="Audience"
        value={draft.audience}
        onChange={(v) => set('audience', v)}
        placeholder="Who they are"
      />
      <FieldInput
        label="Job-to-be-done"
        value={draft.jobToBeDone}
        onChange={(v) => set('jobToBeDone', v)}
        placeholder="What they're trying to do"
      />
      <FieldInput
        label="Emotional state"
        value={draft.emotionalState}
        onChange={(v) => set('emotionalState', v)}
        placeholder="How they feel arriving"
      />
      <FieldInput
        label="Emotion after use (comma-sep)"
        value={draft.emotionAfterUse}
        onChange={(v) => set('emotionAfterUse', v)}
        placeholder="confident, in control"
      />
      <FieldInput
        label="Brand personality (comma-sep)"
        value={draft.brandPersonality}
        onChange={(v) => set('brandPersonality', v)}
        placeholder="warm, direct, no-nonsense"
      />
      <FieldInput
        label="Anti-references (comma-sep)"
        value={draft.antiReferences}
        onChange={(v) => set('antiReferences', v)}
        placeholder="enterprise, gimmicky, infantilizing"
      />
      <FieldInput
        label="Constraints (comma-sep)"
        value={draft.constraints}
        onChange={(v) => set('constraints', v)}
        placeholder="screen reader, low bandwidth"
      />

      <div className="md:col-span-2 flex items-center justify-between">
        <label className="flex items-center gap-2 font-mono text-xs">
          <input
            type="checkbox"
            checked={draft.isDefault}
            onChange={(e) => set('isDefault', e.target.checked)}
          />
          Make this the default persona for the project
        </label>
        <div className="flex items-center gap-2">
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
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] disabled:opacity-50"
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create persona'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        className="font-mono text-[11px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--ink-muted)' }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full font-mono text-sm"
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--paper)',
  color: 'var(--ink)',
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius-md)',
  padding: '0.5rem 0.75rem',
};
