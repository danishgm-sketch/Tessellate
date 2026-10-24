/* global document */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = path.resolve('quality/evidence/step-39/before');
await mkdir(outputDirectory, { recursive: true });

const resources = [
  { slug: 'feature-metrics', title: 'Feature Metrics' },
  { slug: 'social-proof-hero', title: 'Social Proof Hero' },
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const resource of resources) {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
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
        if (response.status() >= 400) {
          runtime.httpErrors.push({ url: response.url(), status: response.status() });
        }
      });

      const url = `${baseUrl}/r/${resource.slug}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      const screen = page
        .frameLocator(`iframe[title="${resource.title} live preview"]`)
        .locator('.tess-screen');
      await screen.waitFor({ state: 'visible', timeout: 15_000 });
      const detailText = await page.locator('main').innerText();
      const previewText = await screen.innerText();
      const layout = await page.evaluate(() => ({
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      const screenshot = path.join(
        outputDirectory,
        `${resource.slug}-deployed-before-${viewport.name}.png`
      );
      await page.screenshot({ path: screenshot, fullPage: true });
      const evidence = {
        capturedAt: new Date().toISOString(),
        url: page.url(),
        viewport: { width: viewport.width, height: viewport.height },
        status: response?.status() ?? null,
        detailText,
        previewText,
        layout,
        runtime,
        screenshot,
      };
      await writeFile(
        path.join(outputDirectory, `${resource.slug}-deployed-before-${viewport.name}.json`),
        `${JSON.stringify(evidence, null, 2)}\n`
      );
      await page.close();
    }
  }
} finally {
  await browser.close();
}
