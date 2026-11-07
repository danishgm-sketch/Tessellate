import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const root = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37');
export default defineConfig({
  testDir: root,
  testMatch: ['home-demo-hydration.live.spec.ts', 'home-structure-comparison-readiness.live.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'hydration-playwright-report.json') }]],
  outputDir: path.join(root, 'hydration-playwright-output'),
  use: { baseURL: process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/', trace: 'retain-on-failure', screenshot: 'only-on-failure', actionTimeout: 30000, navigationTimeout: 45000 },
  projects: [
    { name: 'sites-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'sites-mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});