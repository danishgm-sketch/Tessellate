import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const root = process.cwd();
const output = path.join(root, 'quality/evidence/step-45/public-v50/axe-core-routes');
const siteVersionId = 'appgprj_6acc036de8cc8191a823339566972d85~appgver_90ffb7eea6f0819187554301d0a0011f';
const routes = [
  { id: 'home', path: '/', ready: async (page) => page.getByRole('heading', { name: 'Describe the product. Get the interface.' }).waitFor() },
  { id: 'explore', path: '/explore', ready: async (page) => page.getByRole('heading').first().waitFor() },
  { id: 'compose', path: '/compose', ready: async (page) => page.getByTestId('catalog-status').getByText(/Catalogue ready/i).waitFor() },
  { id: 'resource-button', path: '/r/button/', ready: async (page) => page.getByRole('heading', { name: 'Button', exact: true }).waitFor() },
];
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];
await fs.mkdir(output, { recursive: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    for (const item of routes) {
      const diagnostics = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [], axeInstrumentation: { consoleErrors: [], failedRequests: [] } };
      page.on('console', (message) => {
        if (message.type() === 'error') diagnostics.consoleErrors.push({ url: page.url(), message: message.text() });
        if (message.type() === 'warning' || message.type() === 'warn') diagnostics.consoleWarnings.push({ url: page.url(), message: message.text() });
      });
      page.on('pageerror', (error) => diagnostics.uncaughtExceptions.push({ url: page.url(), message: error.message }));
      page.on('requestfailed', (request) => diagnostics.failedRequests.push({ url: page.url(), request: request.url(), error: request.failure()?.errorText ?? null }));
      page.on('response', (response) => {
        if (response.status() >= 400) diagnostics.httpErrors.push({ url: page.url(), request: response.url(), status: response.status() });
      });

      let status = null;
      let navigationError = null;
      try {
        const response = await page.goto(new URL(item.path, site).toString(), { waitUntil: 'domcontentloaded' });
        status = response?.status() ?? null;
        await item.ready(page);
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      const screenshot = path.join(output, `${item.id}-${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
      const productDiagnostics = structuredClone(diagnostics);
      let axe = null;
      let axeError = null;
      try {
        const errorsBefore = diagnostics.consoleErrors.length;
        const failedBefore = diagnostics.failedRequests.length;
        axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        diagnostics.axeInstrumentation.consoleErrors.push(...diagnostics.consoleErrors.splice(errorsBefore));
        diagnostics.axeInstrumentation.failedRequests.push(...diagnostics.failedRequests.splice(failedBefore));
      } catch (error) {
        axeError = error instanceof Error ? error.message : String(error);
      }
      const violations = axe?.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })) ?? null;
      const severe = violations?.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')) ?? null;
      const result = {
        id: `${item.id}-${viewport.name}`,
        route: item.path,
        url: new URL(item.path, site).toString(),
        viewport: viewport.name,
        httpStatus: status,
        navigationError,
        axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        violations,
        passedRuleCount: axe?.passes.length ?? null,
        incomplete: axe?.incomplete.map((item) => ({
          id: item.id,
          impact: item.impact,
          help: item.help,
          nodes: item.nodes.map((node) => ({
            target: node.target,
            html: node.html,
            any: node.any.map((check) => ({ id: check.id, message: check.message, data: check.data })),
            all: node.all.map((check) => ({ id: check.id, message: check.message, data: check.data })),
            none: node.none.map((check) => ({ id: check.id, message: check.message, data: check.data })),
          })),
        })) ?? null,
        seriousOrCritical: severe,
        axeError,
        productDiagnostics,
        axeInstrumentation: diagnostics.axeInstrumentation,
        screenshot: path.relative(root, screenshot).replaceAll('\\', '/'),
        result: status === 200 && !navigationError && axeError === null && (severe?.length ?? -1) === 0 && Object.values(productDiagnostics).filter(Array.isArray).every((values) => values.length === 0) ? 'PASS' : 'FAIL',
      };
      results.push(result);
      console.log(`${result.id}: HTTP ${status}; violations=${violations?.length ?? 'unavailable'}; serious/critical=${severe?.length ?? 'unavailable'}; product-errors=${productDiagnostics.consoleErrors.length}; axe-policy-errors=${diagnostics.axeInstrumentation.consoleErrors.length}; result=${result.result}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  capturedAt: new Date().toISOString(),
  site,
  siteVersion: 50,
  siteVersionId,
  canonicalSourceCommit: 'd4b0fd88a722225c221d8264b89af70525cb1d7d',
  siteSourceCommit: '11d7a1439caaf641a2d2f78eb2555c00cf30cc34',
  routeCount: routes.length,
  viewportCount: viewports.length,
  results,
  summary: {
    passed: results.filter((item) => item.result === 'PASS').length,
    failed: results.filter((item) => item.result === 'FAIL').length,
    violations: results.reduce((sum, item) => sum + (item.violations?.length ?? 0), 0),
    seriousOrCritical: results.reduce((sum, item) => sum + (item.seriousOrCritical?.length ?? 0), 0),
    incompleteChecks: results.reduce((sum, item) => sum + (item.incomplete?.length ?? 0), 0),
    productConsoleErrors: results.reduce((sum, item) => sum + item.productDiagnostics.consoleErrors.length, 0),
    productUncaught: results.reduce((sum, item) => sum + item.productDiagnostics.uncaughtExceptions.length, 0),
    productFailedRequests: results.reduce((sum, item) => sum + item.productDiagnostics.failedRequests.length, 0),
    productHttpErrors: results.reduce((sum, item) => sum + item.productDiagnostics.httpErrors.length, 0),
    axeInstrumentationErrors: results.reduce((sum, item) => sum + item.axeInstrumentation.consoleErrors.length, 0),
    axeInstrumentationFailedRequests: results.reduce((sum, item) => sum + item.axeInstrumentation.failedRequests.length, 0),
  },
};
await fs.writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
