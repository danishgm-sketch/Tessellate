import process from 'node:process';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'audit/evidence/v26'),
  testMatch: ['live-mobile-filter-hydration-v26.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'audit/evidence/v26/mobile-filter-hydration-results'),
  use: {
    baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'off',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
