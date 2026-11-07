/* global document, fetch, getComputedStyle, location */
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const site = process.env.AUDIT_ORIGIN ?? "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const out = path.resolve(process.env.AUDIT_OUTPUT ?? "quality/evidence/step-45/public-v78-reaudit/resource-copy-corpus");
const response = await fetch(site + "/data/catalog.json");
if (!response.ok) throw new Error("Catalogue request failed: " + response.status);
const catalog = await response.json();
const allResources = catalog.resources;
if (!Array.isArray(allResources) || allResources.length !== 324) throw new Error("Expected 324 catalogue resources");
const allSlugs = new Set(allResources.map((resource) => resource.slug));
if (allSlugs.size !== allResources.length) throw new Error("Duplicate catalogue slugs");
const requestedSlugs = new Set(process.argv.find((argument) => argument.startsWith("--slugs="))?.slice("--slugs=".length).split(",").filter(Boolean) ?? []);
const resources = requestedSlugs.size ? allResources.filter((resource) => requestedSlugs.has(resource.slug)) : allResources;
const variants = ["quiet", "expressive", "nocturne"];
const allViewports = [
  { label: "1440x900", width: 1440, height: 900 },
  { label: "390x844", width: 390, height: 844 },
];
const requestedViewports = new Set(process.argv.find((argument) => argument.startsWith("--viewports="))?.slice("--viewports=".length).split(",").filter(Boolean) ?? []);
const viewports = requestedViewports.size ? allViewports.filter((viewport) => requestedViewports.has(viewport.label)) : allViewports;
const workerArgument = Number(process.argv.find((argument) => argument.startsWith("--workers="))?.slice("--workers=".length) ?? 4);
if (resources.length === 0 || (requestedSlugs.size && resources.length !== requestedSlugs.size)) throw new Error("One or more requested resource slugs were not found");
if (viewports.length === 0 || !Number.isInteger(workerArgument) || workerArgument < 1 || workerArgument > 8) throw new Error("Invalid viewport or worker selection");
const riskPatterns = [
  ["lorem-ipsum", /\blorem ipsum\b/i],
  ["placeholder-copy", /\b(?:coming soon|your text here|insert (?:text|content)|sample text|placeholder)\b/i],
  ["unverified-accessibility-guarantee", /\b(?:fully accessible|100%\s*accessible|wcag\s*aaa compliant|zero accessibility issues|accessibility guaranteed)\b/i],
  ["unsupported-outcome-guarantee", /\b(?:zero hallucinations|guaranteed results|100%\s*accurate|results guaranteed)\b/i],
  ["fake-customer-count", /\b(?:trusted by|used by|joined by)\s+[\d,]+/i],
  ["unsupported-performance-claim", /\b(?:99\.9%\s*uptime|zero latency|under \d+\s*ms|enterprise-grade security)\b/i],
];
const financePattern = /\b(?:order book|portfolio allocation|trading terminal|execute trades|stock market|investment return)\b/i;
const results = [];
const browser = await chromium.launch({ headless: true });
await mkdir(path.join(out, "screenshots"), { recursive: true });

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const workers = Math.min(workerArgument, resources.length);
  const pages = await Promise.all(Array.from({ length: workers }, () => context.newPage()));
  await Promise.all(pages.map(async (page, worker) => {
    let state = null;
    page.on("console", (message) => {
      if (state && message.type() === "error") state.consoleErrors.push(message.text());
      if (state && message.type() === "warning") state.consoleWarnings.push(message.text());
    });
    page.on("pageerror", (error) => { if (state) state.uncaughtExceptions.push(error.message); });
    page.on("requestfailed", (request) => {
      if (state) state.failedRequests.push(request.method() + " " + new URL(request.url()).pathname + " " + String(request.failure()?.errorText ?? ""));
    });
    page.on("response", (res) => {
      if (state && res.status() >= 400) state.httpErrors.push(res.status() + " " + new URL(res.url()).pathname);
    });

    for (let index = worker; index < resources.length; index += workers) {
      const resource = resources[index];
      const route = "/r/" + encodeURIComponent(resource.slug) + "/";
      state = { slug: resource.slug, viewport: viewport.label, consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      const row = {
        slug: resource.slug,
        name: resource.name,
        categories: resource.categories,
        roles: resource.roles,
        route,
        viewport: viewport.label,
        status: null,
        gotoError: null,
        title: "",
        heading: "",
        pageText: "",
        accessibleLabels: [],
        variants: [],
        previewMetrics: [],
        riskFlags: [],
        runtime: state,
      };

      try {
        const pageResponse = await page.goto(site + route, { waitUntil: "domcontentloaded", timeout: 60000 });
        row.status = pageResponse?.status() ?? null;
        await page.locator("main h1").first().waitFor({ state: "visible", timeout: 20000 });
        const preview = page.locator('iframe[title$=" live preview"]').first();
        await preview.waitFor({ state: "visible", timeout: 20000 });
        await page.waitForFunction(() => {
          const button = Array.from(document.querySelectorAll("main button[aria-pressed]")).find((candidate) => candidate.textContent?.trim());
          const island = button?.closest("astro-island");
          return Boolean(island && !island.hasAttribute("ssr"));
        }, undefined, { timeout: 30000 });

        const pageContent = await page.evaluate(() => {
          const main = document.querySelector("main");
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
          };
          return {
            title: document.title,
            heading: main?.querySelector("h1")?.innerText.trim() ?? "",
            pageText: main?.innerText ?? "",
            accessibleLabels: Array.from(main?.querySelectorAll("button,a,input,textarea,select,[role='button'],[role='tab']") ?? [])
              .filter(visible)
              .map((element) => ({
                role: element.getAttribute("role") ?? element.tagName.toLowerCase(),
                text: (element.innerText ?? "").trim(),
                ariaLabel: element.getAttribute("aria-label"),
                title: element.getAttribute("title"),
                placeholder: element.getAttribute("placeholder"),
              }))
              .filter((item) => item.text || item.ariaLabel || item.title || item.placeholder),
          };
        });
        row.title = pageContent.title;
        row.heading = pageContent.heading;
        row.pageText = pageContent.pageText;
        row.accessibleLabels = pageContent.accessibleLabels;

        await page.waitForFunction((slug) => Array.from(document.querySelectorAll('iframe[title$=" live preview"]')).some((candidate) => {
          try { return new URL(candidate.src, location.href).searchParams.get("resource") === slug; } catch { return false; }
        }), resource.slug, { timeout: 15000 });
        const previewFrame = page.frameLocator('iframe[title$=" live preview"]');

        for (const variant of variants) {
          const variantButton = page.locator("main").getByRole("button", { name: new RegExp("^" + variant + "$", "i") }).first();
          await variantButton.waitFor({ state: "visible", timeout: 10000 });
          const pressed = await variantButton.getAttribute("aria-pressed");
          if (pressed !== "true") await variantButton.click();
          await page.waitForFunction((value) => Array.from(document.querySelectorAll("main button[aria-pressed]")).some((candidate) => candidate.textContent?.trim().toLowerCase() === value && candidate.getAttribute("aria-pressed") === "true"), variant, { timeout: 15000 });
          await expect(previewFrame.locator("[data-resource-variant]").first()).toHaveAttribute("data-resource-variant", variant, { timeout: 15000 });
          const renderedVariant = await previewFrame.locator("[data-resource-variant]").first().getAttribute("data-resource-variant") ?? "";
          const previewUrl = await preview.getAttribute("src") ?? "";
          const previewText = await previewFrame.locator("body").innerText({ timeout: 15000 }).catch(() => "");
          const previewMetrics = await previewFrame.locator(".tess-screen").evaluate((screen) => {
            const isVisible = (element) => {
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
            };
            return {
              resourceRootFound: Boolean(screen.querySelector("[data-resource-variant]")),
              visibleElementCount: Array.from(screen.querySelectorAll("*")).filter(isVisible).length,
              visibleControlCount: Array.from(screen.querySelectorAll("button,a,input,select,textarea,[role='button']")).filter(isVisible).length,
              svgCount: screen.querySelectorAll("svg").length,
              canvasCount: screen.querySelectorAll("canvas").length,
              imageCount: screen.querySelectorAll("img,video").length,
            };
          });
          row.previewMetrics.push({ variant, ...previewMetrics });
          row.variants.push({ variant, renderedVariant, previewUrl: previewUrl ? new URL(previewUrl, site).pathname + new URL(previewUrl, site).search : "", previewText });
        }
        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
      } catch (error) {
        row.gotoError = error instanceof Error ? error.message : String(error);
      }

      const combinedText = [row.pageText, ...row.variants.map((entry) => entry.previewText), ...row.accessibleLabels.flatMap((label) => [label.text, label.ariaLabel, label.title, label.placeholder])]
        .filter(Boolean)
        .join("\n");
      const financeRelevant = (resource.categories ?? []).some((value) => /finance|fintech|trading|market|portfolio/i.test(String(value)))
        || (resource.roles ?? []).some((value) => /finance|fintech|trading|market|portfolio/i.test(String(value)));
      row.riskFlags = riskPatterns.filter(([, expression]) => expression.test(combinedText)).map(([name]) => name);
      if (!financeRelevant && financePattern.test(combinedText)) row.riskFlags.push("possible-finance-domain-contamination");

      const variantMismatch = row.variants.some((entry) => entry.renderedVariant !== entry.variant);
      const visibleRouteFailure = row.status !== 200 || !!row.gotoError || !row.heading || variantMismatch;
      const runtimeFailure = row.runtime.consoleErrors.length || row.runtime.consoleWarnings.length || row.runtime.uncaughtExceptions.length || row.runtime.failedRequests.length || row.runtime.httpErrors.length;
      if (visibleRouteFailure || runtimeFailure || row.riskFlags.length || row.previewMetrics.some((entry) => !entry.resourceRootFound)) {
        const screenshot = path.join(out, "screenshots", resource.slug + "-" + viewport.label + ".png");
        await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
        row.screenshot = path.relative(process.cwd(), screenshot).replaceAll("\\", "/");
      }
      results.push(row);
      if ((index + 1) % 64 === 0 || index === resources.length - 1) {
        console.log(viewport.label + " worker " + worker + ": finished index " + index + " (" + resource.slug + ")");
      }
    }
  }));
  await context.close();
}
await browser.close();
results.sort((a, b) => a.viewport.localeCompare(b.viewport) || a.slug.localeCompare(b.slug));
const summary = {
  capturedAt: new Date().toISOString(),
  publicSite: site,
  publicVersion: 78,
  versionId: "appgprj_6acc036de8cc8191a823339566972d85~appgver_67206589708c81919ade92023cb90608",
  deploymentId: "appgdep_6aed6cf7cc288191a4ba98ee07ef81fc",
  canonicalSourceCommit: "3e889d0ca68345c5ccf5ef767c3c05ebc07716ca",
  siteSourceCommit: "e6387f7ff8e1080a5a4c191cf00faef813719a3d",
  catalogueVersion: catalog.catalogVersion,
  resourceCount: allResources.length,
  uniqueSlugCount: allSlugs.size,
  selectedResources: resources.map((resource) => resource.slug),
  viewportCounts: Object.fromEntries(viewports.map((viewport) => [viewport.label, results.filter((row) => row.viewport === viewport.label).length])),
  surfaceCount: results.reduce((sum, row) => sum + row.variants.length, 0),
  routeFailures: results.filter((row) => row.status !== 200 || !!row.gotoError || !row.heading),
  runtimeFailures: results.filter((row) => row.runtime.consoleErrors.length || row.runtime.consoleWarnings.length || row.runtime.uncaughtExceptions.length || row.runtime.failedRequests.length || row.runtime.httpErrors.length),
  emptyPreviews: results.filter((row) => row.previewMetrics.some((entry) => !entry.resourceRootFound || (entry.visibleElementCount === 0 && entry.svgCount === 0 && entry.canvasCount === 0 && entry.imageCount === 0))).map((row) => ({ slug: row.slug, viewport: row.viewport, variants: row.previewMetrics.filter((entry) => !entry.resourceRootFound || (entry.visibleElementCount === 0 && entry.svgCount === 0 && entry.canvasCount === 0 && entry.imageCount === 0)).map((entry) => entry.variant) })),
  textlessPreviews: results.flatMap((row) => row.variants.filter((entry) => !entry.previewText.trim()).map((entry) => ({ slug: row.slug, viewport: row.viewport, variant: entry.variant, metrics: row.previewMetrics.find((metric) => metric.variant === entry.variant) ?? null }))),
  variantMismatches: results.flatMap((row) => row.variants.filter((entry) => entry.renderedVariant !== entry.variant).map((entry) => ({ slug: row.slug, viewport: row.viewport, requested: entry.variant, rendered: entry.renderedVariant }))),
  flaggedCopies: results.filter((row) => row.riskFlags.length).map((row) => ({ slug: row.slug, name: row.name, viewport: row.viewport, riskFlags: row.riskFlags, screenshot: row.screenshot ?? null })),
  results,
};
await writeFile(path.join(out, "copy-corpus.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({
  output: path.relative(process.cwd(), path.join(out, "copy-corpus.json")).replaceAll("\\", "/"),
  resourceViewportRoutes: results.length,
  variantPreviews: summary.surfaceCount,
  routeFailures: summary.routeFailures.length,
  runtimeFailures: summary.runtimeFailures.length,
  emptyPreviews: summary.emptyPreviews.length,
  flaggedCopies: summary.flaggedCopies.length,
}));
