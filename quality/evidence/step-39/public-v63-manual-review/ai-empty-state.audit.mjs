/* global window, document, navigator */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const route = '/r/ai-empty-state/';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const results = [];

await mkdir(root, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.name === 'mobile',
      hasTouch: viewport.name === 'mobile',
    });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });
    const page = await context.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    const uncaughtExceptions = [];
    const failedRequests = [];
    const httpErrors = [];
    const redirects = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', (response) => {
      if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
      if (response.status() >= 300 && response.status() < 400) redirects.push({ url: response.url(), status: response.status() });
    });

    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.getByRole('heading', { name: 'AI Empty State', level: 1 }).waitFor();
    const frame = page.locator('iframe[title="AI Empty State live preview"]');
    await frame.waitFor();
    await page.frameLocator('iframe[title="AI Empty State live preview"]').getByRole('heading', { name: 'How can Tessellate assist your build?' }).waitFor();

    const h1 = await page.getByRole('heading', { name: 'AI Empty State', level: 1 }).innerText();
    const description = await page.locator('main').innerText();
    const frameSrcBefore = await frame.getAttribute('src');
    const sandbox = await frame.getAttribute('sandbox');
    const preview = page.frameLocator('iframe[title="AI Empty State live preview"]');
    const renderedVariant = preview.locator('[data-resource-variant]').first();
    const initialRenderedVariant = await renderedVariant.getAttribute('data-resource-variant');
    const exampleButtons = page.frameLocator('iframe[title="AI Empty State live preview"]').getByRole('button');
    const disabledExamples = await exampleButtons.count();
    const allExamplesDisabled = await exampleButtons.evaluateAll((buttons) => buttons.every((button) => button.disabled));
    const initialViewportScreenshot = `ai-empty-state-${viewport.name}-initial-viewport.png`;
    const initialFullPageScreenshot = `ai-empty-state-${viewport.name}-initial-full.png`;
    await page.screenshot({ path: path.join(root, initialViewportScreenshot) });
    await page.screenshot({ path: path.join(root, initialFullPageScreenshot), fullPage: true });

    await page.getByRole('button', { name: 'Expressive' }).focus();
    await page.keyboard.press('Enter');
    await preview.locator('[data-resource-variant="expressive"]').first().waitFor({ state: 'attached' });
    const expressiveActivatedByKeyboard = await page.getByRole('button', { name: 'Expressive' }).getAttribute('aria-pressed');
    const expressiveRenderedVariant = await preview.locator('[data-resource-variant="expressive"]').first().getAttribute('data-resource-variant');
    await page.getByRole('button', { name: 'Nocturne' }).click();
    await preview.locator('[data-resource-variant="nocturne"]').first().waitFor({ state: 'attached' });
    const nocturneRenderedVariant = await preview.locator('[data-resource-variant="nocturne"]').first().getAttribute('data-resource-variant');
    await page.getByRole('button', { name: 'Quiet' }).click();
    await preview.locator('[data-resource-variant="quiet"]').first().waitFor({ state: 'attached' });
    const quietRenderedVariant = await preview.locator('[data-resource-variant="quiet"]').first().getAttribute('data-resource-variant');

    const tabResults = [];
    let previousTabContent = '';
    for (const label of ['Intent', 'Code', 'Variants', 'Anatomy', 'Accessibility', 'Performance', 'Dependencies', 'Versions']) {
      const button = page.getByRole('tab', { name: label, exact: true });
      await button.click();
      const content = await page.locator('main').innerText();
      tabResults.push({ label, active: await button.getAttribute('aria-pressed') ?? await button.getAttribute('aria-selected'), contentChanged: label === 'Intent' ? true : content !== previousTabContent });
      previousTabContent = content;
    }
    await page.getByRole('tab', { name: 'Intent', exact: true }).click();

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    const viewportScreenshot = `ai-empty-state-${viewport.name}-viewport.png`;
    await page.screenshot({ path: path.join(root, viewportScreenshot) });
    const screenshot = `ai-empty-state-${viewport.name}.png`;
    await page.screenshot({ path: path.join(root, screenshot), fullPage: true });
    const appConsoleErrors = [...consoleErrors];
    const appConsoleWarnings = [...consoleWarnings];
    const appUncaughtExceptions = [...uncaughtExceptions];
    const appFailedRequests = [...failedRequests];
    const appHttpErrors = [...httpErrors];
    await page.getByRole('button', { name: 'Copy import' }).click();
    const copiedImport = await page.evaluate(() => navigator.clipboard.readText());
    await page.getByRole('button', { name: 'npx install' }).click();
    const copiedInstallCommand = await page.evaluate(() => navigator.clipboard.readText());
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const axeHarnessConsoleErrors = consoleErrors.slice(appConsoleErrors.length);
    const axeHarnessConsoleWarnings = consoleWarnings.slice(appConsoleWarnings.length);

    results.push({
      siteVersion: 63,
      route: `${baseUrl}${route}`,
      viewport,
      httpStatus: response?.status() ?? null,
      h1,
      sampleHandlerDisclosureVisible: description.includes('require a host-provided prompt handler'),
      frameSrcBefore,
      sandbox,
      initialRenderedVariant,
      disabledExampleButtonCount: disabledExamples,
      allExampleButtonsDisabled: allExamplesDisabled,
      initialViewportScreenshot,
      initialFullPageScreenshot,
      expressiveActivatedByKeyboard,
      renderedVariants: [initialRenderedVariant, expressiveRenderedVariant, nocturneRenderedVariant, quietRenderedVariant],
      variantRoundTripPassed: initialRenderedVariant === 'quiet' && expressiveRenderedVariant === 'expressive' && nocturneRenderedVariant === 'nocturne' && quietRenderedVariant === 'quiet',
      tabs: tabResults,
      copiedImport,
      copiedInstallCommand,
      axe: { violations: axe.violations.length, violationsByImpact: axe.violations.reduce((counts, violation) => ({ ...counts, [violation.impact ?? 'unknown']: (counts[violation.impact ?? 'unknown'] ?? 0) + 1 }), {}) },
      geometry,
      consoleErrors: appConsoleErrors,
      consoleWarnings: appConsoleWarnings,
      uncaughtExceptions: appUncaughtExceptions,
      failedRequests: appFailedRequests,
      httpErrors: appHttpErrors,
      axeHarnessConsoleErrors,
      axeHarnessConsoleWarnings,
      redirects,
      screenshot,
      viewportScreenshot,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  capturedAt: new Date().toISOString(),
  siteVersion: 63,
  deploymentUrl: baseUrl,
  route,
  externalDevToolsIssues: [
    { source: 'Sites-injected Cloudflare challenge script', title: 'Fenced Frame API deprecated' },
    { source: 'Sites-injected Cloudflare challenge script', title: 'StorageType.persistent deprecated' },
    { source: 'Sites-injected Cloudflare challenge script', title: 'Protected Audience API deprecated' },
  ],
  harnessNote: 'The opaque preview iframe keeps its initial URL stable; variant changes are applied through the typed postMessage bridge. The audit checks the rendered data-resource-variant inside the isolated frame instead of expecting the URL to change.',
  results,
};
await writeFile(path.join(root, 'ai-empty-state-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: path.join(root, 'ai-empty-state-report.json'), results: results.map(({ viewport, httpStatus, variantRoundTripPassed, tabs, allExampleButtonsDisabled, axe, geometry, consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, axeHarnessConsoleErrors, axeHarnessConsoleWarnings }) => ({ viewport, httpStatus, variantRoundTripPassed, tabs, allExampleButtonsDisabled, axe, geometry, consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, axeHarnessConsoleErrors, axeHarnessConsoleWarnings })) }, null, 2));
