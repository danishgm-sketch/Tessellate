import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const root = path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28');
export default defineConfig({
  testDir: path.resolve('tests/e2e'),
  testMatch: ['flagship-acceptance-live-v26.spec.ts'],
  outputDir: path.join(root, 'flagship-results'),
  timeout: 240_000,
  expect: { timeout: 25_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'flagship-playwright.json') }]],
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-1440x900', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-390x844', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});