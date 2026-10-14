import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    cors: true,
  },
  preview: {
    port: 5173,
    // The preview document runs in a sandbox with an opaque ("null") origin (D-023), so its own
    // module scripts and styles are fetched in CORS mode and must be served with ACAO: *.
    cors: true,
  },
});
