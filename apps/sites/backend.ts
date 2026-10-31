/** Server-only transport to the owner's laptop. No tunnel credential reaches the browser. */
export interface BackendConfiguration { url?: string; secret?: string }
function offline(path: string, reason: string) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  return path === '/api/inference/health'
    ? Response.json({ apiOnline: false, hostOnline: false, activeWorkers: 0, pendingTasks: 0, engine: 'deterministic', reason }, { headers })
    : Response.json({ error: 'BackendUnavailable', message: 'This feature requires the laptop and Docker to be running.' }, { status: 503, headers });
}
async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get('Content-Length') ?? 0) > limit) throw new RangeError('Request too large');
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new RangeError('Request too large'); }
    chunks.push(value);
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
export async function proxyBackend(request: Request, config: BackendConfiguration): Promise<Response> {
  const source = new URL(request.url);
  const path = source.pathname;
  const origin = request.headers.get('Origin');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && origin && origin !== source.origin) {
    return Response.json({ error: 'ForbiddenOrigin' }, { status: 403 });
  }
  const ticketId = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  if (path.startsWith('/api/inference/') && !new RegExp(`^/api/inference/(health|queue|(?:status|cancel)/${ticketId})$`).test(path)) {
    return Response.json({ error: 'NotFound' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!config.url || !config.secret) return offline(path, 'Laptop backend connection is not configured');
  try {
    const target = new URL(config.url);
    const local = ['127.0.0.1', 'localhost'].includes(source.hostname);
    if ((target.protocol !== 'https:' && !(local && target.protocol === 'http:')) || target.username || target.password) return offline(path, 'Laptop backend transport configuration is invalid');
    target.pathname = path; target.search = source.search;
    const headers = new Headers();
    for (const name of ['Content-Type', 'Accept', 'Authorization']) { const value = request.headers.get(name); if (value) headers.set(name, value); }
    const cookie = request.headers.get('Cookie')?.split(';').filter(part => /^\s*(?:__Secure-)?better-auth\./.test(part)).join(';');
    if (cookie) headers.set('Cookie', cookie);
    headers.set('Origin', source.origin);
    headers.set('X-Tessellate-Gateway', config.secret);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(config.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const identity = request.headers.get('CF-Connecting-IP') ?? 'local';
    const signed = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(identity)));
    headers.set('X-Tessellate-Client', Array.from(signed, byte => byte.toString(16).padStart(2, '0')).join(''));
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await boundedBody(request, path.startsWith('/api/inference/') ? 96 * 1024 : 2 * 1024 * 1024);
    const response = await fetch(target, { method: request.method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(3000) });
    if (path === '/api/inference/health' && !response.ok) return offline(path, 'Laptop backend is offline or unhealthy');
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.delete('X-Tessellate-Gateway');
    responseHeaders.delete('X-Host-Secret');
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    if (error instanceof RangeError) return Response.json({ error: 'RequestTooLarge' }, { status: 413 });
    return offline(path, 'Laptop backend is offline or unreachable');
  }
}
