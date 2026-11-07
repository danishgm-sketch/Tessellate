const PROJECT_BODY_LIMIT_BYTES = 1_500_000;
const AI_BODY_LIMIT_BYTES = 512 * 1024;
const INFERENCE_BODY_LIMIT_BYTES = 96 * 1024;
const DEFAULT_BODY_LIMIT_BYTES = 64 * 1024;

type BoundedRequestResult =
  | { ok: true; request: Request }
  | { ok: false };

async function cancelBody(stream: ReadableStream<Uint8Array> | null): Promise<void> {
  if (!stream) return;
  try {
    await stream.cancel();
  } catch {
    // The size rejection remains valid if the client has already closed its stream.
  }
}

function bodyLimitForPath(path: string): number {
  if (path === '/api/projects' || path.startsWith('/api/projects/')) {
    return PROJECT_BODY_LIMIT_BYTES;
  }
  if (path === '/api/ai' || path.startsWith('/api/ai/')) return AI_BODY_LIMIT_BYTES;
  if (path === '/api/inference' || path.startsWith('/api/inference/')) {
    return INFERENCE_BODY_LIMIT_BYTES;
  }
  return DEFAULT_BODY_LIMIT_BYTES;
}

async function readBoundedBody(
  stream: ReadableStream<Uint8Array>,
  limit: number
): Promise<ArrayBuffer | null> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        try {
          await reader.cancel();
        } catch {
          // Preserve the 413 result even if cancellation races with client disconnect.
        }
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new ArrayBuffer(size);
  const bodyView = new Uint8Array(body);
  let offset = 0;
  for (const chunk of chunks) {
    bodyView.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/**
 * Bounds every API request body before route handlers parse it. The original
 * request is reconstructed from the bounded bytes so Hono can still consume
 * JSON/form bodies normally after this middleware runs.
 */
export async function boundApiRequestBody(request: Request): Promise<BoundedRequestResult> {
  if (request.method === 'GET' || request.method === 'HEAD' || !request.body) {
    return { ok: true, request };
  }

  const limit = bodyLimitForPath(new URL(request.url).pathname);
  const contentLength = request.headers.get('content-length');
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > limit) {
    await cancelBody(request.body);
    return { ok: false };
  }

  const body = await readBoundedBody(request.body, limit);
  if (!body) return { ok: false };
  const headers = new Headers(request.headers);
  // The request may have lied about its length. Do not carry that stale value
  // into the bounded request seen by downstream route parsers.
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  return { ok: true, request: new Request(request, { body, headers }) };
}
