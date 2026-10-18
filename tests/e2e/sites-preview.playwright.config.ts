import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'composition-quality-smoke.spec.ts',
    'gold-resource-certification.spec.ts',
    'catalog-resource-render.spec.ts',
    'gold-resource-state-certification.spec.ts',
    'gold-resource-accessibility-certification.spec.ts',
    'gold-dialog-accessibility.spec.ts',
    'gold-resource-state-matrix.spec.ts',
    'gold-resource-action-completion.spec.ts',
    'preview-form-interactions.spec.ts',
    'site-favicon.spec.ts',
    'sites-preview-csp.spec.ts',
    'sites-unknown-resource-preview.spec.ts',
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
      name: 'sites-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'sites-mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @tessellate/sites preview',
    url: 'http://127.0.0.1:4323',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
