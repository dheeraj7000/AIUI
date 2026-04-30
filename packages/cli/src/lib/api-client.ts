/**
 * Thin HTTP client for the AIUI server. Used by `aiui adopt` to push
 * promoted tokens, and reusable for any future CLI → server call.
 *
 * Auth: Bearer API key (the same key the MCP server uses). Pass via
 * --api-key flag or the AIUI_API_KEY environment variable.
 */

export interface AdoptToken {
  tokenKey: string;
  tokenType: string;
  tokenValue: string;
  description?: string;
}

export interface AdoptRequest {
  tokens: AdoptToken[];
  /**
   * 'merge' (default): skip existing keys without error.
   * 'replace': overwrite values for keys that already exist.
   */
  mode?: 'merge' | 'replace';
  source?: {
    scannedAt: string;
    filesScanned?: number;
    coverageEstimate?: number;
  };
}

export interface AdoptResponse {
  promoted: number;
  skipped: number;
  updated: number;
  errors: Array<{ key: string; reason: string }>;
  totalTokens: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function authHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * POST /llm/adopt?project=<slug> — bulk-import detected tokens onto a project.
 */
export async function adopt(
  apiUrl: string,
  apiKey: string,
  projectSlug: string,
  body: AdoptRequest
): Promise<AdoptResponse> {
  const url = `${apiUrl.replace(/\/$/, '')}/llm/adopt?project=${encodeURIComponent(projectSlug)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text();
    }
    const msg =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, payload);
  }

  return res.json() as Promise<AdoptResponse>;
}
