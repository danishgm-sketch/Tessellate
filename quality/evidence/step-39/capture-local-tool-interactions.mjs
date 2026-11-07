/* global console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const origin = 'http://127.0.0.1:4334';
const outputDirectory = path.resolve('quality/evidence/step-39/local-worker');
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const runtime = { consoleErrors: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  const dnaResponse = await page.goto(`${origin}/tools/dna`, { waitUntil: 'networkidle' });
  const feelTab = page.getByRole('button', { name: 'Feel Mixer', exact: true });
  const dnaBefore = await feelTab.getAttribute('aria-pressed');
  await feelTab.click();
  const dnaAfter = await feelTab.getAttribute('aria-pressed');
  const feelDetailsVisible = await page
    .getByText('Feel Mapping Details', { exact: true })
    .isVisible()
    .catch(() => false);
  const dna = {
    status: dnaResponse?.status() ?? null,
    before: dnaBefore,
    after: dnaAfter,
    feelDetailsVisible,
  };
  await page.screenshot({ path: path.join(outputDirectory, 'dna-feel-tab.png'), fullPage: true });

  const layoutResponse = await page.goto(`${origin}/tools/layout`, { waitUntil: 'networkidle' });
  const mobilePreview = page.getByRole('button', { name: 'Mobile preview (375px)' });
  const layoutBefore = await mobilePreview.getAttribute('aria-pressed');
  await mobilePreview.click();
  const layoutAfter = await mobilePreview.getAttribute('aria-pressed');
  const layout = {
    status: layoutResponse?.status() ?? null,
    before: layoutBefore,
    after: layoutAfter,
  };
  await page.screenshot({
    path: path.join(outputDirectory, 'layout-mobile-preview.png'),
    fullPage: true,
  });

  const paletteResponse = await page.goto(`${origin}/tools/palette`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Try sample action' }).click();
  const paletteFeedback = await page
    .getByText(/No transaction was submitted/i)
    .isVisible()
    .catch(() => false);
  const palette = { status: paletteResponse?.status() ?? null, feedbackVisible: paletteFeedback };
  await page.screenshot({
    path: path.join(outputDirectory, 'palette-sample-feedback.png'),
    fullPage: true,
  });

  const evidence = {
    capturedAt: new Date().toISOString(),
    origin,
    viewport: '1440x900',
    dna,
    layout,
    palette,
    runtime,
  };
  await writeFile(
    path.join(outputDirectory, 'tool-interactions.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8'
  );
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
