import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const evidence = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37');
export default defineConfig({
  testDir: evidence,
  testMatch: 'preview-navigation-live.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: path.join(evidence, 'preview-navigation-live-report.json') }]],
  outputDir: path.join(evidence, 'preview-navigation-live-output'),
  use: {
    baseURL: process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
  },
  projects: [
    { name: 'live-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'live-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
