import process from 'node:process';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['flagship-acceptance-live-v25.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 240000,
  reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'audit/evidence/v25/flagship/test-results'),
  use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'off' },
  projects: [
    { name: 'live-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'live-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});

