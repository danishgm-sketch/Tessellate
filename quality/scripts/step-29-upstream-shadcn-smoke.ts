import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDirectory = path.join(repositoryRoot, 'quality/evidence/step-29/upstream-shadcn');
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:4189';
const routes = ['/', '/examples/dashboard', '/view/new-york-v4/dashboard-01'];

async function main(): Promise<void> {
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const failedResponses: string[] = [];
  let mobileScrollableRegions: Array<Record<string, unknown>> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(`${message.text()} (${message.location().url || 'no location'})`);
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  try {
    const routeResults: Array<Record<string, unknown>> = [];
    for (const route of routes) {
      const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle' });
      assert.equal(response?.status(), 200, `${route} should return HTTP 200`);
      assert.ok(await page.locator('main').count(), `${route} should render a main landmark`);
      const title = await page.title();
      const heading = (await page.locator('h1').first().textContent())?.trim() ?? null;
      assert.ok(heading, `${route} should render a visible page heading`);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} should not overflow at 1440px`
      );
      if (route === '/') {
        await page.screenshot({
          path: path.join(evidenceDirectory, 'desktop.png'),
          fullPage: true,
        });
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        );
        mobileScrollableRegions = await page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>('*'))
            .filter((element) => element.scrollWidth > element.clientWidth + 2)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              className:
                typeof element.className === 'string' ? element.className.slice(0, 120) : '',
              overflowX: getComputedStyle(element).overflowX,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            }))
            .slice(0, 12)
        );
        await page.screenshot({ path: path.join(evidenceDirectory, 'mobile.png'), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 900 });
      }
      routeResults.push({ route, status: response?.status(), title, heading });
    }

    const hostIntegrationFailures = failedResponses.filter((entry) =>
      entry.includes('/_vercel/insights/script.js')
    );
    const unexpectedFailures = failedResponses.filter(
      (entry) => !entry.includes('/_vercel/insights/script.js')
    );
    const result = {
      status: hostIntegrationFailures.length > 0 ? 'DEGRADED' : 'PASS',
      engine: 'Chromium',
      viewports: ['1440x900', '390x844'],
      routes: routeResults,
      horizontalOverflow: false,
      mobileScrollableRegions,
      consoleErrors,
      pageErrors,
      failedRequests,
      failedResponses,
      hostIntegrationFailures,
      unexpectedFailures,
      note:
        hostIntegrationFailures.length > 0
          ? 'Local next start does not provide the Vercel-hosted Analytics script endpoint; each route otherwise rendered successfully.'
          : null,
      screenshots: ['desktop.png', 'mobile.png'],
    };
    fs.writeFileSync(
      path.join(evidenceDirectory, 'browser.json'),
      `${JSON.stringify(result, null, 2)}\n`
    );
    console.log(JSON.stringify(result, null, 2));
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(unexpectedFailures, []);
    assert.ok(
      failedRequests.every((url) => url.includes('/_vercel/insights/script.js')),
      'only the documented Vercel-hosted Analytics script may fail on local next start'
    );
    assert.ok(
      consoleErrors.every((message) => message.includes('/_vercel/insights/script.js')),
      'only the documented Vercel-hosted Analytics script may report a console error'
    );
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
