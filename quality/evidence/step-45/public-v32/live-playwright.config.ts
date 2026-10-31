import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const evidenceDir = path.resolve(
  process.cwd(),
  'quality/evidence/step-45/public-v32/flagship'
);

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: 'flagship-acceptance-live-v26.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 300_000,
  expect: { timeout: 20_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(evidenceDir, 'playwright-report.json') }],
  ],
  outputDir: path.join(evidenceDir, 'playwright-output'),
  use: {
    baseURL:
      process.env.TESSELLATE_AUDIT_URL ??
      'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
