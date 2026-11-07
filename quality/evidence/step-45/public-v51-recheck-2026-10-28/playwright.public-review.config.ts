import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const outputDir = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28/playwright-output');

export default defineConfig({
  testDir: path.resolve('tests/e2e'),
  outputDir,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
  ],
});
