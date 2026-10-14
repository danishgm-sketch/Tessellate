/**
 * Browser client for the Tessellate API. Production serves the API same-origin under /api;
 * local development talks to `wrangler dev` on :8787 (cookies are same-site on localhost).
 */
export function apiBase(): string {
  const configured = import.meta.env.PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return `http://${window.location.hostname}:8787`;
  }
  return '';
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fetch JSON with credentials; throws ApiError with the server's human-readable message. */
export async function apiFetch<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      credentials: 'include',
      ...rest,
      headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(headers as Record<string, string>) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, 'Could not reach Tessellate. Check your connection and try again.');
  }
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }
  if (!res.ok) {
    const message = String(body.message ?? body.error ?? `Request failed (HTTP ${res.status}).`);
    throw new ApiError(res.status, message, typeof body.code === 'string' ? body.code : undefined);
  }
  return body as T;
}

export interface MeResponse {
  authenticated: boolean;
  user: { id: string; name: string; email: string; role?: string | null } | null;
}

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/me');
}
