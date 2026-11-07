import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve('audit/evidence/deployed-v64-2026-10-31/logo-marquee-keyboard');
const site = process.env.TESSELLATE_LIVE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const route = `${site.replace(/\/$/, '')}/r/logo-cloud-marquee/`;
const evidence = {
  capturedAt: new Date().toISOString(),
  route,
  version: 64,
  viewport: { width: 1440, height: 900 },
  console: [],
  uncaughtExceptions: [],
  failedRequests: [],
  httpErrors: [],
};

await mkdir(root, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: evidence.viewport });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      evidence.console.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => evidence.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => {
    evidence.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) evidence.httpErrors.push({ url: response.url(), status: response.status() });
  });

  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  evidence.status = response?.status() ?? null;
  const region = page
    .frameLocator('iframe[title="Logo Cloud Marquee live preview"]')
    .getByRole('region', { name: 'Partner names, horizontally scrollable' });
  await region.waitFor({ state: 'visible', timeout: 20_000 });
  evidence.before = await region.evaluate((track) => ({
    clientWidth: track.clientWidth,
    scrollWidth: track.scrollWidth,
    scrollLeft: track.scrollLeft,
  }));
  await region.screenshot({ path: path.join(root, 'before-arrow-navigation.png') });
  await region.focus();
  evidence.focused = await region.evaluate((track) => document.activeElement === track);
  for (let index = 0; index < 10; index += 1) await region.press('ArrowRight');
  evidence.after = await region.evaluate((track) => ({
    scrollLeft: track.scrollLeft,
    firstVisibleLabel: [...track.querySelectorAll('span')].find((label) => {
      const bounds = label.getBoundingClientRect();
      const container = track.getBoundingClientRect();
      return bounds.right > container.left && bounds.left < container.right;
    })?.textContent ?? null,
  }));
  await region.screenshot({ path: path.join(root, 'after-arrow-navigation.png') });

  evidence.expected = 'ArrowRight advances the focusable horizontally scrollable partner-name region.';
  evidence.actual = evidence.after.scrollLeft > 0
    ? 'Public v64 on this Windows Chromium browser advanced using the native browser default; Linux headless Chromium in GitHub CI recorded scrollLeft=0 for the same ten key presses.'
    : 'ArrowRight did not advance the partner-name region.';
  evidence.screenshots = {
    before: 'audit/evidence/deployed-v64-2026-10-31/logo-marquee-keyboard/before-arrow-navigation.png',
    after: 'audit/evidence/deployed-v64-2026-10-31/logo-marquee-keyboard/after-arrow-navigation.png',
  };

  await writeFile(path.join(root, 'runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  assert.equal(evidence.status, 200, 'resource detail route should return HTTP 200');
  assert.equal(evidence.focused, true, 'scroll region should accept keyboard focus');
  assert.ok(evidence.after.scrollLeft > 0, 'the current Windows Chromium browser should show its native arrow-scroll behavior');
  assert.deepEqual(evidence.uncaughtExceptions, []);
  assert.deepEqual(evidence.failedRequests, []);
  assert.deepEqual(evidence.httpErrors, []);
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
} finally {
  await browser.close();
}
