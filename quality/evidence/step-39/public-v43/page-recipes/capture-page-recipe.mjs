import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const siteUrl = process.argv[2] ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const evidenceSuffix = process.argv[3] ?? 'before';
const outputDirectory = path.dirname(fileURLToPath(import.meta.url));
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const records = [];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const record = {
    url: `${siteUrl}/pages`,
    viewport: `${viewport.width}x${viewport.height}`,
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
    requests: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') record.consoleErrors.push(message.text());
    if (message.type() === 'warning') record.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => record.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    record.failedRequests.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
    )
  );
  page.on('response', (response) => {
    record.requests.push({
      method: response.request().method(),
      url: response.url(),
      status: response.status(),
      resourceType: response.request().resourceType(),
    });
    if (response.status() >= 400) {
      record.httpErrors.push({ status: response.status(), url: response.url() });
    }
  });

  const routeResponse = await page.goto(record.url, { waitUntil: 'networkidle' });
  record.routes = [{ url: page.url(), status: routeResponse?.status() ?? null }];
  const card = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Application Overview Dashboard' }),
  });
  record.recipeDescription = await card.locator('p').nth(1).innerText();
  await page.screenshot({
    path: path.join(outputDirectory, `pages-${evidenceSuffix}-${record.viewport}.png`),
    fullPage: true,
  });

  await card.getByRole('link', { name: /Compose this architecture/ }).click();
  await page.getByRole('textbox', { name: 'Product Description & Objectives' }).waitFor();
  await page.getByText('Catalogue ready').waitFor();
  record.routes.push({ url: page.url(), status: (await page.request.get(page.url())).status() });
  record.composerBrief = await page.getByRole('textbox', { name: 'Product Description & Objectives' }).inputValue();
  await page.getByRole('button', { name: 'Compose Interface System' }).click();
  await page.getByRole('heading', { name: 'Inferred Product Architecture' }).waitFor();
  record.architectureText = await page.locator('main').innerText();
  record.document = await page.evaluate(() => {
    const browserDocument = globalThis.document;
    return {
      title: browserDocument.title,
      width: browserDocument.documentElement.scrollWidth,
      clientWidth: browserDocument.documentElement.clientWidth,
      unresolvedResourceText: /unresolved resource|resource unavailable/i.test(
        browserDocument.body.innerText
      ),
    };
  });
  await page.screenshot({
    path: path.join(outputDirectory, `compose-${evidenceSuffix}-${record.viewport}.png`),
    fullPage: true,
  });
  records.push(record);
  await context.close();
}

await browser.close();
const result = { siteUrl, capturedAt: new Date().toISOString(), records };
await writeFile(
  path.join(outputDirectory, `deployed-${evidenceSuffix}.json`),
  `${JSON.stringify(result, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
