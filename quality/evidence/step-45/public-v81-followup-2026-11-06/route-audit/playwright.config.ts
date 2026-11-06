import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.TESS_SITE_URL;
if (!baseURL) throw new Error('Set TESS_SITE_URL to the deployed review Site before running this audit.');
export default defineConfig({
  testDir: process.cwd(),
  testMatch: ['quality/evidence/step-45/public-v81-followup-2026-11-06/route-audit/route-smoke.spec.ts'],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
