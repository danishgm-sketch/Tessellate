import { Hono } from 'hono';

export const aiProxyRoute = new Hono();

const ALLOWED_PROVIDERS: Record<string, string> = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  gemini: 'https://generativelanguage.googleapis.com',
  openrouter: 'https://openrouter.ai/api',
};

const MAX_BODY_SIZE_BYTES = 512 * 1024; // 512 KB

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
    const rawBody = await c.req.raw.arrayBuffer();
    if (rawBody.byteLength > MAX_BODY_SIZE_BYTES) {
      return c.json(
        { error: 'Payload too large', message: 'Request exceeds maximum allowed size (512 KB).' },
        413
      );
    }
    body = rawBody;
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

    const respBody = await targetResponse.arrayBuffer();
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
