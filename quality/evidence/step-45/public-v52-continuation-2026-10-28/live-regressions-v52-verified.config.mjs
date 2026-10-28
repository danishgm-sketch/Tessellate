import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
const root = path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28');
export default defineConfig({
  testDir: path.resolve('tests/e2e'),
  testMatch: ['showcase-content-copy-regression.spec.ts', 'section-planner-input-identity.spec.ts'],
  outputDir: path.join(root, 'red-regressions-v52-verified'),
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'red-regressions-v52-verified.json') }]],
  use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
