import { defineConfig, devices } from '@playwright/test';

const sitesPreviewPort = process.env.TESSELLATE_SITES_PREVIEW_PORT ?? '4323';
const sitesPreviewBaseUrl = `http://127.0.0.1:${sitesPreviewPort}`;

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
    baseURL: sitesPreviewBaseUrl,
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
    command: `pnpm --filter @tessellate/sites exec wrangler dev --config ../../dist/server/wrangler.json --local --ip 127.0.0.1 --port ${sitesPreviewPort} --inspector-port 0`,
    url: sitesPreviewBaseUrl,
    reuseExistingServer: process.env.REUSE_SITES_PREVIEW === 'true',
    timeout: 30000,
  },
});
