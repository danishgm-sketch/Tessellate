import { defineConfig, devices } from '@playwright/test';
import * as os from 'node:os';
import * as path from 'node:path';
import { E2E_DAEMON_TOKEN } from './tests/e2e/support/daemon-env';

/** Fresh local D1 state per run, so account tests never collide with data from earlier runs. */
const apiState = path.join(os.tmpdir(), `tessellate-e2e-d1-${Date.now()}`);
const wrangler = 'pnpm --filter @tessellate/api exec wrangler';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  webServer: [
    {
      command: 'pnpm --filter @tessellate/site preview --port 4321',
      url: 'http://localhost:4321',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      // Isolated preview origin (D-023): resource previews never run on the site origin.
      command: 'pnpm --filter @tessellate/preview preview --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      // Real API + local D1 (migrated from empty) for account, admin and queue journeys.
      command:
        `${wrangler} d1 migrations apply tessellate-db --local --persist-to "${apiState}" && ` +
        `${wrangler} dev --port 8787 --ip 127.0.0.1 --persist-to "${apiState}" ` +
        `--var ENVIRONMENT:test --var ADMIN_EMAILS:owner@tessellate.test --var PUBLIC_SITE_URL:http://localhost:4321 ` +
        `--var BETTER_AUTH_URL:http://localhost:8787 --var BETTER_AUTH_SECRET:e2e-only-secret-not-for-production ` +
        `--var DAEMON_DEV_TOKEN:${E2E_DAEMON_TOKEN}`,
      url: 'http://127.0.0.1:8787/health',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  // Order (D-033): the offline spec runs with no host connected, then the real daemon starts and every
  // other journey (including composition) runs through the queue and the promoted brief model.
  projects: [
    {
      name: 'host-offline',
      testMatch: /intelligence-offline\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'host-daemon',
      testMatch: /daemon\.setup\.ts$/,
      dependencies: ['host-offline'],
      teardown: 'host-daemon-stop',
    },
    { name: 'host-daemon-stop', testMatch: /daemon\.teardown\.ts$/ },
    {
      name: 'desktop-chrome',
      testIgnore: [/intelligence-offline\.spec\.ts/, /daemon\.(setup|teardown)\.ts$/],
      dependencies: ['host-daemon'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chrome',
      testIgnore: [/intelligence-offline\.spec\.ts/, /daemon\.(setup|teardown)\.ts$/],
      dependencies: ['host-daemon'],
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
