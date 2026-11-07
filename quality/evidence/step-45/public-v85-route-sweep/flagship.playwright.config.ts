import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  outputDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v85-route-sweep/playwright-artifacts'),
  testMatch: [
    'accessibility-axe.spec.ts',
    'accessibility-hardening-step-35.spec.ts',
    'flagship-acceptance-journey.spec.ts',
    'flagship-generated-product-a11y.spec.ts',
    'resource-claims-and-controls-step-39.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  timeout: 360_000,
  reporter: 'list',
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'sites-chromium-v85',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'sites-mobile-chromium-v85',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});
