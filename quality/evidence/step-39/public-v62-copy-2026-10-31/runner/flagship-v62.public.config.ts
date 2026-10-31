import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "flagship-v62.public.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["json", { outputFile: "flagship-v62-playwright.json" }]],
  timeout: 240_000,
  use: { baseURL: "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site", trace: "retain-on-failure" },
  projects: [
    { name: "sites-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "sites-mobile-chromium", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, isMobile: true } }
  ]
});