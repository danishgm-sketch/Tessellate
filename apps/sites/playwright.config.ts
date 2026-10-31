import { defineConfig } from '@playwright/test';

const deployedURL = process.env.SITES_SMOKE_URL;
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 60000,
  workers: 1,
  reporter: 'list',
  outputDir: '../../test-results/sites',
  use: { baseURL: deployedURL ?? 'http://127.0.0.1:4323', viewport: { width: 1440, height: 1000 } },
  webServer: deployedURL
    ? undefined
    : {
        command: 'pnpm --filter @tessellate/sites preview',
        cwd: '../..',
        url: 'http://127.0.0.1:4323',
        reuseExistingServer: true,
      },
});
