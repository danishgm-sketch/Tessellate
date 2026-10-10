#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerMcpTools } from './tools.js';

export const MCP_VERSION = '0.1.0';

export interface CreateMcpServerOptions {
  name?: string;
  version?: string;
  cwd?: string;
}

/**
 * Creates and configures a Tessellate MCP server instance with all tools registered.
 */
export function createMcpServer(options: CreateMcpServerOptions = {}): McpServer {
  const server = new McpServer({
    name: options.name || 'tessellate',
    version: options.version || MCP_VERSION,
  });

  registerMcpTools(server, options.cwd || process.cwd());
  return server;
}

/**
 * Runs the MCP server with standard I/O transport for local IDE and agent integration.
 */
export async function runMcpServer(cwd = process.cwd()) {
  const server = createMcpServer({ cwd });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Run as standalone MCP server process if invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMcpServer().catch((err) => {
    console.error('[tessellate-mcp] Fatal error:', err);
    process.exit(1);
  });
}

export * from './tools.js';
export * from './catalog-provider.js';
