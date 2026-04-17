import { trackUsage } from '@aiui/design-core';
import { getDb } from './db';
import { getContext } from './context';
import { log } from './errors';

/**
 * Server-side audit logging for MCP tool dispatches.
 *
 * Every tool handler registered via AiuiMcpServer.registerTool is wrapped with
 * `wrapWithAudit`, which:
 *
 *   1. Captures wall-clock start time
 *   2. Invokes the handler
 *   3. Writes an audit row into `usage_events` with:
 *        { userId, organizationId, projectId, toolName, status, durationMs,
 *          argsSummary (redacted), eventType: 'mcp_tool_call' }
 *   4. Returns the handler result (or re-throws the original error)
 *
 * Audit writes are fire-and-forget — failures log to stderr but never block
 * the tool response. Context (user/org/project) is pulled from the per-request
 * AsyncLocalStorage populated by the HTTP auth middleware. In stdio mode the
 * context is undefined and only organizationId is written (none here, so
 * stdio-mode audit is skipped — see TODO below).
 *
 * TODO(parity-agent): when stdio/HTTP registration is unified, pass the org/
 * user resolution via a common AuthResolver interface so stdio mode can also
 * attribute events. Currently this wrapper no-ops on missing context rather
 * than failing the tool call.
 */

const SENSITIVE_KEY_PATTERN = /^(api[_-]?key|key|token|secret|password|authorization|bearer)$/i;
const MAX_STRING_LEN = 200;
const MAX_ARRAY_LEN = 20;
const MAX_DEPTH = 4;

/**
 * Produce a safe, size-bounded copy of tool args for the audit log.
 *
 * Rules:
 *   - Any field whose name matches /key|token|secret|password|authorization/i
 *     is replaced with the string '[redacted]'.
 *   - Strings longer than 200 chars are truncated with a '…(truncated)' suffix.
 *   - Arrays longer than 20 entries are capped (remaining count recorded).
 *   - Recursion depth is capped at 4 to prevent pathological cycles.
 *   - Unknown / unsupported types (functions, symbols) are dropped.
 */
export function summarizeArgs(input: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[depth-exceeded]';
  if (input === null || input === undefined) return input;

  const t = typeof input;
  if (t === 'string') {
    const s = input as string;
    return s.length > MAX_STRING_LEN ? s.slice(0, MAX_STRING_LEN) + '…(truncated)' : s;
  }
  if (t === 'number' || t === 'boolean' || t === 'bigint') {
    return t === 'bigint' ? (input as bigint).toString() : input;
  }
  if (Array.isArray(input)) {
    const arr = input.slice(0, MAX_ARRAY_LEN).map((v) => summarizeArgs(v, depth + 1));
    if (input.length > MAX_ARRAY_LEN) {
      arr.push(`…(+${input.length - MAX_ARRAY_LEN} more)`);
    }
    return arr;
  }
  if (t === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(k)) {
        out[k] = '[redacted]';
        continue;
      }
      out[k] = summarizeArgs(v, depth + 1);
    }
    return out;
  }
  // functions, symbols, etc.
  return undefined;
}

/**
 * Best-effort extraction of a projectId from tool args. Most tools accept
 * `projectId` directly; some use `project_id`. Falls back to the request
 * context's projectId (API-key-scoped keys).
 */
function resolveProjectId(
  args: Record<string, unknown>,
  ctxProjectId: string | null
): string | null {
  const candidate = args.projectId ?? args.project_id;
  if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  return ctxProjectId;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

/**
 * Wrap a tool handler so that every dispatch writes a row to `usage_events`.
 *
 * Designed as a standalone function so either stdio or HTTP registration
 * sites can plug it in. Today it is invoked from AiuiMcpServer.registerTool.
 */
export function wrapWithAudit(name: string, handler: ToolHandler): ToolHandler {
  return async (args) => {
    const startedAt = Date.now();
    let status: 'ok' | 'error' = 'ok';
    let thrown: unknown = null;
    let result: unknown;

    try {
      result = await handler(args);
      return result;
    } catch (err) {
      status = 'error';
      thrown = err;
      throw err;
    } finally {
      const durationMs = Date.now() - startedAt;
      const ctx = getContext();

      // Stdio mode has no auth context — skip audit until the parity agent
      // wires a resolver. This avoids noisy failures when running locally.
      if (ctx) {
        try {
          const db = getDb();
          const projectId = resolveProjectId(args, ctx.projectId);
          const argsSummary = summarizeArgs(args);
          // Include error message on failure so operators can triage without
          // pulling server logs. Redaction rules already applied to args.
          const summaryWithStatus =
            status === 'error'
              ? {
                  args: argsSummary,
                  error:
                    thrown instanceof Error
                      ? thrown.message.slice(0, MAX_STRING_LEN)
                      : String(thrown).slice(0, MAX_STRING_LEN),
                }
              : { args: argsSummary };

          trackUsage(db, {
            apiKeyId: ctx.keyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            projectId,
            toolName: name,
            eventType: 'mcp_tool_call',
            status,
            durationMs,
            argsSummary: summaryWithStatus,
            // creditsCost = 0 so the audit row does not double-charge on top
            // of the existing `tool_call` row written by http-server.ts's
            // `trackFromBody` (which remains the billing source of truth).
            creditsCost: 0,
          }).catch((err) => {
            log('warn', `[audit] failed to write mcp_tool_call row`, {
              tool: name,
              error: err instanceof Error ? err.message : String(err),
            });
          });
        } catch (err) {
          // Swallow DB init errors — audit must never break tool dispatch.
          log('warn', `[audit] skipped (db unavailable)`, {
            tool: name,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  };
}
