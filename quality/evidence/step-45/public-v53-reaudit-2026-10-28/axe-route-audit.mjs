import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('quality/evidence/step-45/public-v53-reaudit-2026-10-28');
const routes = ['/', '/explore', '/compose', '/workbench', '/r/dashboard-kpi-grid/', '/showcase/showcase-playful-hr/'];
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'mobile-390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
];
await mkdir(path.join(outputDir, 'axe'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch, deviceScaleFactor: 1 });
  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', (response) => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }); });
    const url = new URL(route, baseURL).toString();
    let status = null;
    let navigationError = null;
    try {
      status = (await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }))?.status() ?? null;
      await page.locator('body').waitFor({ state: 'visible' });
      await page.waitForTimeout(800);
    } catch (error) { navigationError = String(error); }
    let axe = { violations: [], incomplete: [], error: null };
    try {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      axe = {
        violations: result.violations.map(({ id, impact, help, description, nodes }) => ({ id, impact, help, description, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })),
        incomplete: result.incomplete.map(({ id, impact, help }) => ({ id, impact, help })),
        error: null,
      };
    } catch (error) { axe.error = String(error); }
    const screenshot = path.join(outputDir, 'axe', `${route.replaceAll('/', '_') || 'home'}-${viewport.name}.png`);
    await page.screenshot({ path: screenshot, animations: 'disabled', fullPage: false }).catch(() => undefined);
    results.push({ route, viewport: viewport.name, url: page.url(), status, navigationError, axe, consoleErrors, pageErrors, failedRequests, badResponses, screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/') });
    await page.close();
  }
  await context.close();
}
await browser.close();
await writeFile(path.join(outputDir, 'axe-route-audit.json'), `${JSON.stringify({ site: baseURL, siteVersion: 53, capturedAt: new Date().toISOString(), routes, viewports: viewports.map(({ name, width, height }) => ({ name, width, height })), results }, null, 2)}\n`);
console.log(JSON.stringify({ resultCount: results.length, violations: results.flatMap((result) => result.axe.violations.map((violation) => ({ route: result.route, viewport: result.viewport, id: violation.id, impact: violation.impact, help: violation.help, targets: violation.nodes.map((node) => node.target) }))), runtimeErrors: results.filter((result) => result.navigationError || result.consoleErrors.length || result.pageErrors.length || result.failedRequests.length || result.badResponses.length).map((result) => ({ route: result.route, viewport: result.viewport, navigationError: result.navigationError, consoleErrors: result.consoleErrors, pageErrors: result.pageErrors, failedRequests: result.failedRequests, badResponses: result.badResponses })) }, null, 2));