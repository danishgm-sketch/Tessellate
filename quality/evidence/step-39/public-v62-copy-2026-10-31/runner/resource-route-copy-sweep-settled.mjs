import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const site = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const out = path.resolve("quality/evidence/step-39/public-v62-copy-2026-10-31/resource-route-sweep-settled");
const response = await fetch(site + "/data/catalog.json");
if (!response.ok) throw new Error("Catalogue request failed: " + response.status);
const catalog = await response.json();
const resources = catalog.resources;
if (!Array.isArray(resources) || resources.length !== 324) throw new Error("Expected 324 catalogue resources");
const slugSet = new Set(resources.map((item) => item.slug));
if (slugSet.size !== resources.length) throw new Error("Duplicate resource slugs in catalogue");

const riskPatterns = [
  ["lorem-ipsum", /\blorem ipsum\b/i],
  ["placeholder-copy", /\b(?:coming soon|your text here|insert (?:text|content)|sample text)\b/i],
  ["unverified-accessibility-guarantee", /\b(?:fully accessible|100%\s*accessible|wcag\s*aaa compliant|zero accessibility issues)\b/i],
  ["unsupported-outcome-guarantee", /\b(?:zero hallucinations|guaranteed results|100%\s*accurate)\b/i],
  ["fake-customer-count", /\b(?:trusted by|used by|joined by)\s+[\d,]+/i],
  ["fake-performance-claim", /\b(?:99\.9%|zero latency|under \d+ms|enterprise-grade security)\b/i],
  ["finance-domain-residue", /\b(?:order book|portfolio allocation|trading terminal|execute trades)\b/i],
];

await mkdir(path.join(out, "screenshots"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const viewports = [
  { label: "1440x900", width: 1440, height: 900 },
  { label: "390x844", width: 390, height: 844 },
];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const workerCount = 4;
  const pages = await Promise.all(Array.from({ length: workerCount }, () => context.newPage()));
  await Promise.all(pages.map(async (page, worker) => {
    let activeSlug = "";
    let state = null;
    const push = (key, item) => { if (state && activeSlug) state[key].push(String(item)); };
    page.on("console", (msg) => { if (msg.type() === "error") push("consoleErrors", msg.text()); else if (msg.type() === "warning") push("consoleWarnings", msg.text()); });
    page.on("pageerror", (error) => push("uncaughtExceptions", error.message));
    page.on("requestfailed", (request) => push("failedRequests", request.method() + " " + request.url() + " " + String(request.failure()?.errorText ?? "")));
    page.on("response", (res) => { if (res.status() >= 400) push("httpErrors", res.status() + " " + res.url()); });
    for (let index = worker; index < resources.length; index += workerCount) {
      const item = resources[index];
      activeSlug = item.slug;
      state = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      const route = "/r/" + encodeURIComponent(item.slug) + "/";
      let status = null;
      let gotoError = null;
      let rendered = null;
      try {
        const pageResponse = await page.goto(site + route, { waitUntil: "networkidle", timeout: 45000 });
        status = pageResponse?.status() ?? null;
        await page.locator("main h1").first().waitFor({ state: "visible", timeout: 15000 });
        rendered = await page.evaluate(() => {
          const main = document.querySelector("main");
          const text = main?.innerText ?? "";
          return {
            title: document.title,
            h1: main?.querySelector("h1")?.innerText.trim() ?? "",
            headings: Array.from(main?.querySelectorAll("h2,h3") ?? []).slice(0, 12).map((node) => node.textContent?.trim() ?? ""),
            textLength: text.length,
            text: text.slice(0, 2400),
            innerWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src).slice(0, 8),
          };
        });
      } catch (error) {
        gotoError = error instanceof Error ? error.message : String(error);
      }
      const visibleText = rendered?.text ?? "";
      const financeRelevant = ["categories", "roles", "tags", "purposes"].some((key) => Array.isArray(item[key]) && item[key].some((value) => /(^|[\s_-])(finance|fintech|trading|market|order-book|liquidity)([\s_-]|$)/i.test(String(value))));
      const copyFlags = riskPatterns.filter(([name, expression]) => expression.test(visibleText) && (name !== "finance-domain-residue" || !financeRelevant)).map(([name]) => name);
      const result = {
        slug: item.slug,
        name: item.name,
        route,
        viewport: viewport.label,
        status,
        gotoError,
        rendered,
        copyFlags,
        runtime: structuredClone(state),
      };
      results.push(result);
      const overflow = !!rendered && rendered.documentWidth > rendered.innerWidth + 1;
      const failed = status !== 200 || !!gotoError || !rendered?.h1 || overflow || !!rendered?.brokenImages?.length ||
        result.runtime.consoleErrors.length || result.runtime.uncaughtExceptions.length ||
        result.runtime.failedRequests.length || result.runtime.httpErrors.length;
      if (failed || copyFlags.length) {
        const file = path.join(out, "screenshots", item.slug + "-" + viewport.label + ".png");
        await page.screenshot({ path: file, fullPage: true }).catch(() => undefined);
        result.screenshot = path.relative(process.cwd(), file).replaceAll("\\", "/");
      }
    }
  }));
  await context.close();
}
await browser.close();
results.sort((a, b) => a.viewport.localeCompare(b.viewport) || a.slug.localeCompare(b.slug));
const summary = {
  siteVersion: 62,
  siteVersionId: "appgprj_6acc036de8cc8191a823339566972d85~appgver_fb7dca8e36c081918770da6cc7cc32ba",
  canonicalSourceCommit: "64cdf8eb5467e2a870f09d158906652e6449451f",
  siteSourceCommit: "d695a5b6e78f5ca7ba53719f1e26fac2c91b522d",
  deploymentId: "appgdep_6ae5fcf2ee008191852bbf74a77b369e",
  site,
  catalogueCount: resources.length,
  uniqueSlugCount: slugSet.size,
  capturedAt: new Date().toISOString(),
  viewportCounts: Object.fromEntries(viewports.map((v) => [v.label, results.filter((r) => r.viewport === v.label).length])),
  statusCounts: results.reduce((acc, row) => { const key = String(row.status); acc[key] = (acc[key] ?? 0) + 1; return acc; }, {}),
  routeFailures: results.filter((r) => r.status !== 200 || r.gotoError || !r.rendered?.h1 || (r.rendered?.documentWidth ?? 0) > (r.rendered?.innerWidth ?? 0) + 1 || r.rendered?.brokenImages?.length || r.runtime.consoleErrors.length || r.runtime.uncaughtExceptions.length || r.runtime.failedRequests.length || r.runtime.httpErrors.length),
  copyFlags: results.filter((r) => r.copyFlags.length).map((r) => ({ slug: r.slug, viewport: r.viewport, flags: r.copyFlags, excerpt: r.rendered?.text, screenshot: r.screenshot ?? null })),
  results,
};
await writeFile(path.join(out, "report.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ output: path.relative(process.cwd(), path.join(out, "report.json")).replaceAll("\\", "/"), routes: results.length, failures: summary.routeFailures.length, copyFlagOccurrences: summary.copyFlags.length, statusCounts: summary.statusCounts }));