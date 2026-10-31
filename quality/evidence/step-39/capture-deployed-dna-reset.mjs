/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/dna-reset');
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

    const url = `${origin}/tools/dna`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Design DNA Lab', level: 1 }).waitFor();
    const preset = page.getByRole('button', { name: /Bold Startup/ });
    await preset.click();
    const beforeReset = await preset.getAttribute('aria-pressed');
    const selectedHeadingBeforeReset = await page.locator('main h2').first().innerText();
    await page.getByRole('button', { name: 'Reset Baseline' }).click();
    const boldClassAfterReset = await preset.getAttribute('class');
    const baselineClassAfterReset = await page
      .getByRole('button', { name: /Institutional Intelligence/ })
      .getAttribute('class');
    const state = {
      boldStartupSelectedAfterReset: await preset.getAttribute('aria-pressed'),
      institutionalIntelligenceSelectedAfterReset: await page
        .getByRole('button', { name: /Institutional Intelligence/ })
        .getAttribute('aria-pressed'),
      selectedHeadingBeforeReset,
      selectedHeadingAfterReset: await page.locator('main h2').first().innerText(),
      boldStartupHasSelectedStyle: boldClassAfterReset?.includes('border-[#2547E8]') ?? false,
      baselineHasSelectedStyle: baselineClassAfterReset?.includes('border-[#2547E8]') ?? false,
    };
    const screenshot = path.join(directory, 'dna-reset-state-mismatch.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    page.removeAllListeners('console');
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const evidence = {
      capturedAt: new Date().toISOString(),
      route: url,
      viewport: `${viewport.width}x${viewport.height}`,
      status: response?.status() ?? null,
      interaction: ['Select Bold Startup', 'Activate Reset Baseline'],
      beforeResetBoldStartupSelected: beforeReset,
      state,
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
      path.join(directory, 'dna-reset-state-mismatch.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await context.close();
    console.log(`${viewport.name} ${response?.status() ?? 'no-response'} ${JSON.stringify(state)}`);
  }
} finally {
  await browser.close();
}
