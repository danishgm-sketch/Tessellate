import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  testMatch: ['composition-benchmark.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 3_600_000,
  use: {
    baseURL: 'http://localhost:4325',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'composition-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'composition-mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
    {
      name: 'composition-tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @tessellate/site preview --port 4325',
    url: 'http://localhost:4325',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
