import { Hono } from 'hono';
import { aiRateLimitKey, enforceApiRateLimit } from '../rate-limit.js';
import type { Env } from '../types.js';

export const aiProxyRoute = new Hono<{ Bindings: Env }>();

const ALLOWED_PROVIDERS: Record<string, string> = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  gemini: 'https://generativelanguage.googleapis.com',
  openrouter: 'https://openrouter.ai/api',
};

const MAX_BODY_SIZE_BYTES = 512 * 1024; // 512 KB
const MAX_PROVIDER_RESPONSE_BYTES = 8 * 1024 * 1024; // 8 MB

class PayloadTooLargeError extends Error {}

async function readBoundedBody(
  stream: ReadableStream<Uint8Array> | null,
  limit: number
): Promise<ArrayBuffer> {
  if (!stream) return new ArrayBuffer(0);

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new ArrayBuffer(size);
  const resultView = new Uint8Array(result);
  let offset = 0;
  for (const chunk of chunks) {
    resultView.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function exceedsLimit(contentLength: string | null, limit: number): boolean {
  if (!contentLength || !/^\d+$/.test(contentLength)) return false;
  return Number(contentLength) > limit;
}

aiProxyRoute.all('/:provider/*', async (c) => {
  const provider = c.req.param('provider')?.toLowerCase();
  const targetBase = provider ? ALLOWED_PROVIDERS[provider] : undefined;

  if (!targetBase) {
    return c.json(
      {
        error: 'Invalid AI provider',
        message: `Provider "${provider}" is not allowed. Supported: ${Object.keys(ALLOWED_PROVIDERS).join(', ')}`,
      },
      400
    );
  }

  const rateLimitResponse = await enforceApiRateLimit(
    c.env,
    'API_AI_LIMITER',
    await aiRateLimitKey(c.env, c.req.raw)
  );
  if (rateLimitResponse) return rateLimitResponse;

  // Extract wildcard subpath
  const fullUrl = new URL(c.req.url);
  const prefix = `/api/ai/${provider}`;
  const subpath = fullUrl.pathname.startsWith(prefix)
    ? fullUrl.pathname.slice(prefix.length)
    : '';

  const targetUrl = new URL(`${targetBase}${subpath}${fullUrl.search}`);

  // Forward permitted headers (redacting internal headers, preserving auth only for this call)
  const forwardHeaders = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === 'authorization' ||
      lower === 'x-api-key' ||
      lower === 'x-goog-api-key' ||
      lower === 'anthropic-version' ||
      lower === 'anthropic-dangerous-direct-browser-access' ||
      lower === 'content-type' ||
      lower === 'accept'
    ) {
      forwardHeaders.set(key, value);
    }
  });

  // Ensure application identification for OpenRouter
  if (provider === 'openrouter') {
    if (!forwardHeaders.has('http-referer')) {
      forwardHeaders.set('HTTP-Referer', 'https://tessellate.dev');
    }
    if (!forwardHeaders.has('x-title')) {
      forwardHeaders.set('X-Title', 'Tessellate Interface Intelligence');
    }
  }

  let body: ArrayBuffer | undefined = undefined;
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    if (exceedsLimit(c.req.header('Content-Length') ?? null, MAX_BODY_SIZE_BYTES)) {
      return c.json(
        { error: 'Payload too large', message: 'Request exceeds maximum allowed size (512 KB).' },
        413
      );
    }
    try {
      body = await readBoundedBody(c.req.raw.body, MAX_BODY_SIZE_BYTES);
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        return c.json(
          { error: 'Payload too large', message: 'Request exceeds maximum allowed size (512 KB).' },
          413
        );
      }
      throw err;
    }
  }

  try {
    const targetResponse = await fetch(targetUrl.toString(), {
      method: c.req.method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers();
    // HARD SECURITY REQUIREMENT: No caching on AI responses
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');

    // Forward content-type
    const contentType = targetResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('content-type', contentType);
    }

    if (exceedsLimit(targetResponse.headers.get('content-length'), MAX_PROVIDER_RESPONSE_BYTES)) {
      await targetResponse.body?.cancel();
      return c.json(
        { error: 'Provider response too large', message: 'The upstream response exceeds the 8 MB limit.' },
        502
      );
    }

    let respBody: ArrayBuffer;
    try {
      respBody = await readBoundedBody(targetResponse.body, MAX_PROVIDER_RESPONSE_BYTES);
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        return c.json(
          { error: 'Provider response too large', message: 'The upstream response exceeds the 8 MB limit.' },
          502
        );
      }
      throw err;
    }
    return new Response(respBody, {
      status: targetResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return c.json(
      {
        error: 'Proxy forwarding failed',
        message: err instanceof Error ? err.message : 'Upstream provider connection error',
      },
      502
    );
  }
});
