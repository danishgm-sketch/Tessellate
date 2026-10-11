import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@tessellate/schemas': path.resolve(__dirname, 'packages/schemas/src/index.ts'),
      '@tessellate/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@tessellate/catalog/gold': path.resolve(__dirname, 'packages/catalog/src/gold.ts'),
      '@tessellate/catalog/protocol': path.resolve(__dirname, 'packages/catalog/src/preview-protocol.ts'),
      '@tessellate/catalog/licenses': path.resolve(__dirname, 'packages/catalog/src/licenses.ts'),
      '@tessellate/catalog': path.resolve(__dirname, 'packages/catalog/src/index.ts'),
      '@tessellate/search': path.resolve(__dirname, 'packages/search/src/index.ts'),
      '@tessellate/dna': path.resolve(__dirname, 'packages/dna/src/index.ts'),
      '@tessellate/composer': path.resolve(__dirname, 'packages/composer/src/index.ts'),
      '@tessellate/compatibility': path.resolve(__dirname, 'packages/compatibility/src/index.ts'),
      '@tessellate/renderer': path.resolve(__dirname, 'packages/renderer/src/index.ts'),
      '@tessellate/workbench': path.resolve(__dirname, 'packages/workbench/src/index.ts'),
      '@tessellate/exporter': path.resolve(__dirname, 'packages/exporter/src/index.ts'),
      '@tessellate/registry': path.resolve(__dirname, 'packages/registry/src/index.ts'),
      '@tessellate/cli': path.resolve(__dirname, 'packages/cli/src/index.ts'),
      '@tessellate/mcp': path.resolve(__dirname, 'packages/mcp/src/index.ts'),
      '@tessellate/testing': path.resolve(__dirname, 'packages/testing/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'apps/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
  },
});
