import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const evidenceRoot = path.resolve(
  process.cwd(),
  'quality/evidence/step-48/deployed-v59-2026-10-31'
);

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['flagship-acceptance-live-v26.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 240_000,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(evidenceRoot, 'flagship-playwright.json') }],
  ],
  outputDir: path.join(evidenceRoot, 'playwright-output'),
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'desktop-chromium-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        isMobile: false,
      },
    },
    {
      name: 'mobile-chromium-390',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
