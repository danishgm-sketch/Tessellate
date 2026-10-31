/* global console, document, innerWidth, innerHeight */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));

const base = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [route, name] of [["/blocks", "blocks"], ["/data", "data"]]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const failedRequests = [];
    const previewResponses = [];
    const pageErrors = [];
    const consoleErrors = [];
    page.on("requestfailed", request => failedRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? "unknown" }));
    page.on("response", response => { if (response.url().includes("/preview-content/")) previewResponses.push({ url: response.url(), status: response.status() }); });
    page.on("pageerror", error => pageErrors.push(String(error)));
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text().slice(0, 500)); });
    await page.goto(base + route, { waitUntil: "domcontentloaded" });
    const checkpoints = [];
    for (const delayMs of [1000, 3000, 8000, 16000]) {
      await page.waitForTimeout(delayMs - (checkpoints.at(-1)?.elapsedMs ?? 0));
      const state = await page.evaluate(() => {
        const intersects = element => {
          const rect = element.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
        };
        const cards = [...document.querySelectorAll('[aria-busy], article')].filter(intersects).slice(0, 6);
        return {
          viewport: { width: innerWidth, height: innerHeight },
          visibleCards: cards.map(card => ({
            busy: card.getAttribute("aria-busy"),
            title: card.querySelector("h2,h3")?.innerText?.trim() ?? "",
            statuses: [...card.querySelectorAll('[role="status"],[role="alert"]')].map(status => status.innerText.trim()),
            iframes: [...card.querySelectorAll("iframe")].map(frame => ({ src: frame.getAttribute("src"), title: frame.title })),
          })),
          loadedPreviewFrames: [...document.querySelectorAll("iframe")].filter(frame => intersects(frame)).length,
        };
      });
      checkpoints.push({ elapsedMs: delayMs, ...state });
    }
    const screenshot = `quality/evidence/step-45/public-v32/${name}-preview-after-16s-390x844.png`;
    await page.screenshot({ path: path.resolve(screenshot), fullPage: false, animations: "disabled" });
    results.push({ route, httpStatus: 200, checkpoints, previewResponses, failedRequests, consoleErrors, pageErrors, screenshot });
    await context.close();
  }
} finally { await browser.close(); }
const result = { generatedAt: new Date().toISOString(), deploymentVersion: 32, site: base, results };
fs.writeFileSync(path.resolve("quality/evidence/step-45/public-v32/mobile-preview-probe.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
