/* global document, innerWidth, URL */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const modulePath = process.env.TESS_PLAYWRIGHT_MODULE;
if (!modulePath) throw new Error('TESS_PLAYWRIGHT_MODULE is required');
const { chromium } = await import(pathToFileURL(path.join(modulePath, 'index.mjs')).href);
const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const out = path.dirname(fileURLToPath(import.meta.url));
const cases = [
  { route: '/', width: 1440, height: 900, screenshot: 'home-1440x900.png' },
  { route: '/compose', width: 1440, height: 900, screenshot: 'compose-1440x900.png' },
  { route: '/', width: 390, height: 844, screenshot: 'home-390x844.png' },
  { route: '/compose', width: 390, height: 844, screenshot: 'compose-390x844.png' },
];
const browser = await chromium.launch({ headless: true });
const routes = [];
try {
  for (const item of cases) {
    const context = await browser.newContext({ viewport: { width: item.width, height: item.height } });
    const page = await context.newPage();
    const consoleIssues = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];
    const requests = [];
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleIssues.push({ type: message.type(), text: message.text() }); });
    page.on('pageerror', error => pageErrors.push(String(error)));
    page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('request', request => requests.push(request.url()));
    page.on('response', response => { if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() }); });
    const response = await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
    if (item.route === '/compose') await page.getByText('Catalogue ready', { exact: false }).waitFor({ state: 'visible', timeoutMs: 12000 }).catch(() => {});
    await page.screenshot({ path: path.join(out, item.screenshot), fullPage: false });
    const metrics = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const hero = h1?.closest('section') ?? h1?.parentElement;
      const presetLabels = [...document.querySelectorAll('button')].map(button => (button.innerText || '').trim()).filter(text => ['AI research terminal','luxury travel marketplace','playful HR platform','developer observability tool','minimalist finance app'].includes(text));
      const body = document.body.innerText;
      return { title: document.title, viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight, heroHeight: hero ? Math.round(hero.getBoundingClientRect().height * 100) / 100 : null, presetLabels, catalogueReady: body.includes('Catalogue ready') };
    });
    routes.push({ route: item.route, viewport: `${item.width}x${item.height}`, url: page.url(), status: response?.status() ?? null, ...metrics, catalogueRequests: requests.filter(url => new URL(url).pathname === '/data/catalog.json').length, requestCount: requests.length, consoleIssues, pageErrors, failedRequests, badResponses, screenshot: item.screenshot });
    await context.close();
  }
  const evidence = { candidate: 'ChatGPT Sites v32 deployed review smoke', siteVersion: 32, canonicalSourceCommit: '4eca97890e2d8182bcd72edfe5659997d4317c21', sitesSourceCommit: '5533d1082b649ec4429bb356cdc91ab3e2f2daf5', versionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_550b4084a3148191b5d355046a002f72', deploymentId: 'appgdep_6adf44a090608191ab748b8458c150ec', deploymentStatus: 'succeeded', publicUrl: `${baseUrl}/`, bindings: { d1: false, r2: false }, capturedAt: new Date().toISOString(), routes };
  fs.writeFileSync(path.join(out, 'smoke.json'), JSON.stringify(evidence, null, 2) + '\n');
  process.stdout.write(JSON.stringify(routes, null, 2) + '\n');
} finally { await browser.close(); }
