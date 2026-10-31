/* global console, document, getComputedStyle, location, innerWidth, innerHeight */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));

const base = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "routes");
fs.mkdirSync(outDir, { recursive: true });
const previous = JSON.parse(fs.readFileSync(path.resolve("quality/evidence/step-48/deployed-v58-2026-10-31/route-audit.json"), "utf8"));
const routes = [...new Set(previous.routeResults.map(item => item.route))];
const viewports = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const route of routes) {
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
          consoleMessages.push({ type: message.type(), text: message.text().slice(0, 500) });
        }
      });
      page.on("pageerror", error => uncaught.push(String(error).slice(0, 500)));
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
        await page.waitForTimeout(900);
      } catch (error) { navigationError = String(error).slice(0, 500); }
      const data = await page.evaluate(() => {
        const visible = el => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        };
        const headings = [...document.querySelectorAll("h1,h2")].filter(visible)
          .map(el => (el.innerText || "").trim()).filter(Boolean).slice(0, 12);
        const main = document.querySelector("main");
        const text = document.body?.innerText ?? "";
        return {
          url: location.href, title: document.title, viewport: { width: innerWidth, height: innerHeight },
          layout: { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body?.scrollWidth ?? null },
          mainPresent: Boolean(main), mainTextLength: main?.innerText.trim().length ?? 0,
          headings, visibleText: text.slice(0, 1500),
          unresolved: [...document.querySelectorAll('[data-unresolved="true"], [data-resource-status="unresolved"]')].length,
        };
      });
      const filename = route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_/, "").replace(/[^a-z0-9_-]/gi, "_") || "root";
      const screenshot = path.join(outDir, filename + "-" + viewport.name + ".png");
      try { await page.screenshot({ path: screenshot, animations: "disabled" }); }
      catch (error) { navigationError = (navigationError ? navigationError + " | " : "") + String(error).slice(0, 300); }
      const status = response?.status() ?? null;
      const overflow = data.layout.scrollWidth > data.layout.clientWidth;
      const substantive = data.mainPresent ? data.mainTextLength >= 40 : route === "/robots.txt" || route === "/llms.txt" || route === "/data/catalog.json";
      const broken = status !== 200 || uncaught.length > 0 || badResponses.length > 0 || failedRequests.length > 0 || Boolean(navigationError) || !substantive;
      const classification = broken ? "BROKEN" : consoleMessages.length > 0 || overflow || data.unresolved > 0 ? "DEGRADED" : "PASS";
      results.push({
        route, url: base + route, httpStatus: status, title: data.title,
        classification, elapsedMs: Date.now() - started, ...data, viewport: viewport.name, viewportSize: data.viewport, overflow,
        console: consoleMessages, uncaught, network: { failedRequests, badResponses },
        screenshot: path.relative(process.cwd(), screenshot), navigationError,
      });
      await context.close();
      if (results.length % viewports.length === 0) {
        const pair = results.slice(-viewports.length);
        console.log(route + ": " + pair.map(r => `${r.viewport}=${r.httpStatus},${r.classification},overflow=${r.overflow},errors=${r.uncaught.length},failed=${r.network.failedRequests.length}`).join("; "));
      }
    }
  }
} finally { await browser.close(); }
const counts = Object.fromEntries(["PASS", "DEGRADED", "BROKEN"].map(name => [name, results.filter(r => r.classification === name).length]));
const audit = {
  schemaVersion: "1.0.0", deployment: { siteVersion: 59, url: base, auditDate: new Date().toISOString(), sourceCommit: "1cb4327f8d28d6ee842ac88a80189c872cfa77d6" },
  viewports, routeCount: routes.length, counts, results,
};
fs.writeFileSync(path.join(root, "route-audit.json"), JSON.stringify(audit, null, 2) + "\n");
console.log(JSON.stringify({ routeCount: routes.length, resultCount: results.length, counts,
  failures: results.filter(r => r.classification !== "PASS").map(r => ({ route:r.route, viewport:r.viewport, classification:r.classification, httpStatus:r.httpStatus, overflow:r.overflow, console:r.console, uncaught:r.uncaught, network:r.network })) }, null, 2));
