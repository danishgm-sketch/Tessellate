/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/tools-hub');
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    const runtime = {
      consoleErrors: [],
      consoleWarnings: [],
      uncaughtExceptions: [],
      failedRequests: [],
      httpErrors: [],
    };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
      if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) =>
      runtime.failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? null,
      })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    const url = `${origin}/tools`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Ten Interface Tools.', level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const screenshot = path.join(directory, 'tools-hub.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    const visibleText = await page.locator('main').innerText();
    page.removeAllListeners('console');
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const evidence = {
      capturedAt: new Date().toISOString(),
      route: url,
      viewport: `${viewport.width}x${viewport.height}`,
      title: await page.title(),
      status: response?.status() ?? null,
      visibleText,
      layout: await page.evaluate(() => ({
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      })),
      accessibility: axe.violations.map(({ id, impact, help }) => ({ id, impact, help })),
      runtime,
      screenshot,
    };
    await writeFile(
      path.join(directory, 'tools-hub.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await context.close();
    console.log(
      `${viewport.name} ${response?.status() ?? 'no-response'} ${visibleText.length} chars`
    );
  }
} finally {
  await browser.close();
}
