import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('Compose exposes one page heading followed by its description heading', async ({ page }, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.getByText('Catalogue ready', { exact: true })).toBeVisible();

  const headings = await page.locator('h1, h2, h3').evaluateAll((nodes) =>
    nodes.map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: node.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    }))
  );

  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/compose-heading-order');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `compose-${testInfo.project.name}.png`) });
  await writeFile(
    path.join(evidenceDirectory, `compose-${testInfo.project.name}.json`),
    `${JSON.stringify({
      capturedAt: new Date().toISOString(),
      route: new URL(page.url()).pathname,
      viewport: page.viewportSize(),
      headings,
      runtime,
    }, null, 2)}\n`,
    'utf8'
  );

  expect(headings.filter((heading) => heading.level === 1)).toEqual([
    { level: 1, text: 'Product Composer' },
  ]);
  expect(headings.find((heading) => heading.text === 'Describe the product. Get the interface.')?.level).toBe(2);
  expect(runtime).toEqual({
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
  });
});
