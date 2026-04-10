'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ProjectPickerProps {
  /** What action is being performed — shown on buttons */
  action: string;
  /** Called when user picks a project */
  onSelect: (projectId: string) => Promise<void>;
}

export function ProjectPicker({ action, onSelect }: ProjectPickerProps) {
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
      }
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchProjects();
      setError(null);
      setSuccess(null);
    }
  }, [open, fetchProjects]);

  const createProject = async () => {
    if (!newName.trim() || !orgId || !session) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, name: newName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create project');
        return;
      }
      setNewName('');
      await fetchProjects();
    } catch {
      setError('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = async (projectId: string) => {
    setActing(projectId);
    setError(null);
    try {
      await onSelect(projectId);
      setSuccess('Done!');
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActing(null);
    }
  };

  if (!user) {
    return (
      <a
        href="/sign-in"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Sign in to {action}
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {action}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900">Select a project</h3>

            {error && (
              <p className="mt-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="mt-2 rounded-md bg-green-50 px-3 py-1.5 text-xs text-green-600">
                {success}
              </p>
            )}

            {loading ? (
              <div className="mt-3 space-y-2">
                <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ) : (
              <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                {projects.length === 0 && (
                  <p className="py-3 text-center text-xs text-gray-400">
                    No projects yet. Create one below.
                  </p>
                )}
                {projects.map((p) => (
                  <button
                    key={p.id}
                    disabled={acting !== null}
                    onClick={() => handleSelect(p.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">/{p.slug}</div>
                    </div>
                    {acting === p.id ? (
                      <span className="text-xs text-blue-600">Adding...</span>
                    ) : (
                      <span className="text-xs text-blue-600">Select</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  placeholder="New project name"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={createProject}
                  disabled={!newName.trim() || creating}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {creating ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
