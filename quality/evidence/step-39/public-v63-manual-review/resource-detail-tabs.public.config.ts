import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: 'resource-detail-tabs-accessibility-step-39.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    [
      'json',
      {
        outputFile: path.resolve(
          process.cwd(),
          process.env.TESS_AUDIT_REPORT ?? 'resource-detail-tabs-playwright.json'
        ),
      },
    ],
  ],
  use: {
    baseURL: process.env.TESS_AUDIT_BASE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
  },
  webServer: process.env.TESS_AUDIT_LOCAL_SITES_WORKER === 'true'
    ? {
        command: 'pnpm --filter @tessellate/sites preview',
        cwd: process.cwd(),
        url: process.env.TESS_AUDIT_BASE_URL ?? 'http://127.0.0.1:4323',
        reuseExistingServer: true,
        timeout: 60000,
      }
    : undefined,
  projects: [
    {
      name: 'sites-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'sites-mobile-chromium',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});
