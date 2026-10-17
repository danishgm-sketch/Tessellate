import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['preview-unknown-resource-regression.spec.ts'],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4324',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'preview-app-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @tessellate/preview dev --host 127.0.0.1 --port 4324',
    url: 'http://127.0.0.1:4324',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
