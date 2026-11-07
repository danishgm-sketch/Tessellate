/* global document, getComputedStyle, navigator, window */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = path.resolve('quality/evidence/step-39/deployed-before');
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
    const base = {
      route: url,
      viewport: `${viewport.width}x${viewport.height}`,
      status: response?.status() ?? null,
      title: await page.title(),
    };
    const initial = {
      ...base,
      visibleText: await page.locator('main').innerText(),
      layout: await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
      })),
    };
    initial.screenshot = path.join(outputDirectory, `${viewport.name}-typography-lab.png`);
    await page.screenshot({ path: initial.screenshot, fullPage: true });

    await page.getByRole('button', { name: 'Numerical Telemetry Specimen', exact: true }).click();
    const specimen = await page.locator('main').innerText();
    const specimenScreenshot = path.join(
      outputDirectory,
      `${viewport.name}-typography-specimen.png`
    );
    await page.screenshot({ path: specimenScreenshot, fullPage: true });

    await page.getByRole('button', { name: 'Hierarchical Scale Ladder', exact: true }).click();
    await page.getByRole('button', { name: /Golden Ratio 1\.618/ }).click();
    const scale = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('main h1')].find((node) =>
        node.textContent?.includes('Display Hero Level')
      );
      return {
        fontSize: heading ? getComputedStyle(heading).fontSize : null,
        text: heading?.textContent?.trim() ?? null,
      };
    });
    await page.getByRole('button', { name: 'Copy Scale CSS', exact: true }).click();
    const copiedCss = await page.evaluate(() => navigator.clipboard.readText());
    const finalScreenshot = path.join(
      outputDirectory,
      `${viewport.name}-typography-interaction.png`
    );
    await page.screenshot({ path: finalScreenshot, fullPage: true });

    const evidence = {
      ...base,
      initial,
      numericalSpecimen: specimen,
      goldenRatioScale: scale,
      copiedCss,
      screenshots: [initial.screenshot, specimenScreenshot, finalScreenshot],
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
