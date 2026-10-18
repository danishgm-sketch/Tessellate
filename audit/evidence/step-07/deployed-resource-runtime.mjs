/* global process, console, window, document, getComputedStyle, matchMedia */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const runLabel = process.env.TESSELLATE_AUDIT_LABEL ?? 'deployed-v12-before-fix';
const evidenceDir = path.resolve(`audit/evidence/step-07/${runLabel}`);
const evidencePath = (name) => `audit/evidence/step-07/${runLabel}/${name}`;
await fs.mkdir(evidenceDir, { recursive: true });

async function waitForTransitionDuration(page, locator, expected) {
  const deadline = Date.now() + 5000;
  let actual;
  while (Date.now() < deadline) {
    actual = await locator.evaluate((element) => getComputedStyle(element).transitionDuration);
    if (actual === expected) return actual;
    await page.waitForTimeout(50);
  }
  throw new Error(`Timed out waiting for transition-duration ${expected}; received ${actual}.`);
}

const browser = await chromium.launch({ headless: true });
const errors = { console: [], uncaught: [], requests: [], http: [] };
function instrument(page) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning' || message.type() === 'warn') {
      errors.console.push({ level: message.type(), text: message.text(), url: message.location().url });
    }
  });
  page.on('pageerror', (error) => errors.uncaught.push(error.message));
  page.on('requestfailed', (request) => errors.requests.push({ url: request.url(), failure: request.failure()?.errorText ?? 'unknown' }));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.http.push({ status: response.status(), url: response.url() });
  });
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktop = await desktopContext.newPage();
instrument(desktop);
const routeResponse = await desktop.goto(`${baseUrl}/resources/fade-up-reveal/`, { waitUntil: 'networkidle' });
const preview = desktop.frameLocator('iframe[title$=" live preview"]');
const card = preview.locator('div.w-full.p-6');
await card.waitFor({ state: 'visible' });
await waitForTransitionDuration(desktop, card, '0.3s');
const before = await card.evaluate((element) => ({
  transitionDuration: getComputedStyle(element).transitionDuration,
  opacity: getComputedStyle(element).opacity,
  reducedMotionPreference: matchMedia('(prefers-reduced-motion: reduce)').matches,
}));
await desktop.screenshot({ path: path.join(evidenceDir, 'fade-up-initial-1440x900.png'), fullPage: true });

await desktop.getByTitle('Reduced Motion: OFF').click();
await desktop.getByTitle('Reduced Motion: ON').waitFor({ state: 'visible' });
await waitForTransitionDuration(desktop, card, '0s');
const reducedMotionOn = await card.evaluate((element) => ({
  transitionDuration: getComputedStyle(element).transitionDuration,
  animationDuration: getComputedStyle(element).animationDuration,
  reducedMotionPreference: matchMedia('(prefers-reduced-motion: reduce)').matches,
  rootAttribute: document.documentElement.getAttribute('data-tessellate-reduced-motion'),
}));
await desktop.screenshot({ path: path.join(evidenceDir, 'fade-up-reduced-motion-on-1440x900.png'), fullPage: true });
await preview.getByRole('button', { name: 'Replay Entrance' }).click();
await desktop.waitForTimeout(80);
const reducedMotionReplay = await card.evaluate((element) => ({
  opacity: getComputedStyle(element).opacity,
  status: document.querySelector('[role="status"]')?.textContent ?? null,
}));
await desktop.screenshot({ path: path.join(evidenceDir, 'fade-up-reduced-motion-replay-80ms-1440x900.png'), fullPage: true });

await desktop.getByTitle('Reduced Motion: ON').click();
await desktop.getByTitle('Reduced Motion: OFF').waitFor({ state: 'visible' });
await waitForTransitionDuration(desktop, card, '0.3s');
const reducedMotionOff = await card.evaluate((element) => ({
  transitionDuration: getComputedStyle(element).transitionDuration,
  rootAttribute: document.documentElement.getAttribute('data-tessellate-reduced-motion'),
}));

await preview.getByRole('button', { name: 'Replay Entrance' }).click();
await desktop.waitForTimeout(60);
const opacityAt60ms = await card.evaluate((element) => Number(getComputedStyle(element).opacity));
await desktop.screenshot({ path: path.join(evidenceDir, 'fade-up-reduced-motion-replay-60ms-1440x900.png'), fullPage: true });
await desktop.waitForTimeout(300);
const opacityAt360ms = await card.evaluate((element) => Number(getComputedStyle(element).opacity));

const catalogueResponse = await desktopContext.request.get(`${baseUrl}/data/catalog.json`);
const catalogue = catalogueResponse.ok() ? await catalogueResponse.json() : null;
const desktopReport = {
  url: `${baseUrl}/resources/fade-up-reveal/`,
  viewport: '1440x900',
  routeStatus: routeResponse?.status() ?? null,
  catalogueStatus: catalogueResponse.status(),
  catalogueCount: catalogue?.count ?? null,
  before,
  reducedMotionOn,
  reducedMotionReplay,
  reducedMotionOff,
  reducedMotionToggleEffective: reducedMotionOn.transitionDuration === '0s'
    && reducedMotionOn.rootAttribute === 'true'
    && reducedMotionOff.transitionDuration === '0.3s'
    && reducedMotionOff.rootAttribute === null,
  replayOpacity: { at60ms: opacityAt60ms, at360ms: opacityAt360ms },
  console: errors.console,
  uncaught: errors.uncaught,
  failedRequests: errors.requests,
  httpErrors: errors.http,
  screenshots: [
    evidencePath('fade-up-initial-1440x900.png'),
    evidencePath('fade-up-reduced-motion-on-1440x900.png'),
  evidencePath('fade-up-reduced-motion-replay-80ms-1440x900.png'),
  ],
};
await fs.writeFile(path.join(evidenceDir, 'runtime.json'), JSON.stringify(desktopReport, null, 2));

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
const mobile = await mobileContext.newPage();
instrument(mobile);
const mobileResponse = await mobile.goto(`${baseUrl}/resources/fade-up-reveal/`, { waitUntil: 'networkidle' });
const mobileDimensions = await mobile.evaluate(() => ({
  innerWidth: window.innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  bodyWidth: document.body.scrollWidth,
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
}));
await mobile.screenshot({ path: path.join(evidenceDir, 'fade-up-resource-390x844.png'), fullPage: true });
desktopReport.mobile = {
  url: `${baseUrl}/resources/fade-up-reveal/`,
  viewport: '390x844',
  routeStatus: mobileResponse?.status() ?? null,
  ...mobileDimensions,
  console: errors.console,
  uncaught: errors.uncaught,
  failedRequests: errors.requests,
  httpErrors: errors.http,
  screenshot: evidencePath('fade-up-resource-390x844.png'),
};
await fs.writeFile(path.join(evidenceDir, 'runtime.json'), JSON.stringify(desktopReport, null, 2));
await desktopContext.close();
await mobileContext.close();
await browser.close();
console.log(JSON.stringify(desktopReport, null, 2));
