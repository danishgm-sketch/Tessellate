import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v32'),
  testMatch: 'a11y-live-v32.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  reporter: 'list',
  use: {
    baseURL:
      process.env.TESSELLATE_AUDIT_URL ??
      'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-390',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
