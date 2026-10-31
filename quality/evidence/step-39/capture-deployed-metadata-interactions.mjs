/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/resource-metadata');
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    for (const scenario of [
      { name: 'palette-preset', path: '/tools/palette', action: async (page) => page.getByRole('button', { name: /Pure Monochrome/ }).click() },
      { name: 'accessibility-tab', path: '/r/success-state', action: async (page) => page.getByRole('tab', { name: 'Accessibility' }).click() },
      { name: 'quality-card', path: '/explore?q=success-state', action: async (page) => page.getByRole('link', { name: 'Success State' }).scrollIntoViewIfNeeded() },
    ]) {
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

      const url = `${origin}${scenario.path}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      await scenario.action(page);
      await page.waitForTimeout(250);
      const screenshot = path.join(directory, `${scenario.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const evidence = {
        capturedAt: new Date().toISOString(),
        route: url,
        viewport: `${viewport.width}x${viewport.height}`,
        status: response?.status() ?? null,
        title: await page.title(),
        visibleText: await page.locator('body').innerText(),
        layout: await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        })),
        accessibility: axe.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary, html: node.html })),
        })),
        runtime,
        screenshot,
      };
      await writeFile(path.join(directory, `${scenario.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
      await context.close();
      console.log(`${viewport.name} ${scenario.name} ${evidence.status} ${evidence.accessibility.length} Axe violations`);
    }
  }
} finally {
  await browser.close();
}
