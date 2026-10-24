import * as http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer, MCP_VERSION } from './index.js';

export interface SseServerOptions {
  port?: number;
  host?: string;
  cwd?: string;
  /** Browser origins allowed to use this local compatibility transport. */
  allowedOrigins?: string[];
}

/**
 * Starts the existing local MCP compatibility server over Server-Sent Events.
 * Browser callers require an explicit CORS origin allowlist; remote access still
 * requires an authenticated transport and must not be enabled by exposing this port.
 */
export async function startMcpSseServer(options: SseServerOptions = {}) {
  const port = options.port ?? 3333;
  const host = options.host ?? '127.0.0.1';
  if (!['localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1'].includes(host.toLowerCase())) {
    throw new Error('The unauthenticated MCP SSE transport may bind to loopback only.');
  }
  const cwd = options.cwd ?? process.cwd();
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  const maxSessions = 8;

  const sessions = new Map<string, { transport: SSEServerTransport; server: ReturnType<typeof createMcpServer> }>();

  const httpServer = http.createServer((req, res) => {
    void handleRequest(req, res).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      if (res.headersSent) {
        res.destroy(error instanceof Error ? error : new Error(message));
        return;
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'MCP request failed.' }));
    });
  });

  async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);
    const origin = req.headers.origin;
    const originAllowed = !origin || allowedOrigins.has(origin);

    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // CORS response headers alone do not stop browsers from opening requests.
    // Reject untrusted origins before creating sessions or serving local data.
    if (!originAllowed) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Origin is not allowed.' }));
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/sse' && req.method === 'GET') {
      if (sessions.size >= maxSessions) {
        res.writeHead(503, { 'Content-Type': 'application/json', 'Retry-After': '5' });
        res.end(JSON.stringify({ error: 'SessionLimitReached', message: 'The local MCP server is at its concurrent session limit. Close another client and retry.' }));
        return;
      }
      const transport = new SSEServerTransport('/message', res);
      const sessionServer = createMcpServer({ cwd, name: 'tessellate-sse', version: MCP_VERSION });
      sessions.set(transport.sessionId, { transport, server: sessionServer });
      transport.onclose = () => sessions.delete(transport.sessionId);
      try {
        await sessionServer.connect(transport);
      } catch (error) {
        sessions.delete(transport.sessionId);
        throw error;
      }
      return;
    }

    if (url.pathname === '/message' && req.method === 'POST') {
      const sessionId = url.searchParams.get('sessionId');
      const session = sessionId ? sessions.get(sessionId) : undefined;
      if (!session) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SSE session not found. Connect to /sse first.' }));
        return;
      }
      await session.transport.handlePostMessage(req, res);
      return;
    }

    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', version: MCP_VERSION, type: 'tessellate-mcp-sse' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Connect via GET /sse or POST /message.' }));
  }

  return new Promise<{ server: http.Server; port: number }>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, host, () => {
      const address = httpServer.address();
      if (!address || typeof address === 'string') {
        reject(new Error('MCP SSE server did not return a TCP address.'));
        return;
      }
      httpServer.off('error', reject);
      resolve({ server: httpServer, port: address.port });
    });
  });
}
