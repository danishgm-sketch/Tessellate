import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const evidence = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37');
export default defineConfig({
  testDir: evidence,
  testMatch: 'workbench-replacement-live.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: path.join(evidence, 'workbench-replacement-live-report.json') }]],
  outputDir: path.join(evidence, 'workbench-replacement-live-output'),
  use: {
    baseURL: process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 45000,
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
});
