/* global document, getComputedStyle, navigator, window */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const origin = 'http://localhost:4321';
const outputDirectory = path.resolve('quality/evidence/step-39/after-typography');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    const runtime = {
      consoleErrors: [],
      uncaughtExceptions: [],
      failedRequests: [],
      httpErrors: [],
    };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) =>
      runtime.failedRequests.push({
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText ?? null,
      })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    const url = `${origin}/tools/typography`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Typography Lab', level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const screenshots = {};
    screenshots.hierarchy = path.join(outputDirectory, `${viewport.name}-typography-lab.png`);
    await page.screenshot({ path: screenshots.hierarchy, fullPage: true });

    await page.getByRole('button', { name: 'Tabular Figure Sample', exact: true }).click();
    const specimenText = await page.locator('main').innerText();
    screenshots.specimen = path.join(outputDirectory, `${viewport.name}-typography-specimen.png`);
    await page.screenshot({ path: screenshots.specimen, fullPage: true });

    await page.getByRole('button', { name: 'Hierarchical Scale Ladder', exact: true }).click();
    await page.getByRole('button', { name: /Golden Ratio 1\.618/ }).click();
    const computedHeading = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('main h1')].find((node) =>
        node.textContent?.includes('A product, shaped by people.')
      );
      return {
        text: heading?.textContent?.trim() ?? null,
        fontSize: heading ? getComputedStyle(heading).fontSize : null,
      };
    });
    await page.getByRole('button', { name: 'Copy Scale CSS', exact: true }).click();
    const copiedCss = await page.evaluate(() => navigator.clipboard.readText());
    screenshots.interaction = path.join(
      outputDirectory,
      `${viewport.name}-typography-interaction.png`
    );
    await page.screenshot({ path: screenshots.interaction, fullPage: true });

    const evidence = {
      capturedAt: new Date().toISOString(),
      route: url,
      viewport: `${viewport.width}x${viewport.height}`,
      status: response?.status() ?? null,
      title: await page.title(),
      layout: await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      })),
      specimenText,
      computedHeading,
      copiedCss,
      screenshots,
      runtime,
    };
    await writeFile(
      path.join(outputDirectory, `${viewport.name}-typography-lab.json`),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await context.close();
  }
} finally {
  await browser.close();
}
