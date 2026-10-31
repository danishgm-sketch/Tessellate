/* global process */
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['sites-preview-csp.spec.ts', 'explore-filter-control-identity.spec.ts', 'core-accessibility-landmarks.spec.ts'],
  fullyParallel: false, workers: 1, reporter: 'list',
  use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'off' },
  projects: [{ name: 'live-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
});
