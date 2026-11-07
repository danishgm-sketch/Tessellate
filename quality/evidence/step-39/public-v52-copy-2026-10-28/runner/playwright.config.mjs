
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const root = "C:\\Users\\ismay\\.codex\\worktrees\\product-hardening-canonical\\Tessellate\\quality\\evidence\\step-39\\public-v52-copy-2026-10-28\\runner";
export default defineConfig({
  testDir: root,
  testMatch: ["*.public-v52.spec.ts"],
  outputDir: path.join(root, 'test-results'),
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'report.json') }]],
  use: {
    baseURL: "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site",
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'sites-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'sites-mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
