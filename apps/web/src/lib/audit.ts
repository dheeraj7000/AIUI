/**
 * Thin audit logger.
 *
 * Previously wrote to a `usage_events` / `credit_ledger` table with
 * per-tier metering. The scope-reduction cleanup removed that enterprise
 * machinery — AIUI is a solo-dev tool now. `logWebEvent` is kept as a
 * console-only breadcrumb so routes don't need to change; remove the
 * remaining call sites over time and this file can go entirely.
 */
export function logWebEvent(params: { organizationId: string; action: string }): void {
  if (process.env.AIUI_DEV_AUDIT === '1') {
    process.stderr.write(`[audit] ${params.action} org=${params.organizationId}\n`);
  }
}
