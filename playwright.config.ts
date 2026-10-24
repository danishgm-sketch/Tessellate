import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: [
    // Version-pinned live Site probes have their own configs and real deployed
    // base URLs; never silently execute them against this local Astro preview.
    '**/*-live-v*.spec.ts',
    '**/live-*-v*.spec.ts',
    '**/gold-resource-certification.spec.ts',
    '**/preview-unknown-resource-regression.spec.ts',
    '**/preview-reduced-motion.spec.ts',
    '**/sites-preview-csp.spec.ts',
    // The live v25 CSP/security probes require the Sites Worker response headers
    // and opaque-origin asset policy; plain Astro preview cannot satisfy them.
    '**/sites-preview-csp-live-v25.spec.ts',
    // This browser test inspects resource content inside opaque preview frames;
    // it requires the Sites Worker asset CORS policy, not plain `astro preview`.
    '**/core-accessibility-landmarks.spec.ts',
    // This assertion depends on the Sites Worker redirect and response CSP;
    // plain Astro preview does not apply either header behavior.
    '**/sites-unknown-resource-preview.spec.ts',
    // These content/detail audits need the Pages/Sites asset CORS policy for
    // sandboxed preview iframes; plain `astro preview` does not read `_headers`.
    '**/catalog-resource-render.spec.ts',
    '**/copy-quality-step-39.spec.ts',
    '**/resource-copy-truthfulness-step-39.spec.ts',
    // This audit records the Sites Worker runtime. It runs in the dedicated
    // Sites preview config, where opaque-origin preview iframes receive the
    // Worker asset CORS policy, not the plain Astro preview server.
    '**/responsive-hardening-step-36.spec.ts',
    // The Activity Feed disclosure is verified inside its opaque-origin
    // resource preview and therefore belongs to the Sites Worker harness.
    '**/activity-feed-sample-disclosure-step-40.spec.ts',
    // Fault injection includes API proxy failures and therefore belongs to
    // the dedicated Sites Worker runtime, not plain Astro preview.
    '**/fault-injection-step-42.spec.ts',
    // Project scale fixtures are measured in the built Sites Worker profile.
    '**/project-scale-step-43.spec.ts',
    // The one-hour Workbench soak has its own Sites Chromium configuration.
    '**/workbench-long-session-step-43.spec.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  webServer: {
    // Astro detects coding agents and daemonizes preview. Setting this flag
    // forces the normal foreground process Playwright can supervise.
    command: 'pnpm --filter @tessellate/site preview --port 4321',
    url: 'http://localhost:4321',
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
    reuseExistingServer: true,
    timeout: 30000,
  },
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
