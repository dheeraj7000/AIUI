/**
 * Tool-dispatch audit wrapper.
 *
 * Previously wrote every MCP tool call into `usage_events` with tier
 * metering. The scope-reduction cleanup removed that enterprise surface;
 * what remains is:
 *   - `summarizeArgs` — still used for redacted request logging in tests
 *     and HTTP error pages.
 *   - `wrapWithAudit` — returns the handler unchanged (no-op) so callers
 *     don't have to unregister it everywhere.
 */

const SENSITIVE_KEY_PATTERN = /^(api[_-]?key|key|token|secret|password|authorization|bearer)$/i;
const MAX_STRING_LEN = 200;
const MAX_ARRAY_LEN = 20;
const MAX_DEPTH = 4;

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
  return undefined;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export function wrapWithAudit(_name: string, handler: ToolHandler): ToolHandler {
  return handler;
}
