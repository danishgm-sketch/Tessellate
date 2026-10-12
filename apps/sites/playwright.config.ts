import { defineConfig } from '@playwright/test';

const deployedURL = process.env.SITES_SMOKE_URL;
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 60000,
  workers: 1,
  reporter: 'list',
  outputDir: '../../test-results/sites',
  use: { baseURL: deployedURL ?? 'http://localhost:4322', viewport: { width: 1440, height: 1000 } },
  webServer: deployedURL ? undefined : {
    command: 'pnpm --filter @tessellate/site preview --config ../sites/astro.preview.config.mjs --port 4322',
    cwd: '../..',
    url: 'http://localhost:4322',
    reuseExistingServer: true,
  },
});
