import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = process.env.TESSELLATE_ASTRO_PREVIEW_PORT ?? '4377';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'tests/e2e'),
  testMatch: ['accessibility-semantic-labels-step45.spec.ts', 'home-agent-example-regression.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  outputDir: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v49/semantic-accessibility/local-playwright-output'),
  webServer: {
    command: `pnpm --filter @tessellate/site preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'local-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'local-mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
