/* global console */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));

const base = "http://127.0.0.1:4339";
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [
    { name: "desktop-1440x900", width: 1440, height: 900 },
    { name: "mobile-390x844", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text().slice(0, 600)); });
    page.on("requestfailed", request => failedRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? "unknown" }));
    const response = await page.goto(`${base}/pages`, { waitUntil: "domcontentloaded" });
    const copy = page.getByText("A short setup flow that asks for role, team, and goals, then shapes the first workspace around the employee’s needs.", { exact: true });
    await copy.scrollIntoViewIfNeeded();
    await copy.screenshot({ path: path.resolve(`quality/evidence/step-45/public-v32/onboarding-copy-local-after-${viewport.name}.png`) });
    results.push({
      viewport: viewport.name,
      url: page.url(),
      httpStatus: response?.status() ?? null,
      observedCopy: await copy.innerText(),
      screenshot: `quality/evidence/step-45/public-v32/onboarding-copy-local-after-${viewport.name}.png`,
      consoleErrors,
      failedRequests,
    });
    await context.close();
  }
} finally { await browser.close(); }
const result = { generatedAt: new Date().toISOString(), environment: "local Astro production build", results };
fs.writeFileSync(path.resolve("quality/evidence/step-45/public-v32/onboarding-copy-local-after.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
