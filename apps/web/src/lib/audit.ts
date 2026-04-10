import { createDb, trackUsage } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * Record a web-side mutation to the audit log. Fire-and-forget: failures are
 * logged to stderr but never block the calling request. The dashboard's
 * /audit-log page renders these rows with a "Web UI" actor label (keyed off
 * eventType === 'web_write' + null apiKeyId).
 *
 * Convention: `action` should be `web.<verb>_<resource>` (e.g.
 * `web.create_project`, `web.update_tokens`, `web.apply_style_pack`) so the
 * audit table reads naturally alongside MCP tool_call rows.
 */
export function logWebEvent(params: { organizationId: string; action: string }): void {
  const db = getDb();
  trackUsage(db, {
    apiKeyId: undefined,
    organizationId: params.organizationId,
    toolName: params.action,
    eventType: 'web_write',
    creditsCost: 0,
  }).catch((err) => {
    process.stderr.write(`[audit] Failed to log web event ${params.action}: ${err}\n`);
  });
}
