import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const origin = process.env.AUDIT_SITE_URL ?? "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const routes = [
  "/", "/explore", "/components", "/sections", "/blocks", "/pages", "/effects",
  "/motion", "/backgrounds", "/ai", "/data", "/compose", "/workbench",
  "/blueprints", "/collections", "/creators", "/showcase", "/showcases", "/trends", "/tools",
  "/agents", "/docs", "/sponsor", "/about", "/license", "/privacy", "/terms",
  "/r/success-state", "/showcase/showcase-playful-hr/", "/blueprints/b2b-saas/",
  "/tools/palette", "/docs/product-hardening"
];
const viewports = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 }
];
const outputDir = path.resolve("quality/evidence/step-39/public-v45");
await fs.mkdir(path.join(outputDir, "routes"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  let active = null;
  page.on("console", msg => { if (active && ["error", "warning"].includes(msg.type())) active.console.push({ type: msg.type(), text: msg.text().slice(0, 600) }); });
  page.on("pageerror", error => { if (active) active.exceptions.push(String(error).slice(0, 600)); });
  page.on("requestfailed", request => { if (active) active.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" }); });
  page.on("response", response => { if (active && response.status() >= 300) active.non200Responses.push({ url: response.url(), status: response.status() }); });
  for (const route of routes) {
    active = { console: [], exceptions: [], failedRequests: [], non200Responses: [] };
    const started = Date.now();
    let responseStatus = null;
    let navigationError = null;
    try {
      const response = await page.goto(new URL(route, origin).href, { waitUntil: "domcontentloaded", timeout: 30000 });
      responseStatus = response?.status() ?? null;
      await page.waitForTimeout(650);
    } catch (error) {
      navigationError = String(error).slice(0, 600);
    }
    let pageState = null;
    try {
      pageState = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        viewport: { width: innerWidth, height: innerHeight },
        document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
        headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 30).map(x => ({ level: x.tagName, text: x.innerText.trim().replace(/\s+/g, " ").slice(0, 150) })),
        links: [...document.querySelectorAll("a[href]")].slice(0, 50).map(x => ({ text: x.innerText.trim().replace(/\s+/g, " ").slice(0, 90), href: x.href })),
        buttons: [...document.querySelectorAll("button")].slice(0, 40).map(x => ({ text: x.innerText.trim().replace(/\s+/g, " ").slice(0, 90), disabled: x.disabled, ariaDisabled: x.getAttribute("aria-disabled") })),
        text: document.body?.innerText.replace(/\s+/g, " ").slice(0, 2600) ?? "",
        overflow: document.documentElement.scrollWidth > innerWidth
      }));
    } catch (error) {
      pageState = { evaluationError: String(error).slice(0, 300) };
    }
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/-$/, "");
    const screenshot = "routes/" + (slug || "home") + "-" + viewport.name + ".png";
    try {
      await page.screenshot({ path: path.join(outputDir, screenshot), animations: "disabled" });
    } catch (error) {
      active.exceptions.push("screenshot: " + String(error).slice(0, 300));
    }
    records.push({
      route, viewport: viewport.name, finalUrl: pageState?.url ?? null,
      httpStatus: responseStatus, navigationMs: Date.now() - started, navigationError,
      title: pageState?.title ?? null, headings: pageState?.headings ?? [],
      overflow: pageState?.overflow ?? null, documentWidth: pageState?.document?.width ?? null,
      viewportWidth: viewport.width, buttons: pageState?.buttons ?? [],
      links: pageState?.links ?? [], bodyText: pageState?.text ?? "",
      console: active.console, exceptions: active.exceptions,
      network: { failedRequests: active.failedRequests, non200Responses: active.non200Responses },
      screenshot
    });
  }
  await context.close();
}
await browser.close();
const result = {
  deploymentUrl: origin,
  siteVersion: 45,
  canonicalRuntimeCommit: "4e7330b90ac37c0b6198e05b8306c6a510d615a9",
  sourceMirrorCommit: "2e486215136e33c05eba0e23b00157133bc9b0ba",
  capturedAt: new Date().toISOString(),
  routeCount: routes.length,
  viewportCount: viewports.length,
  totalCaptures: records.length,
  summary: {
    statusNot200: records.filter(x => x.httpStatus !== 200).length,
    overflow: records.filter(x => x.overflow === true).length,
    consoleErrors: records.reduce((n, x) => n + x.console.filter(m => m.type === "error").length, 0),
    consoleWarnings: records.reduce((n, x) => n + x.console.filter(m => m.type === "warning").length, 0),
    uncaughtExceptions: records.reduce((n, x) => n + x.exceptions.length, 0),
    failedRequests: records.reduce((n, x) => n + x.network.failedRequests.length, 0),
    redirectsOrOtherNon200: records.reduce((n, x) => n + x.network.non200Responses.length, 0)
  },
  routes: records
};
await fs.writeFile(path.join(outputDir, "route-audit.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ ...result.summary, routeCount: routes.length, captures: records.length, report: "quality/evidence/step-39/public-v45/route-audit.json" }, null, 2));


