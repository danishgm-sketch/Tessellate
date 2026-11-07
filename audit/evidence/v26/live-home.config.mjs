import path from 'node:path';
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['home-demo-hydration.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  outputDir: path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR
      ? `${process.env.TESSELLATE_EVIDENCE_DIR}/test-results`
      : 'test-results/home-demo-hydration',
  ),
  use: {
    baseURL: process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    trace: 'off',
  },
  projects: [
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
