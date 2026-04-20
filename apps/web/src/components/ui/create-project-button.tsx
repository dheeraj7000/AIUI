'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

interface CreateProjectButtonProps {
  orgId: string;
  variant?: 'primary' | 'outline';
  label?: string;
}

export function CreateProjectButton({
  orgId,
  variant = 'primary',
  label = 'New project',
}: CreateProjectButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState<'nextjs-tailwind' | 'react-tailwind'>(
    'nextjs-tailwind'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base =
    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all';
  const styles =
    variant === 'primary'
      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400'
      : 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          name: name.trim(),
          description: description.trim() || undefined,
          frameworkTarget: framework,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const project = await res.json();
      setOpen(false);
      router.push(`/projects/${project.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create project');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${base} ${styles}`}>
        <Plus size={16} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white">Create a new project</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Starter pack and tokens are seeded automatically. You can swap them later.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="cp-name" className="text-sm font-medium text-zinc-300">
                  Project name
                </label>
                <input
                  id="cp-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
                  placeholder="My marketing site"
                />
              </div>

              <div>
                <label htmlFor="cp-desc" className="text-sm font-medium text-zinc-300">
                  Description <span className="text-zinc-500">(optional)</span>
                </label>
                <textarea
                  id="cp-desc"
                  rows={2}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
                  placeholder="What are you building?"
                />
              </div>

              <div>
                <label htmlFor="cp-fw" className="text-sm font-medium text-zinc-300">
                  Framework
                </label>
                <select
                  id="cp-fw"
                  value={framework}
                  onChange={(e) =>
                    setFramework(e.target.value as 'nextjs-tailwind' | 'react-tailwind')
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/40"
                >
                  <option value="nextjs-tailwind">Next.js + Tailwind</option>
                  <option value="react-tailwind">React + Tailwind</option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
