import { defineConfig, devices } from '@playwright/test';

const previewAppPort = process.env.TESSELLATE_PREVIEW_APP_PORT ?? '4324';
const previewAppBaseUrl = `http://127.0.0.1:${previewAppPort}`;

export default defineConfig({
  testDir: '.',
  testMatch: ['preview-unknown-resource-regression.spec.ts', 'preview-reduced-motion.spec.ts'],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: previewAppBaseUrl,
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
    command: `pnpm --filter @tessellate/preview dev --host 127.0.0.1 --port ${previewAppPort}`,
    url: previewAppBaseUrl,
    reuseExistingServer: process.env.REUSE_PREVIEW_APP_SERVER === 'true',
    timeout: 30000,
  },
});
