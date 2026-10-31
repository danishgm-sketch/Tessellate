import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const root = path.resolve('quality/evidence/step-45/public-v54-reaudit-2026-10-28');
export default defineConfig({
  testDir: path.resolve('tests/e2e'),
  testMatch: ['flagship-generated-product-a11y.spec.ts'],
  outputDir: path.join(root, 'a11y-results'),
  timeout: 180_000,
  expect: { timeout: 25_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'a11y-playwright.json') }]],
  use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [
    { name: 'desktop-1440x900', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-390x844', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});