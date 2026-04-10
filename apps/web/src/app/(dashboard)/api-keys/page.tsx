'use client';

import { useCallback, useEffect, useState } from 'react';
import { getActiveOrgId } from '@/lib/session';
import {
  Key,
  Copy,
  Check,
  Trash2,
  Loader2,
  ShieldAlert,
  Plus,
  KeyRound,
  ChevronDown,
  ChevronRight,
  Terminal,
  Monitor,
} from 'lucide-react';

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

type IdeTab = 'claude-code' | 'cursor' | 'vscode' | 'windsurf';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Auth is now sent via HttpOnly cookies — `credentials: 'same-origin'` ensures
// the browser includes them on every request. No client-side token handling.

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getMcpHost(): string {
  return typeof window !== 'undefined' ? window.location.origin : 'https://aiui.store';
}

function mcpSnippet(rawKey: string): string {
  const host = getMcpHost();
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

function getIdeConfig(tab: IdeTab, rawKey: string): string {
  const host = getMcpHost();

  switch (tab) {
    case 'claude-code':
      return `claude mcp add --transport http aiui ${host}/mcp --header "Authorization:Bearer ${rawKey}"`;

    case 'cursor':
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

    case 'vscode':
      return JSON.stringify(
        {
          'mcp.servers': {
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

    case 'windsurf':
      return JSON.stringify(
        {
          mcpServers: {
            aiui: {
              serverUrl: `${host}/mcp`,
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
}

const IDE_TABS: { id: IdeTab; label: string; file: string }[] = [
  { id: 'claude-code', label: 'Claude Code', file: 'Terminal command' },
  { id: 'cursor', label: 'Cursor', file: '.cursor/mcp.json' },
  { id: 'vscode', label: 'VS Code', file: 'settings.json' },
  { id: 'windsurf', label: 'Windsurf', file: '.windsurf/mcp.json' },
];

// ---------------------------------------------------------------------------
// IDE Setup Section (reusable)
// ---------------------------------------------------------------------------

function IdeSetupSection({
  rawKey,
  variant,
}: {
  rawKey: string;
  variant: 'inline' | 'collapsible';
}) {
  const [activeTab, setActiveTab] = useState<IdeTab>('claude-code');
  const [copiedIde, setCopiedIde] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function copyIdeConfig(tab: IdeTab) {
    try {
      await navigator.clipboard.writeText(getIdeConfig(tab, rawKey));
      setCopiedIde(tab);
      setTimeout(() => setCopiedIde(null), 2000);
    } catch {
      // Clipboard write can fail in some contexts
    }
  }

  const content = (
    <div className="mt-3">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-1.5">
        {IDE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'border border-indigo-500 bg-indigo-500/10 text-indigo-400'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-500">
            {IDE_TABS.find((t) => t.id === activeTab)?.file}
          </span>
          <button
            onClick={() => copyIdeConfig(activeTab)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-300"
          >
            {copiedIde === activeTab ? (
              <>
                <Check size={12} className="text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-800 p-3 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all">
          {getIdeConfig(activeTab, rawKey)}
        </pre>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Monitor size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">Connect your MCP client</span>
        </div>
        <p className="text-xs text-zinc-400">
          One-time setup. Paste the snippet for your editor and you&apos;re connected to AIUI.
        </p>
        {content}
      </div>
    );
  }

  // Collapsible variant
  return (
    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
            <Terminal size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">IDE Setup Instructions</h3>
            <p className="text-xs text-zinc-400">
              Connect Claude Code, Cursor, VS Code, or Windsurf to your design system
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown size={18} className="text-zinc-400" />
        ) : (
          <ChevronRight size={18} className="text-zinc-400" />
        )}
      </button>
      {expanded && <div className="px-5 pb-5">{content}</div>}
    </div>
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
      const res = await fetch('/api/api-keys', { credentials: 'same-origin' });
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
      // Resolve the active org via the setup endpoint whenever the local
      // cache is empty. We also re-sync on a 403 below in case the cached
      // orgId belongs to a previous account (e.g. after delete-account + new
      // sign-up, or switching test users). /api/auth/setup is idempotent.
      async function syncOrgFromServer(): Promise<string | null> {
        const setupRes = await fetch('/api/auth/setup', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!setupRes.ok) return null;
        const setupData = await setupRes.json();
        if (!setupData.orgId) return null;
        const { setActiveOrgId } = await import('@/lib/session');
        setActiveOrgId(setupData.orgId);
        return setupData.orgId as string;
      }

      let organizationId = getActiveOrgId();
      if (!organizationId) {
        organizationId = await syncOrgFromServer();
      }

      if (!organizationId) {
        throw new Error('Could not determine your workspace. Try refreshing.');
      }

      async function postKey(orgId: string) {
        return fetch('/api/api-keys', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newKeyName.trim(), organizationId: orgId }),
        });
      }

      let res = await postKey(organizationId);

      // Stale cache recovery: if the cached orgId isn't one the current user
      // belongs to, re-sync and retry once.
      if (res.status === 403) {
        const fresh = await syncOrgFromServer();
        if (fresh && fresh !== organizationId) {
          organizationId = fresh;
          res = await postKey(organizationId);
        }
      }

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
        credentials: 'same-origin',
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <Key size={20} className="text-indigo-400" />
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
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-md"
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
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5">
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

          {/* IDE Setup section (inline, shown after key creation) */}
          <IdeSetupSection rawKey={createdKey.rawKey} variant="inline" />

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
          className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 shadow-sm"
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
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400 disabled:opacity-50"
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
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/5">
            <KeyRound size={24} className="text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No API keys yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Create one to connect Claude Code to your design system.
          </p>
        </div>
      ) : keys.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shadow-sm">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03]">
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
                  className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
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

      {/* Collapsible IDE Setup Instructions (always visible when keys exist) */}
      {keys.length > 0 && <IdeSetupSection rawKey={`YOUR_API_KEY`} variant="collapsible" />}
    </div>
  );
}
