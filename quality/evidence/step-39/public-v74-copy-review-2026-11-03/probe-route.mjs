import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const site = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const slug = process.argv[2] ?? "dialog";
const out = path.resolve("quality/evidence/step-39/public-v74-copy-review-2026-11-03");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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
const response = await page.goto(`${site}/r/${encodeURIComponent(slug)}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1000);
const iframeElements = await page.locator("iframe").evaluateAll((frames) => frames.map((frame) => ({ src: frame.src, title: frame.title, sandbox: frame.getAttribute("sandbox") })));
const frameState = [];
for (const frame of page.frames()) {
  const state = { url: frame.url() };
  try {
    state.text = (await frame.locator("body").innerText()).slice(0, 2000);
    state.html = (await frame.locator("body").innerHTML()).slice(0, 1000);
    state.variantNodes = await frame.locator("[data-resource-variant]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-resource-variant")));
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
  }
  frameState.push(state);
}
const screenshot = path.join(out, `${slug}-live-probe-1440x900.png`);
await page.screenshot({ path: screenshot, fullPage: true });
console.log(JSON.stringify({ slug, url: page.url(), status: response?.status() ?? null, iframeElements, frameState, runtime, screenshot: path.relative(process.cwd(), screenshot).replaceAll("\\", "/") }, null, 2));
await browser.close();
