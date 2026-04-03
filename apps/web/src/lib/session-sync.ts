// ---------------------------------------------------------------------------
// Multi-tab session synchronisation
// ---------------------------------------------------------------------------
// Uses BroadcastChannel (with a storage-event fallback) so that auth
// state changes in one tab are reflected in every other open tab.
// ---------------------------------------------------------------------------

const CHANNEL_NAME = 'aiui-auth';
const STORAGE_KEY = 'aiui-auth-sync';

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

export const SESSION_UPDATED = 'SESSION_UPDATED' as const;
export const SESSION_CLEARED = 'SESSION_CLEARED' as const;
export const ORG_SWITCHED = 'ORG_SWITCHED' as const;

export type SessionMessage =
  | { type: typeof SESSION_UPDATED }
  | { type: typeof SESSION_CLEARED }
  | { type: typeof ORG_SWITCHED; orgId: string };

// ---------------------------------------------------------------------------
// Internal channel helper
// ---------------------------------------------------------------------------

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (typeof BroadcastChannel === 'undefined') return null;

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }

  return channel;
}

// ---------------------------------------------------------------------------
// Broadcast helpers
// ---------------------------------------------------------------------------

function postMessage(msg: SessionMessage): void {
  const bc = getChannel();

  if (bc) {
    bc.postMessage(msg);
    return;
  }

  // Fallback: write to localStorage so other tabs pick it up via the
  // "storage" event. The value must change each time to trigger the event,
  // so we append a timestamp.
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...msg, _ts: Date.now() }));
  }
}

/**
 * Broadcast a session-updated event to all other tabs.
 */
export function broadcastSessionUpdate(): void {
  postMessage({ type: SESSION_UPDATED });
}

/**
 * Broadcast a sign-out event to all other tabs.
 */
export function broadcastSignOut(): void {
  postMessage({ type: SESSION_CLEARED });
}

/**
 * Broadcast an organisation switch to all other tabs.
 */
export function broadcastOrgSwitch(orgId: string): void {
  postMessage({ type: ORG_SWITCHED, orgId });
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/**
 * Subscribe to session messages from other tabs.
 * Returns a cleanup function that removes the listener.
 */
export function onSessionMessage(callback: (msg: SessionMessage) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const bc = getChannel();

  if (bc) {
    const handler = (event: MessageEvent<SessionMessage>) => {
      callback(event.data);
    };
    bc.addEventListener('message', handler);
    return () => bc.removeEventListener('message', handler);
  }

  // Fallback: listen to localStorage "storage" events fired by other tabs.
  const storageHandler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as SessionMessage;
      callback(parsed);
    } catch {
      // Ignore malformed payloads
    }
  };

  window.addEventListener('storage', storageHandler);
  return () => window.removeEventListener('storage', storageHandler);
}
