/* global process, console, document, getComputedStyle, location, innerWidth, innerHeight */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));

const base = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const outDir = path.resolve("quality/evidence/step-45/public-v37/routes");
fs.mkdirSync(outDir, { recursive: true });
const routes = [
  ["home", "/"], ["explore", "/explore"], ["components", "/components"],
  ["sections", "/sections"], ["blocks", "/blocks"], ["pages", "/pages"],
  ["effects", "/effects"], ["motion", "/motion"], ["backgrounds", "/backgrounds"],
  ["ai", "/ai"], ["data", "/data"], ["compose", "/compose"],
  ["workbench", "/workbench"], ["blueprints", "/blueprints"],
  ["blueprint-detail", "/blueprints/b2b-saas/"], ["collections", "/collections"],
  ["creators", "/creators"], ["showcase", "/showcase"],
  ["showcase-detail", "/showcase/showcase-playful-hr/"], ["trends", "/trends"],
  ["tools", "/tools"], ["tool-detail", "/tools/dna"], ["agents", "/agents"],
  ["docs", "/docs"], ["docs-detail", "/docs/manifest"], ["sponsor", "/sponsor"],
  ["about", "/about"], ["license", "/license"], ["privacy", "/privacy"],
  ["terms", "/terms"], ["resource-detail", "/r/button"],
];
const catalogueRoutes = new Set([
  "/explore", "/components", "/sections", "/blocks", "/effects",
  "/motion", "/backgrounds", "/ai", "/data",
]);
const viewports = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [key, route] of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const consoleMessages = [];
      const uncaught = [];
      const failedRequests = [];
      const badResponses = [];
      page.on("console", message => {
        if (message.type() === "error" || message.type() === "warning") {
          consoleMessages.push({ type: message.type(), text: message.text().slice(0, 700) });
        }
      });
      page.on("pageerror", error => uncaught.push(String(error).slice(0, 700)));
      page.on("requestfailed", request => failedRequests.push({
        url: request.url(), failure: request.failure()?.errorText ?? "unknown",
      }));
      page.on("response", response => {
        if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
      });
      const started = Date.now();
      let response = null;
      let navigationError = null;
      try {
        response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(850);
      } catch (error) { navigationError = String(error).slice(0, 700); }
      let previewWaitTimedOut = false;
      if (catalogueRoutes.has(route)) {
        try {
          await page.waitForFunction(() => {
            const intersects = element => {
              const rect = element.getBoundingClientRect();
              return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
            };
            const visibleFrames = [...document.querySelectorAll('iframe[title$="actual preview"]')].filter(intersects);
            const visibleCards = [...document.querySelectorAll('[aria-busy]')].filter(intersects);
            return visibleFrames.length > 0 && visibleCards.length > 0 && visibleCards.every(card => card.getAttribute("aria-busy") === "false");
          }, null, { timeout: 20000 });
        } catch { previewWaitTimedOut = true; }
      }
      const pageData = await page.evaluate(() => {
        const visible = element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        };
        const text = document.body?.innerText ?? "";
        const headings = [...document.querySelectorAll("h1,h2")].filter(visible)
          .map(element => element.innerText.trim()).filter(Boolean).slice(0, 12);
        const buttons = [...document.querySelectorAll("button")].filter(visible)
          .map(button => ({
            label: (button.innerText || button.getAttribute("aria-label") || button.title || "").trim().slice(0, 140),
            disabled: button.disabled,
          })).filter(button => button.label).slice(0, 40);
        return {
          url: location.href,
          title: document.title,
          viewport: { width: innerWidth, height: innerHeight },
          layout: {
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body?.scrollWidth ?? null,
            scrollHeight: document.documentElement.scrollHeight,
          },
          headings,
          buttons,
          visiblePreviewStates: [...document.querySelectorAll('[aria-busy="true"], [role="alert"], [role="status"]')]
            .filter(visible).map(element => ({
              role: element.getAttribute("role"),
              busy: element.getAttribute("aria-busy"),
              text: element.innerText.trim().slice(0, 180),
            })).slice(0, 30),
          visibleText: text.slice(0, 3500),
        };
      });
      const screenshot = path.join(outDir, `${key}-${viewport.name}.png`);
      try { await page.screenshot({ path: screenshot, fullPage: false, animations: "disabled" }); }
      catch (error) { navigationError = `${navigationError ? `${navigationError} | ` : ""}screenshot: ${String(error).slice(0, 350)}`; }
      const isCspOnly = consoleMessages.length > 0 && consoleMessages.every(message => message.text.includes("Content Security Policy"));
      const hasRuntimeFailure = !response || response.status() !== 200 || uncaught.length > 0 || badResponses.length > 0 || failedRequests.length > 0 || Boolean(navigationError);
      const classification = hasRuntimeFailure ? "BROKEN" : consoleMessages.length > 0 || pageData.layout.scrollWidth > pageData.layout.clientWidth ? "DEGRADED" : "PASS";
      results.push({
        id: `${key}-${viewport.name}`, route, viewport: viewport.name, url: base + route,
        httpStatus: response?.status() ?? null, title: pageData.title,
        classification,
        classificationNote: isCspOnly
          ? "Rendered route has no browser/runtime/network/layout failure, but each Sites response emits one host-injected inline-script CSP error (AUD-342)."
          : classification === "BROKEN" ? "See recorded runtime, HTTP, network, or navigation evidence." : "No runtime/network/layout defect detected by this route smoke; this is not a full interaction or content audit.",
        elapsedMs: Date.now() - started, layout: pageData.layout,
        headings: pageData.headings, buttons: pageData.buttons,
        visiblePreviewStates: pageData.visiblePreviewStates, previewWaitTimedOut,
        visibleText: pageData.visibleText, console: consoleMessages, uncaught,
        network: { failedRequests, badResponses },
        screenshot: path.relative(process.cwd(), screenshot), navigationError,
      });
      await context.close();
      if (results.length % viewports.length === 0) {
        const pair = results.slice(-viewports.length);
        console.log(`${key}: ${pair.map(result => `${result.viewport}=${result.httpStatus},overflow=${result.layout.scrollWidth > result.layout.clientWidth},console=${result.console.length},failed=${result.network.failedRequests.length},previewTimeout=${result.previewWaitTimedOut}`).join("; ")}`);
      }
    }
  }
} finally { await browser.close(); }

const audit = {
  generatedAt: new Date().toISOString(), deploymentVersion: 37, site: base,
  viewportCount: viewports.length,
  routes: routes.map(([key, route]) => ({ key, path: route })), results,
};
fs.writeFileSync(path.resolve("quality/evidence/step-45/public-v37/route-audit.json"), JSON.stringify(audit, null, 2) + "\n");
console.log(JSON.stringify({
  generatedAt: audit.generatedAt,
  count: results.length,
  summary: results.map(result => ({
    id: result.id,
    status: result.httpStatus,
    overflow: result.layout.scrollWidth > result.layout.clientWidth,
    consoleErrors: result.console.filter(message => message.type === "error").length,
    uncaught: result.uncaught.length,
    failed: result.network.failedRequests.length,
    badResponses: result.network.badResponses.length,
    screenshot: result.screenshot,
  })),
}, null, 2));
