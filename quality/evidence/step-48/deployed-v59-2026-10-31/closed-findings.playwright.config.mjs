import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const evidenceRoot = path.resolve(process.cwd(), 'quality/evidence/step-48/deployed-v59-2026-10-31');

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['sites-a11y-regressions-step-48.spec.ts', 'sites-availability-regressions-step-48.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(evidenceRoot, 'closed-findings-playwright.json') }],
  ],
  outputDir: path.join(evidenceRoot, 'closed-findings-results'),
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'public-v59-desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, isMobile: false },
    },
    {
      name: 'public-v59-mobile-390',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});
