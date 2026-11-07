import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('audit/evidence/continued-v24');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const result = {
      url: `${baseURL}/preview/?resource=button`,
      viewport: `${viewport.width}x${viewport.height}`,
      console: [],
      uncaught: [],
      failedRequests: [],
      httpErrors: [],
      externalRequests: [],
    };
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        result.console.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => result.uncaught.push(error.message));
    page.on('requestfailed', (request) =>
      result.failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? 'unknown',
      })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        result.httpErrors.push({ status: response.status(), url: response.url() });
    });
    await page.route('https://example.invalid/**', async (route) => {
      result.externalRequests.push(route.request().url());
      await route.abort();
    });
    const response = await page.goto(result.url, { waitUntil: 'domcontentloaded' });
    result.status = response?.status() ?? null;
    result.csp = response?.headers()['content-security-policy'] ?? null;
    const preview = page.locator('iframe[title="Isolated Tessellate resource preview"]');
    result.sandbox = await preview.getAttribute('sandbox').catch(() => null);
    await page
      .frameLocator('iframe[title="Isolated Tessellate resource preview"]')
      .locator('.tess-screen')
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch((error) => {
        result.renderError = error.message;
      });
    result.screenshot = path.join(
      outputDir,
      `preview-isolation-${viewport.width}x${viewport.height}.png`
    );
    await page.screenshot({ path: result.screenshot, fullPage: true });
    result.opaqueOriginAndStorage = await page.evaluate(() => {
      let blocked = false;
      try {
        globalThis.localStorage.setItem('tessellate-runtime-audit', 'probe');
        globalThis.localStorage.removeItem('tessellate-runtime-audit');
      } catch {
        blocked = true;
      }
      return { origin: globalThis.window.origin, localStorageBlocked: blocked };
    });
    const frame = page.frameLocator('iframe[title="Isolated Tessellate resource preview"]');
    await frame
      .locator('body')
      .evaluate(() => {
        const button = globalThis.document.createElement('button');
        button.textContent = 'Audit popup probe';
        button.addEventListener('click', () =>
          globalThis.window.open('https://example.invalid/popup', '_blank', 'noopener')
        );
        globalThis.document.body.append(button);
      })
      .catch((error) => {
        result.probeSetupError = error.message;
      });
    const popupWait = page
      .waitForEvent('popup', { timeout: 500 })
      .then(() => true)
      .catch(() => false);
    await frame
      .getByRole('button', { name: 'Audit popup probe' })
      .click()
      .catch((error) => {
        result.popupClickError = error.message;
      });
    result.popupOpened = await popupWait;
    const currentURL = page.url();
    await frame
      .locator('body')
      .evaluate(() => {
        const anchor = globalThis.document.createElement('a');
        anchor.href = 'https://example.invalid/anchor';
        anchor.target = '_self';
        globalThis.document.body.append(anchor);
        anchor.click();
      })
      .catch((error) => {
        result.anchorProbeError = error.message;
      });
    await page.waitForTimeout(200);
    result.topLevelNavigationPrevented = page.url() === currentURL;
    results.push(result);
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(
    path.join(outputDir, 'preview-isolation-runtime.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        site: baseURL,
        results,
      },
      null,
      2
    )
  );
}
