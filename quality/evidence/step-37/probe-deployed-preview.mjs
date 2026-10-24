/* global window, localStorage */
import { console } from 'node:console';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const baseURL = process.env.TESS_AUDIT_BASE_URL;
if (!baseURL) {
  throw new Error('Set TESS_AUDIT_BASE_URL to the explicitly approved review Site URL.');
}

const outputDirectory = dirname(fileURLToPath(import.meta.url));
await mkdir(outputDirectory, { recursive: true });

const evidence = {
  id: 'SEC-37-DEPLOYED-PREVIEW',
  checkedAt: new Date().toISOString(),
  baseURL,
  viewport: '1440x900',
  routes: [],
  consoleErrors: [],
  consoleWarnings: [],
  uncaughtExceptions: [],
  failedRequests: [],
  errorResponses: [],
  preview: null,
};

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    if (window === window.top) localStorage.setItem('__tessellate_security_probe__', 'parent-only');
  });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
    if (message.type() === 'warning') evidence.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => evidence.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => evidence.failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? 'request failed',
  }));
  page.on('response', (response) => {
    if (response.status() >= 400) evidence.errorResponses.push({ url: response.url(), status: response.status() });
  });

  const home = await page.goto(new URL('/', baseURL).toString(), { waitUntil: 'networkidle' });
  evidence.routes.push({ path: '/', status: home?.status() ?? null });
  await page.screenshot({ path: resolve(outputDirectory, 'deployed-home-1440.png'), fullPage: true });

  const resource = await page.goto(new URL('/r/button', baseURL).toString(), { waitUntil: 'networkidle' });
  evidence.routes.push({ path: '/r/button', status: resource?.status() ?? null });
  const preview = page.locator('iframe').first();
  await preview.waitFor({ state: 'attached', timeout: 20_000 });
  await preview.scrollIntoViewIfNeeded();
  await preview.waitFor({ state: 'visible', timeout: 10_000 });
  const frameElement = await preview.evaluate((element) => ({
    title: element.getAttribute('title'),
    src: element.getAttribute('src'),
    sandbox: element.getAttribute('sandbox'),
  }));
  const frame = await preview.elementHandle().then((element) => element?.contentFrame());
  if (!frame) throw new Error('The deployed resource preview did not expose a browser frame.');
  await frame.waitForLoadState('domcontentloaded');
  const isolation = await frame.evaluate(() => {
    let parentDocumentBlocked = false;
    let parentStorageBlocked = false;
    let parentStorageValue = null;
    try {
      void window.parent.document.body;
    } catch {
      parentDocumentBlocked = true;
    }
    try {
      parentStorageValue = window.parent.localStorage.getItem('__tessellate_security_probe__');
      parentStorageBlocked = parentStorageValue === null;
    } catch {
      parentStorageBlocked = true;
    }
    return {
      origin: window.origin,
      parentDocumentBlocked,
      parentStorageBlocked,
      parentStorageValue,
    };
  });
  const previewResponse = await page.request.get(new URL(frameElement.src, baseURL).toString());
  const contentSecurityPolicy = previewResponse.headers()['content-security-policy'] ?? '';
  evidence.preview = {
    ...frameElement,
    status: previewResponse.status(),
    contentSecurityPolicy,
    isolation,
  };
  await page.screenshot({ path: resolve(outputDirectory, 'deployed-resource-preview-1440.png'), fullPage: true });
  await context.close();
} finally {
  await browser.close();
}

const previewPolicy = evidence.preview?.contentSecurityPolicy ?? '';
const siteOrigin = new URL(baseURL).origin;
const assetSource = `${siteOrigin}/_astro/`;
const scriptSources = previewPolicy.match(/(?:^|;)\s*script-src\s+([^;]+)/)?.[1]?.trim().split(/\s+/) ?? [];
const styleSources = previewPolicy.match(/(?:^|;)\s*style-src\s+([^;]+)/)?.[1]?.trim().split(/\s+/) ?? [];
const checks = {
  home200: evidence.routes.find((route) => route.path === '/')?.status === 200,
  resourceDetail200: evidence.routes.find((route) => route.path === '/r/button')?.status === 200,
  preview200: evidence.preview?.status === 200,
  sandboxIsScriptsOnly: evidence.preview?.sandbox === 'allow-scripts',
  opaqueOrigin: evidence.preview?.isolation.origin === 'null',
  parentDocumentBlocked: evidence.preview?.isolation.parentDocumentBlocked === true,
  parentStorageBlocked: evidence.preview?.isolation.parentStorageBlocked === true,
  previewCspHasNoDefault: evidence.preview?.contentSecurityPolicy.includes("default-src 'none'") ?? false,
  previewCspBlocksApi: !/api\.tessellate\.(design|dev)/i.test(evidence.preview?.contentSecurityPolicy ?? ''),
  previewExecutableSourcesScopedToCompiledAssets:
    scriptSources.includes(assetSource) && styleSources.includes(assetSource) &&
    !scriptSources.includes(siteOrigin) && !styleSources.includes(siteOrigin),
  zeroUncaughtExceptions: evidence.uncaughtExceptions.length === 0,
  zeroConsoleErrors: evidence.consoleErrors.length === 0,
};
evidence.checks = checks;
evidence.result = Object.values(checks).every(Boolean) ? 'passed' : 'failed';
await writeFile(resolve(outputDirectory, 'deployed-preview-runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (evidence.result !== 'passed') process.exitCode = 1;
