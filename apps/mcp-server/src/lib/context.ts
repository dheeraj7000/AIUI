import { AsyncLocalStorage } from 'async_hooks';

/**
 * Per-request auth context for the remote MCP server.
 * Populated by the auth middleware, read by tool handlers.
 */
export interface RequestContext {
  keyId: string;
  userId: string;
  organizationId: string;
  projectId: string | null;
  scopes: string[];
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getContext(): RequestContext | undefined {
  return storage.getStore();
}
