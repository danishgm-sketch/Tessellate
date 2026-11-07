import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve('quality/evidence/step-48/aud449-minimal-top-nav');
await mkdir(root, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const consoleErrors = [];
const consoleWarnings = [];
const failedRequests = [];
const httpErrors = [];
const uncaught = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
  if (message.type() === 'warning') consoleWarnings.push(message.text());
});
page.on('pageerror', (error) => uncaught.push(error.message));
page.on('requestfailed', (request) => failedRequests.push({
  method: request.method(),
  url: request.url(),
  error: request.failure()?.errorText ?? 'unknown failure',
}));
page.on('response', (response) => {
  if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
});

await page.goto('http://127.0.0.1:4325/resources/minimal-top-nav/', { waitUntil: 'networkidle' });
const preview = page.frameLocator('iframe[title$=" live preview"]');
const nav = preview.getByRole('navigation', { name: 'Product screens' });
const toggle = preview.locator('button[aria-controls]');
await toggle.waitFor({ state: 'visible' });
await nav.waitFor({ state: 'hidden' });
await page.screenshot({ path: resolve(root, 'minimal-top-nav-local-mobile-collapsed-after.png'), fullPage: true });

await toggle.click();
await nav.waitFor({ state: 'visible' });
await page.screenshot({ path: resolve(root, 'minimal-top-nav-local-mobile-expanded-after.png'), fullPage: true });

await toggle.press('Escape');
await nav.waitFor({ state: 'hidden' });
const focusRestoredAfterEscape = await toggle.evaluate((element) => element.ownerDocument.activeElement === element);
await page.setViewportSize({ width: 1440, height: 900 });
await nav.waitFor({ state: 'visible' });
await toggle.waitFor({ state: 'hidden' });
await page.screenshot({ path: resolve(root, 'minimal-top-nav-local-desktop-after.png'), fullPage: true });

const report = {
  issueId: 'AUD-449',
  runtime: 'local ChatGPT Sites Worker built from the fixed branch',
  route: '/resources/minimal-top-nav/',
  browser: 'Playwright Chromium',
  viewports: [
    { width: 390, height: 844, navigationInitiallyCollapsed: true, expandOnActivate: true, escapeClosesAndRestoresFocus: focusRestoredAfterEscape },
    { width: 1440, height: 900, navigationVisible: true, toggleHidden: true },
  ],
  consoleErrors,
  consoleWarnings,
  uncaughtExceptions: uncaught,
  failedRequests,
  httpErrors,
  screenshots: [
    'minimal-top-nav-local-mobile-collapsed-after.png',
    'minimal-top-nav-local-mobile-expanded-after.png',
    'minimal-top-nav-local-desktop-after.png',
  ],
};
await writeFile(resolve(root, 'aud449-local-browser-evidence.json'), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

if (consoleErrors.length || uncaught.length || failedRequests.length || httpErrors.length) process.exitCode = 1;
