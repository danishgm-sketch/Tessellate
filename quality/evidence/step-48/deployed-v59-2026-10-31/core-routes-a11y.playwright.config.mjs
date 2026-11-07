import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(process.cwd(), "quality/evidence/step-48/deployed-v59-2026-10-31");
const baseURL = process.env.A11Y_BASE_URL ?? "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const usesLocalWorker = baseURL.startsWith("http://127.0.0.1:4325");
export default defineConfig({
  testDir: path.resolve(process.cwd(), "tests/e2e"),
  testMatch: ["accessibility-hardening-step-35.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: [["list"], ["json", { outputFile: path.join(root, "core-routes-axe-playwright.json") }]],
  outputDir: path.join(root, "core-axe-results"),
  use: {
    baseURL,
    trace: "retain-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "sites-v59-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "sites-v59-mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
  webServer: usesLocalWorker ? {
    command: "pnpm --filter @tessellate/sites exec wrangler dev --config ../../dist/server/wrangler.json --local --ip 127.0.0.1 --port 4325 --inspector-port 0",
    url: baseURL,
    reuseExistingServer: process.env.REUSE_SITES_PREVIEW === "true",
    timeout: 30_000,
  } : undefined,
});
