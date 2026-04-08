'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPersistedAccessToken, getActiveOrgId } from '@/lib/session';
import { Key, Copy, Check, Trash2, Loader2, ShieldAlert, Plus, KeyRound } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  projectId: string | null;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CreatedKeyResponse {
  id: string;
  rawKey: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(): Record<string, string> {
  const token = getPersistedAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function mcpSnippet(rawKey: string): string {
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://aiui.store';
  return JSON.stringify(
    {
      mcpServers: {
        aiui: {
          type: 'http',
          url: `${host}/mcp`,
          headers: {
            Authorization: `Bearer ${rawKey}`,
          },
        },
      },
    },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Newly created key (shown once)
  const [createdKey, setCreatedKey] = useState<CreatedKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch keys
  // ---------------------------------------------------------------------------

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/api-keys', { headers: authHeaders() });
      if (!res.ok) {
        throw new Error(`Failed to load keys (${res.status})`);
      }
      const data: ApiKeyRow[] = await res.json();
      setKeys(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // ---------------------------------------------------------------------------
  // Create key
  // ---------------------------------------------------------------------------

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const organizationId = getActiveOrgId() ?? 'default';

      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ name: newKeyName.trim(), organizationId }),
      });

      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to create key (${res.status})`);
      }

      const data: CreatedKeyResponse = await res.json();
      setCreatedKey(data);
      setCopiedKey(false);
      setCopiedSnippet(false);
      setNewKeyName('');
      setShowCreateForm(false);

      // Refresh the list
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Revoke key
  // ---------------------------------------------------------------------------

  async function handleRevoke(id: string) {
    setRevokingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to revoke key (${res.status})`);
      }

      setKeys((prev) => prev.filter((k) => k.id !== id));
      setConfirmRevokeId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setRevokingId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Copy helpers
  // ---------------------------------------------------------------------------

  async function copyToClipboard(text: string, type: 'key' | 'snippet') {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      }
    } catch {
      // Clipboard write can fail in some contexts; ignore
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10">
            <Key size={20} className="text-lime-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">API Keys</h1>
            <p className="text-sm text-zinc-400">
              Manage API keys to connect Claude Code and other tools to your design system.
            </p>
          </div>
        </div>
        {!showCreateForm && !createdKey && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-all duration-200 hover:bg-lime-400 hover:shadow-md"
          >
            <Plus size={16} />
            Create API Key
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Newly created key banner */}
      {createdKey && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            <h2 className="text-base font-semibold text-amber-300">Save your API key</h2>
          </div>
          <p className="mb-3 text-sm text-amber-400">
            This key will only be shown once. Copy it now and store it securely.
          </p>

          {/* Raw key display */}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-amber-500/30 bg-zinc-800 px-3 py-2 font-mono text-sm text-white select-all">
              {createdKey.rawKey}
            </code>
            <button
              onClick={() => copyToClipboard(createdKey.rawKey, 'key')}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-zinc-800 px-3 py-2 text-sm font-medium text-amber-300 transition-all duration-200 hover:bg-zinc-700"
            >
              {copiedKey ? (
                <>
                  <Check size={14} className="text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* MCP snippet */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-300">Add to your .mcp.json</span>
              <button
                onClick={() => copyToClipboard(mcpSnippet(createdKey.rawKey), 'snippet')}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                {copiedSnippet ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy snippet
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-amber-500/30 bg-zinc-800 p-3 font-mono text-xs text-zinc-300">
              {mcpSnippet(createdKey.rawKey)}
            </pre>
          </div>

          <button
            onClick={() => setCreatedKey(null)}
            className="mt-4 rounded-lg border border-amber-500/30 bg-zinc-800 px-4 py-2 text-sm font-medium text-amber-300 transition-all duration-200 hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"
        >
          <h2 className="mb-3 text-base font-semibold text-white">Create a new API key</h2>
          <label htmlFor="key-name" className="mb-1 block text-sm font-medium text-zinc-400">
            Key name
          </label>
          <input
            id="key-name"
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder='e.g. "Claude Code - My Project"'
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-all duration-200 hover:bg-lime-400 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Key'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Keys table */}
      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Loader2 size={16} className="animate-spin" />
          Loading API keys...
        </div>
      ) : keys.length === 0 && !createdKey ? (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
            <KeyRound size={24} className="text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No API keys yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Create one to connect Claude Code to your design system.
          </p>
        </div>
      ) : keys.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-4 py-3 font-medium text-zinc-400">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Key Prefix</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Created</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Last Used</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr
                  key={key.id}
                  className="border-b border-zinc-800 transition-colors last:border-b-0 hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-zinc-500" />
                      <span className="font-medium text-white">{key.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(key.lastUsedAt)}</td>
                  <td className="px-4 py-3">
                    {confirmRevokeId === key.id ? (
                      <span className="flex items-center gap-2">
                        <button
                          onClick={() => handleRevoke(key.id)}
                          disabled={revokingId === key.id}
                          className="flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
                        >
                          {revokingId === key.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Confirm
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmRevokeId(null)}
                          className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmRevokeId(key.id)}
                        className="flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-800"
                      >
                        <Trash2 size={14} />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
