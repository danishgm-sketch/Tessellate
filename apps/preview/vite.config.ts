import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { privateVersoVitePlugin } from '../site/src/integrations/private-verso-vite-plugin.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const parentOrigins = process.env.VITE_TESSELLATE_PARENT_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
const previewCsp = [
  "default-src 'none'",
  // Allow Vite's fixed React refresh preamble by content hash; do not allow arbitrary inline scripts.
  "script-src 'self' 'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='",
  "style-src 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self' ws://127.0.0.1:5173",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  `frame-ancestors ${parentOrigins.length ? parentOrigins.join(' ') : "'self'"}`,
  "object-src 'none'",
].join('; ');

export default defineConfig({
  plugins: [react({ fastRefresh: false }), tailwindcss(), privateVersoVitePlugin(repositoryRoot, { requireParentOrigins: true, exposeSourceModules: true })],
  server: {
    port: 5173,
    host: '127.0.0.1',
    headers: {
      'Content-Security-Policy': previewCsp,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
});
