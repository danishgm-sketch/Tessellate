import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const auditDirectory = path.resolve(process.cwd(), 'quality/evidence/step-48/deployed-v62-2026-10-31');
const baseURL = process.env.TESSELLATE_DEPLOYED_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';

export default defineConfig({
  testDir: auditDirectory,
  testMatch: ['deployed-recheck.spec.ts'],
  outputDir: path.join(auditDirectory, 'results'),
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'sites-desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'sites-mobile-chromium',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});
