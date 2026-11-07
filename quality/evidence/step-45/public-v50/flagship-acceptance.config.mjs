import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const evidence = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v50/flagship');

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['flagship-acceptance-live-v26.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  reporter: 'list',
  outputDir: path.join(evidence, 'playwright-output'),
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'live-v50-desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'live-v50-mobile-390',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
