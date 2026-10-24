import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'performance-workloads-step-38.spec.ts',
    'site-route-performance-step-38.spec.ts',
    'sites-preview-csp.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4323',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'sites-firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'sites-firefox-mobile',
      use: { ...devices['Desktop Firefox'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'sites-webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'sites-webkit-mobile',
      use: { ...devices['Desktop Safari'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'pnpm --filter @tessellate/sites preview',
    url: 'http://127.0.0.1:4323',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
