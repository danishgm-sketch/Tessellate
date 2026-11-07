import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
const root = path.resolve('quality/evidence/step-45/public-v55-reaudit-2026-10-28');
export default defineConfig({
  testDir: root,
  testMatch: ['responsive-live-v55.spec.ts'],
  outputDir: path.join(root, 'responsive-results'),
  timeout: 600000,
  expect: { timeout: 25000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'responsive-playwright.json') }]],
  use: { ...devices['Desktop Chrome'], baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
});