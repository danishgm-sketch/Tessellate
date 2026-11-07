import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['showcase-content-copy-regression.spec.ts', 'section-planner-input-identity.spec.ts'],
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28/local-regressions-v52-fixed.json') }]],
  outputDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v52-continuation-2026-10-28/local-regressions-v52-fixed'),
  use: {
    baseURL: process.env.SITES_PREVIEW_BASE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});

