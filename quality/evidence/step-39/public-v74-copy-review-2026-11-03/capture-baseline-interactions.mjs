/* global document */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const site = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const out = path.resolve("quality/evidence/step-39/public-v74-copy-review-2026-11-03");
const viewports = [
  { label: "1440x900", width: 1440, height: 900, fullPage: true },
  { label: "390x844", width: 390, height: 844, fullPage: false },
];
const cases = [
  {
    slug: "video-hero",
    buttonName: "Play video showreel",
    expected: "A configured video source plays and the control reflects actual playback.",
    inspect: async (preview) => ({
      playButtonCount: await preview.getByRole("button", { name: "Play video showreel" }).count(),
      pauseButtonCount: await preview.getByRole("button", { name: "Pause video showreel" }).count(),
      videoElementCount: await preview.locator("video").count(),
      previewText: await preview.locator("body").innerText(),
    }),
  },
  {
    slug: "empty-dashboard-state",
    buttonName: "Connect Telemetry Source",
    expected: "The preview discloses that it has no telemetry connection, and the unconnected action is disabled or produces a truthful preview status.",
    inspect: async (preview) => ({
      buttonCount: await preview.getByRole("button", { name: "Connect Telemetry Source" }).count(),
      buttonEnabled: await preview.getByRole("button", { name: "Connect Telemetry Source" }).isEnabled(),
      statusCount: await preview.getByRole("status").count(),
      previewText: await preview.locator("body").innerText(),
    }),
  },
  {
    slug: "empty-workspace",
    buttonName: /create new project/i,
    expected: "The project creation action either completes through the preview host or is disabled with a clear explanation.",
    inspect: async (preview) => ({
      buttonCount: await preview.getByRole("button", { name: /create new project/i }).count(),
      buttonEnabled: await preview.getByRole("button", { name: /create new project/i }).isEnabled(),
      statusCount: await preview.getByRole("status").count(),
      previewText: await preview.locator("body").innerText(),
    }),
  },
];

await mkdir(path.join(out, "screenshots"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const scenario of cases) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
    page.on("console", (message) => {
      if (message.type() === "error") runtime.consoleErrors.push(message.text());
      if (message.type() === "warning") runtime.consoleWarnings.push(message.text());
    });
    page.on("pageerror", (error) => runtime.uncaughtExceptions.push(error.message));
    page.on("requestfailed", (request) => runtime.failedRequests.push(`${request.method()} ${new URL(request.url()).pathname} ${String(request.failure()?.errorText ?? "")}`));
    page.on("response", (response) => {
      if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });

    const route = `/r/${scenario.slug}/`;
    const response = await page.goto(site + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.locator('astro-island[client="load"]').evaluateAll(async (islands) => {
      await Promise.all(islands.map((island) => {
        if (!island.hasAttribute("ssr")) return Promise.resolve();
        return new Promise((resolve) => island.addEventListener("astro:hydrate", resolve, { once: true }));
      }));
    });
    const frameTitle = {
      "video-hero": "Video Hero live preview",
      "empty-dashboard-state": "Empty Dashboard State live preview",
      "empty-workspace": "Empty Workspace live preview",
    }[scenario.slug];
    const iframe = page.locator(`iframe[title="${frameTitle}"]`);
    await iframe.waitFor({ state: "visible" });
    const preview = page.frameLocator(`iframe[title="${frameTitle}"]`);
    const frameBody = preview.locator("body");
    await frameBody.waitFor({ state: "visible" });
    const before = await scenario.inspect(preview);
    const stem = `${scenario.slug}-${viewport.label}`;
    const beforeScreenshot = path.join(out, "screenshots", `${stem}-before.png`);
    const afterScreenshot = path.join(out, "screenshots", `${stem}-after.png`);
    await page.screenshot({ path: beforeScreenshot, fullPage: viewport.fullPage });
    const action = preview.getByRole("button", { name: scenario.buttonName });
    const buttonEnabled = await action.isEnabled();
    if (buttonEnabled) {
      await action.click();
      await page.waitForTimeout(300);
    }
    const after = await scenario.inspect(preview);
    await page.screenshot({ path: afterScreenshot, fullPage: viewport.fullPage });
    const geometry = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));

    results.push({
      route,
      url: page.url(),
      viewport: viewport.label,
      status: response?.status() ?? null,
      expected: scenario.expected,
      before,
      action: buttonEnabled ? `Clicked ${scenario.buttonName} through the visible preview UI.` : `Skipped click because ${scenario.buttonName} is disabled.`,
      after,
      geometry,
      runtime,
      screenshots: {
        before: path.relative(process.cwd(), beforeScreenshot).replaceAll("\\", "/"),
        after: path.relative(process.cwd(), afterScreenshot).replaceAll("\\", "/"),
      },
    });
    await context.close();
  }
}

await browser.close();
const report = {
  capturedAt: new Date().toISOString(),
  publicSite: site,
  publicVersion: 74,
  canonicalSourceCommit: "75276e8078e908b8258fa3d2cba629d71b85cd60",
  siteSourceCommit: "601d4b4069fdcba6bd57a26e2b625dbd42467602",
  results,
};
await writeFile(path.join(out, "baseline-interactions.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  output: path.relative(process.cwd(), path.join(out, "baseline-interactions.json")).replaceAll("\\", "/"),
  checks: results.length,
  statuses: results.map((result) => `${result.route}@${result.viewport}:${result.status}`),
  consoleErrors: results.reduce((sum, result) => sum + result.runtime.consoleErrors.length, 0),
  failedRequests: results.reduce((sum, result) => sum + result.runtime.failedRequests.length, 0),
}));
