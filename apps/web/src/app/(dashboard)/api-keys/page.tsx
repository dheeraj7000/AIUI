'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPersistedAccessToken, getActiveOrgId } from '@/lib/session';

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
  return JSON.stringify(
    {
      mcpServers: {
        aiui: {
          command: 'npx',
          args: ['-y', '@aiui/mcp-server@latest'],
          env: {
            AIUI_API_KEY: rawKey,
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage API keys to connect Claude Code and other tools to your design system.
          </p>
        </div>
        {!showCreateForm && !createdKey && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Create API Key
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Newly created key banner */}
      {createdKey && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">&#9888;</span>
            <h2 className="text-base font-semibold text-amber-900">Save your API key</h2>
          </div>
          <p className="mb-3 text-sm text-amber-800">
            This key will only be shown once. Copy it now and store it securely.
          </p>

          {/* Raw key display */}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 select-all">
              {createdKey.rawKey}
            </code>
            <button
              onClick={() => copyToClipboard(createdKey.rawKey, 'key')}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
            >
              {copiedKey ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* MCP snippet */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">Add to your .mcp.json</span>
              <button
                onClick={() => copyToClipboard(mcpSnippet(createdKey.rawKey), 'snippet')}
                className="text-sm font-medium text-amber-700 transition-colors hover:text-amber-900"
              >
                {copiedSnippet ? 'Copied!' : 'Copy snippet'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-amber-300 bg-white p-3 font-mono text-xs text-gray-800">
              {mcpSnippet(createdKey.rawKey)}
            </pre>
          </div>

          <button
            onClick={() => setCreatedKey(null)}
            className="mt-4 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
          >
            Done
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-base font-semibold text-gray-900">Create a new API key</h2>
          <label htmlFor="key-name" className="mb-1 block text-sm font-medium text-gray-700">
            Key name
          </label>
          <input
            id="key-name"
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder='e.g. "Claude Code - My Project"'
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Key'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Keys table */}
      {loading ? (
        <div className="mt-8 text-center text-sm text-gray-500">Loading API keys...</div>
      ) : keys.length === 0 && !createdKey ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No API keys yet. Create one to connect Claude Code to your design system.
          </p>
        </div>
      ) : keys.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Key Prefix</th>
                <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="px-4 py-3 font-medium text-gray-600">Last Used</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(key.lastUsedAt)}</td>
                  <td className="px-4 py-3">
                    {confirmRevokeId === key.id ? (
                      <span className="flex items-center gap-2">
                        <button
                          onClick={() => handleRevoke(key.id)}
                          disabled={revokingId === key.id}
                          className="text-sm font-medium text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
                        >
                          {revokingId === key.id ? 'Revoking...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmRevokeId(null)}
                          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmRevokeId(key.id)}
                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-800"
                      >
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
