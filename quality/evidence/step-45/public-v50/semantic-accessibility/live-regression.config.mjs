import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['accessibility-semantic-labels-step45.spec.ts', 'home-agent-example-regression.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v50/semantic-accessibility/playwright-output'),
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'live-v50-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'live-v50-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
