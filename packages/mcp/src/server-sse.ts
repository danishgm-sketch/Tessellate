import * as http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer, MCP_VERSION } from './index.js';

export interface SseServerOptions {
  port?: number;
  host?: string;
  cwd?: string;
}

/**
 * Starts an HTTP server exposing the Tessellate MCP server over Server-Sent Events (SSE).
 * Allows remote agents, containers, or web apps to connect to Tessellate via standard HTTP.
 */
export async function startMcpSseServer(options: SseServerOptions = {}) {
  const port = options.port ?? 3333;
  const host = options.host ?? '127.0.0.1';
  const cwd = options.cwd ?? process.cwd();

  const server = createMcpServer({ cwd, name: 'tessellate-sse', version: MCP_VERSION });
  let transport: SSEServerTransport | null = null;

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);

    // Enable CORS for agent runtimes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/sse') {
      transport = new SSEServerTransport('/message', res);
      await server.connect(transport);
      return;
    }

    if (url.pathname === '/message' && req.method === 'POST') {
      if (!transport) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SSE session not established. Connect to /sse first.' }));
        return;
      }
      await transport.handlePostMessage(req, res);
      return;
    }

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', version: MCP_VERSION, type: 'tessellate-mcp-sse' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Connect via GET /sse or POST /message.' }));
  });

  return new Promise<{ server: http.Server; port: number }>((resolve) => {
    httpServer.listen(port, host, () => {
      resolve({ server: httpServer, port });
    });
  });
}
