import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['workbench-long-session-step-43.spec.ts'],
  timeout: Number(process.env.TESS_STEP43_TIMEOUT_MS ?? 67 * 60_000),
  workers: 1,
  reporter: 'list',
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://127.0.0.1:4323',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'sites-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @tessellate/sites preview',
    url: 'http://127.0.0.1:4323',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
