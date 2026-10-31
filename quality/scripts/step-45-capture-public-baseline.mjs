/* global process, URL, document, window, localStorage */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const siteUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/';
const outputDirectory = resolve(process.cwd(), 'quality/evidence/step-45');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const captures = [];

for (const target of [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
]) {
  const context = await browser.newContext(target);
  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  const responses = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? 'unknown',
    });
  });
  page.on('response', (response) => {
    const request = response.request();
    const url = new URL(response.url());
    responses.push({
      url: url.origin + url.pathname,
      method: request.method(),
      resourceType: request.resourceType(),
      status: response.status(),
      contentType: response.headers()['content-type'] ?? null,
      contentLength: response.headers()['content-length'] ?? null,
    });
    if (response.status() >= 400) {
      httpErrors.push({ status: response.status(), url: response.url() });
    }
  });

  const response = await page.goto(siteUrl, { waitUntil: 'networkidle', timeout: 60000 });
  const responseHeaders = response ? await response.allHeaders() : {};
  for (const sensitiveHeader of ['set-cookie', 'set-cookie2', 'cookie', 'authorization', 'proxy-authenticate']) {
    delete responseHeaders[sensitiveHeader];
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const layout = await page.evaluate(() => {
    const brief = document.querySelector('#hero-product-brief')
      ?? document.querySelector('main textarea');
    const hero = document.querySelector('main h1')?.closest('section');
    const compose = [...document.querySelectorAll('main button')]
      .find((button) => button.textContent?.trim() === 'Compose');
    const rect = (element) => {
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, bottom: bounds.bottom };
    };
    const fieldsWithoutIdentity = [...document.querySelectorAll('input, textarea, select')]
      .filter((field) => !field.id && !field.getAttribute('name'))
      .map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type'),
        ariaLabel: field.getAttribute('aria-label'),
      }));

    return {
      viewport: window.innerWidth + 'x' + window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      mainHeading: document.querySelector('main h1')?.textContent?.trim() ?? null,
      defaultBrief: brief?.value ?? null,
      heroBounds: rect(hero),
      composeBounds: rect(compose),
      fieldsWithoutIdentity,
      localStorageKeys: Object.keys(localStorage),
    };
  });

  const screenshot = 'pre-rc-home-' + target.name + '.png';
  await page.screenshot({
    path: resolve(outputDirectory, screenshot),
    fullPage: false,
    animations: 'disabled',
  });

  captures.push({
    viewportName: target.name,
    url: page.url(),
    status: response?.status() ?? null,
    responseHeaders,
    layout,
    consoleErrors,
    consoleWarnings,
    pageErrors,
    responses,
    failedRequests,
    httpErrors,
    screenshot,
  });

  await context.close();
}

await browser.close();

const evidence = {
  capturedAt: new Date().toISOString(),
  siteVersion: 20,
  sourceCommitPrefix: '50a2c7f',
  browser: 'Playwright Chromium',
  cleanBrowserContexts: true,
  captures,
};

await writeFile(
  resolve(outputDirectory, 'pre-rc-public-browser.json'),
  JSON.stringify(evidence, null, 2) + '\n',
  'utf8',
);
process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
