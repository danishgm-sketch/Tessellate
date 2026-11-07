import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const evidenceDir = path.resolve('audit/evidence/deployed-v64-2026-10-31/core-axe');
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const exactBrief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const label = viewport.width === 1440 ? 'desktop-1440' : 'mobile-390';
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); if (message.type() === 'warning') runtime.consoleWarnings.push(message.text()); });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => { if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() }); });
  for (const item of [
    { id: 'home', route: '/', ready: async () => {} },
    { id: 'explore', route: '/explore', ready: async () => {} },
    { id: 'compose', route: '/compose', ready: async () => page.getByTestId('catalog-status').getByText(/Catalogue ready/i).waitFor({ timeout: 30000 }) },
    { id: 'workbench', route: '/workbench', ready: async () => page.getByTestId('top-toolbar').waitFor({ timeout: 30000 }) },
    { id: 'resource-ai-empty-state', route: '/r/ai-empty-state/', ready: async () => page.locator('main h1').waitFor({ timeout: 30000 }) },
  ]) {
    const response = await page.goto(new URL(item.route, baseUrl).toString(), { waitUntil: 'networkidle', timeout: 45000 });
    await item.ready();
    await page.evaluate(() => document.fonts.ready);
    const screenshot = path.join(evidenceDir, `${item.id}-${label}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    results.push({ surface: item.id, route: item.route, viewport, httpStatus: response?.status() ?? null, axe: { violations: axe.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.length, targets: nodes.slice(0, 6).map((node) => node.target) })), passes: axe.passes.length, incomplete: axe.incomplete.length }, runtime: structuredClone(runtime), screenshot: path.relative(process.cwd(), screenshot) });
  }
  await page.goto(new URL('/compose', baseUrl).toString(), { waitUntil: 'networkidle', timeout: 45000 });
  await page.getByTestId('catalog-status').getByText(/Catalogue ready/i).waitFor({ timeout: 30000 });
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await page.getByTestId('direction-preview-03').getByText('Team Overview').waitFor({ timeout: 30000 });
  await page.getByTestId('open-workbench-dir-03').click();
  await page.getByTestId('top-toolbar').waitFor({ timeout: 30000 });
  const generatedScreenshot = path.join(evidenceDir, `generated-employee-workbench-${label}.png`);
  await page.screenshot({ path: generatedScreenshot, fullPage: false });
  const generatedAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  results.push({ surface: 'generated-employee-workbench', route: new URL(page.url()).pathname, viewport, httpStatus: 200, axe: { violations: generatedAxe.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.length, targets: nodes.slice(0, 6).map((node) => node.target) })), passes: generatedAxe.passes.length, incomplete: generatedAxe.incomplete.length }, runtime: structuredClone(runtime), screenshot: path.relative(process.cwd(), generatedScreenshot) });
  await context.close();
}
await browser.close();
const report = { capturedAt: new Date().toISOString(), siteUrl: baseUrl, siteVersion: 64, canonicalCommit: '248a2a09c84a0734998850f8f3b85a14ddf3b78c', sitesSourceCommit: '8aca504b5d4231509bfd4d90d13aec949e979f58', tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'], results };
await writeFile(path.join(evidenceDir, 'results.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ surface, viewport, httpStatus, axe, runtime }) => ({ surface, viewport: `${viewport.width}x${viewport.height}`, httpStatus, violations: axe.violations, errors: runtime.consoleErrors, warnings: runtime.consoleWarnings, uncaught: runtime.uncaughtExceptions, failedRequests: runtime.failedRequests, httpErrors: runtime.httpErrors })), null, 2));
