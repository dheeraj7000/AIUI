'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, Loader2, RefreshCw, ScrollText } from 'lucide-react';
import { getActiveOrgId } from '@/lib/session';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditEvent {
  id: string;
  createdAt: string;
  toolName: string;
  eventType: string;
  creditsCost: number;
  actorName: string;
  actorPrefix: string | null;
}

interface AuditLogResponse {
  data: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function eventTypePill(eventType: string): string {
  switch (eventType) {
    case 'tool_call':
    case 'mcp_tool_call':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'web_write':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'validation':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'compilation':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

function displayActor(ev: { actorName: string; actorPrefix: string | null; eventType: string }): {
  label: string;
  sublabel: string | null;
} {
  if (ev.eventType === 'web_write') {
    return { label: 'Web UI', sublabel: null };
  }
  return { label: ev.actorName, sublabel: ev.actorPrefix };
}

// Re-sync the active org from the server. Mirrors the api-keys page pattern
// so we recover from empty localStorage (e.g. after a fresh sign-in on a new
// device or after clearing site data).
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let organizationId = getActiveOrgId();
      if (!organizationId) {
        organizationId = await syncOrgFromServer();
      }

      if (!organizationId) {
        throw new Error('Could not determine your workspace. Try refreshing.');
      }
      setOrgId(organizationId);

      let res = await fetch(
        `/api/audit-logs?orgId=${encodeURIComponent(organizationId)}&limit=100`,
        { credentials: 'same-origin' }
      );

      // Stale cache recovery — matches api-keys page behavior.
      if (res.status === 403) {
        const fresh = await syncOrgFromServer();
        if (fresh && fresh !== organizationId) {
          organizationId = fresh;
          setOrgId(organizationId);
          res = await fetch(
            `/api/audit-logs?orgId=${encodeURIComponent(organizationId)}&limit=100`,
            { credentials: 'same-origin' }
          );
        }
      }

      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to load audit log (${res.status})`);
      }

      const json: AuditLogResponse = await res.json();
      setEvents(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <History size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="max-w-2xl text-sm text-zinc-400">
              Every MCP tool call and web dashboard mutation for your organization. MCP events show
              the API key that made the call; web events are labeled &quot;Web UI&quot;.
            </p>
          </div>
        </div>
        <button
          onClick={loadEvents}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            onClick={loadEvents}
            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 transition-all duration-200 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state (initial) */}
      {loading && events.length === 0 && !error ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Loader2 size={16} className="animate-spin" />
          Loading audit log...
        </div>
      ) : null}

      {/* Empty state */}
      {!loading && !error && events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5">
            <ScrollText size={24} className="text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No tool calls yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Run{' '}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
              init_project
            </code>{' '}
            from your MCP client to generate your first event.
          </p>
        </div>
      ) : null}

      {/* Events table */}
      {events.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03]">
                <th className="px-4 py-3 font-medium text-zinc-400">Timestamp</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Actor</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Action</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Type</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Credits</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                    {formatTimestamp(ev.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const actor = displayActor(ev);
                      return (
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{actor.label}</span>
                          {actor.sublabel && (
                            <code className="mt-0.5 w-fit rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                              {actor.sublabel}...
                            </code>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                      {ev.toolName}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${eventTypePill(
                        ev.eventType
                      )}`}
                    >
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                    {ev.creditsCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer hint */}
      {events.length > 0 && (
        <p className="mt-3 text-xs text-zinc-600">
          Showing the {events.length} most recent event{events.length === 1 ? '' : 's'}
          {orgId ? ' for this organization.' : '.'}
        </p>
      )}
    </div>
  );
}
