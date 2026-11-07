import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['accessibility-semantic-labels-step45.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v49/semantic-accessibility/aud-371-before'),
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'v49-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
