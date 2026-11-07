/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = process.env.AUDIT_ORIGIN ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve(process.env.AUDIT_OUTPUT ?? 'quality/evidence/step-39/deployed-before/final-regressions');
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });

    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
      if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) => runtime.failedRequests.push({ method: request.method(), url: request.url(), error: request.failure()?.errorText ?? null }));
    page.on('response', (response) => {
      if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    const resourceUrl = `${origin}/preview/?resource=ai-research-answer&variant=expressive&theme=dark`;
    const resourceResponse = await page.goto(resourceUrl, { waitUntil: 'networkidle' });
    await page.locator('.tess-screen').waitFor({ state: 'visible', timeout: 15000 });
    const resourceAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const resourceScreenshot = path.join(directory, 'ai-research-answer-dark-expressive.png');
    await page.screenshot({ path: resourceScreenshot, fullPage: true });
    const contrastEvidence = {
      capturedAt: new Date().toISOString(),
      route: resourceUrl,
      viewport: `${viewport.width}x${viewport.height}`,
      status: resourceResponse?.status() ?? null,
      accessibility: resourceAxe.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary, html: node.html })),
      })),
      runtime: globalThis.structuredClone(runtime),
      screenshot: resourceScreenshot,
    };
    await writeFile(path.join(directory, 'ai-research-answer-dark-expressive.json'), `${JSON.stringify(contrastEvidence, null, 2)}\n`, 'utf8');

    const route = `${origin}/`;
    const homeResponse = await page.goto(route, { waitUntil: 'networkidle' });
    const searchButton = page.getByRole('button', { name: /Search resources/ });
    await searchButton.focus();
    const focusedBeforeOpen = await searchButton.evaluate((element) => document.activeElement === element);
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Search Tessellate' });
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    const searchInput = dialog.getByRole('textbox', { name: 'Search commands and resources' });
    const focusedAfterOpen = await searchInput.evaluate((element) => document.activeElement === element);
    await page.keyboard.press('Shift+Tab');
    const focusStayedInDialog = await dialog.evaluate((element) => element.contains(document.activeElement));
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached', timeout: 10000 });
    await page.waitForTimeout(100);
    const restoredFocus = await searchButton.evaluate((element) => document.activeElement === element);
    const focusTarget = await page.evaluate(() => ({ tag: document.activeElement?.tagName ?? null, label: document.activeElement?.getAttribute('aria-label') ?? null }));
    const dialogAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const dialogScreenshot = path.join(directory, 'command-palette-focus-return.png');
    await page.screenshot({ path: dialogScreenshot, fullPage: true });
    const focusEvidence = {
      capturedAt: new Date().toISOString(),
      route,
      viewport: `${viewport.width}x${viewport.height}`,
      status: homeResponse?.status() ?? null,
      focusedBeforeOpen,
      focusedAfterOpen,
      focusStayedInDialog,
      restoredFocus,
      focusTargetAfterClose: focusTarget,
      accessibility: dialogAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help })),
      runtime,
      screenshot: dialogScreenshot,
    };
    await writeFile(path.join(directory, 'command-palette-focus-return.json'), `${JSON.stringify(focusEvidence, null, 2)}\n`, 'utf8');
    console.log(`${viewport.name}: contrast ${contrastEvidence.status}, ${contrastEvidence.accessibility.length} Axe violations; focus restored ${restoredFocus}`);
    await context.close();
  }
} finally {
  await browser.close();
}
