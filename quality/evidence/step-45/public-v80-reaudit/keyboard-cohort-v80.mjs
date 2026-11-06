import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = 'quality/evidence/step-45/public-v80-reaudit/manual-copy-suspects';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const telemetry = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
page.on('console', message => { if (message.type() === 'error') telemetry.consoleErrors.push(message.text()); if (message.type() === 'warning') telemetry.consoleWarnings.push(message.text()); });
page.on('pageerror', error => telemetry.uncaughtExceptions.push(error.message));
page.on('requestfailed', request => telemetry.failedRequests.push(`${request.method()} ${new URL(request.url()).pathname} ${request.failure()?.errorText ?? ''}`));
page.on('response', response => { if (response.status() >= 400) telemetry.httpErrors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
const response = await page.goto(`${base}/preview-content/?resource=cohort-matrix&variant=quiet&theme=light`, { waitUntil: 'domcontentloaded' });
const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
const region = preview.getByRole('region', { name: 'Cohort retention table' });
await region.waitFor({ state: 'visible', timeout: 20000 });
const dimensions = await region.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
await page.screenshot({ path: path.join(output, 'cohort-matrix-mobile-390x844-keyboard-focus-before.png'), fullPage: true });
await region.focus();
const focusConfirmed = await region.evaluate(element => element === document.activeElement);
const before = await region.evaluate(element => element.scrollLeft);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
const afterArrow = await region.evaluate(element => element.scrollLeft);
await page.keyboard.press('End');
await page.waitForTimeout(250);
const afterEnd = await region.evaluate(element => element.scrollLeft);
await page.screenshot({ path: path.join(output, 'cohort-matrix-mobile-390x844-keyboard-focus-after.png'), fullPage: true });
await writeFile(path.join(output, 'cohort-matrix-keyboard-v80.json'), JSON.stringify({
  capturedAt: new Date().toISOString(),
  siteVersion: 80,
  url: page.url(),
  viewport: '390x844',
  status: response?.status() ?? null,
  regionName: await region.getAttribute('aria-label'),
  tabindex: await region.getAttribute('tabindex'),
  dimensions,
  focusConfirmed,
  scrollLeftBefore: before,
  scrollLeftAfterArrowRight: afterArrow,
  scrollLeftAfterEnd: afterEnd,
  keyboardScrollWorked: afterArrow > before || afterEnd > before,
  telemetry
}, null, 2) + '\n', 'utf8');
await browser.close();
console.log(JSON.stringify({
  status: response?.status() ?? null,
  regionName: await region.getAttribute('aria-label').catch(() => null),
  tabindex: await region.getAttribute('tabindex').catch(() => null),
  dimensions, focusConfirmed, before, afterArrow, afterEnd,
  telemetry
}, null, 2));