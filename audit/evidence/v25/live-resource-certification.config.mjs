import process from 'node:process';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['resource-dark-expressive-contrast.spec.ts', 'resource-scroll-accessibility.spec.ts', 'site-favicon.spec.ts', 'home-default-brief-truthfulness.spec.ts'],
  fullyParallel: false, workers: 1, timeout: 600000, reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'audit/evidence/v25/resource-certification-results'),
  use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'off' },
  projects: [{ name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }]
});

