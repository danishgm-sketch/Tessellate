import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const root = path.resolve(process.cwd(), 'quality/evidence/step-48/deployed-v59-2026-10-31');

export default defineConfig({
  testDir: root,
  testMatch: ['flagship-audit-v59.spec.mjs'],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'flagship-audit-playwright.json') }]],
  outputDir: path.join(root, 'flagship-audit-results'),
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'retain-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'public-v59-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'public-v59-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
