/* global process, console, document, innerWidth, innerHeight, structuredClone */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Browser evidence, without invoking application stores or composition functions.
const baseURL = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'before';
const directory = path.resolve(`audit/evidence/${phase}/instrumented`);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
const routes = ['/', '/explore', '/components', '/sections', '/blocks', '/pages', '/effects', '/motion', '/backgrounds', '/ai', '/data', '/compose', '/workbench', '/blueprints', '/collections', '/creators', '/showcase', '/trends', '/tools', '/agents', '/docs', '/sponsor', '/about', '/license', '/privacy', '/terms', '/r/button', '/r/area-chart', '/showcases', '/tools/dna', '/docs/registry'];
const observations = [];
let events = { console: [], exceptions: [], network: [], responses: [] };
page.on('console', message => { if (['error', 'warning'].includes(message.type())) events.console.push({ level: message.type(), text: message.text() }); });
page.on('pageerror', error => events.exceptions.push(error.message));
page.on('requestfailed', request => events.network.push({ url: request.url(), failure: request.failure()?.errorText, type: request.resourceType() }));
page.on('response', response => events.responses.push({ url: response.url(), status: response.status(), type: response.request().resourceType() }));
const save = async () => writeFile(path.join(directory, `observations-${Date.now()}.json`), JSON.stringify({ baseURL, phase, recordedAt: new Date().toISOString(), observations }, null, 2));
async function capture(label, scan = false) {
  const dom = await page.evaluate(() => ({ title: document.title, text: document.body.innerText, width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, unhydrated: document.querySelectorAll('astro-island[ssr]').length, headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.textContent), emptyButtons: Array.from(document.querySelectorAll('button')).filter(e => !e.textContent?.trim() && !e.getAttribute('aria-label') && !e.getAttribute('title')).length }));
  const screenshot = path.join(directory, `${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  let accessibility;
  if (scan) {
    try { accessibility = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations; }
    catch (error) { accessibility = { failed: String(error) }; }
  }
  const observation = { label, url: page.url(), screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'), viewport: `${dom.width}x${dom.height}`, dom, ...structuredClone(events), accessibility };
  observations.push(observation);
  await writeFile(path.join(directory, `${label}.json`), JSON.stringify(observation, null, 2));
  console.log(JSON.stringify({ label, url: observation.url, status: events.responses.filter(r => r.type === 'document').map(r => r.status), exceptions: events.exceptions.length, failedRequests: events.network.length, axe: Array.isArray(accessibility) ? accessibility.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length })) : undefined }));
}
try {
  for (const route of routes.slice(Number(process.env.AUDIT_ROUTE_START ?? 0))) {
    events = { console: [], exceptions: [], network: [], responses: [] };
    const response = await page.goto(baseURL + route);
    await page.locator('body').waitFor();
    // Offscreen client:visible islands intentionally retain SSR until scrolled into view.
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr][client="load"]'), undefined, { timeout: 15000 });
    if (route === '/workbench') await page.getByTestId('top-toolbar').waitFor({ timeout: 15000 }).catch(error => events.exceptions.push(String(error)));
    await capture((route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')) + '-1440', ['/', '/explore', '/compose', '/workbench', '/r/button'].includes(route));
    const headers = response?.headers();
    observations.at(-1).headers = headers;
    await page.setViewportSize({ width: 390, height: 844 });
    await capture((route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')) + '-390', ['/', '/explore', '/compose', '/workbench', '/r/button'].includes(route));
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  events = { console: [], exceptions: [], network: [], responses: [] };
  await page.goto(baseURL + '/compose');
  await page.getByTestId('catalog-status').filter({ hasText: 'Catalogue ready' }).waitFor();
  await page.getByLabel('Product Description & Objectives').fill('Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.');
  await page.getByLabel('Desired Feel / Adjectives').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByRole('button', { name: 'Compose Interface System', exact: true }).click();
  await page.getByTestId('direction-card-03').waitFor();
  await capture('flagship-directions', true);
  for (const id of ['01', '02', '03']) await page.getByTestId(`direction-card-${id}`).screenshot({ path: path.join(directory, `direction-${id}.png`) });
  await page.getByTestId('open-workbench-dir-03').click();
  await page.getByTestId('top-toolbar').waitFor();
  await capture('flagship-workbench', true);
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await capture(`flagship-shell-${width}`, false);
  }
} finally {
  await save();
  await browser.close();
}
