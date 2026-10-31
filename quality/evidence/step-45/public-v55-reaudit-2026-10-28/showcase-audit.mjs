/* global document, innerWidth, innerHeight */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const root = path.resolve('quality/evidence/step-45/public-v55-reaudit-2026-10-28');
const outputDir = path.join(root, 'showcases');
await mkdir(outputDir, { recursive: true });
const ids = JSON.parse(await readFile('apps/site/public/data/showcases/index.json', 'utf8')).map((item) => item.id);
const browser = await chromium.launch({ headless: true });
const results = [];
for (const viewport of [
  { name: 'desktop-1440x900', width: 1440, height: 900, mobile: false, touch: false },
  { name: 'mobile-390x844', width: 390, height: 844, mobile: true, touch: true },
]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.mobile, hasTouch: viewport.touch, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const id of ids) {
    const page = await context.newPage();
    const item = { id, route: '/showcase/' + id + '/', viewport: viewport.name, console: [], pageErrors: [], failedRequests: [], badResponses: [] };
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') item.console.push({ type: m.type(), text: m.text().slice(0, 700) }); });
    page.on('pageerror', (e) => item.pageErrors.push(String(e)));
    page.on('requestfailed', (r) => item.failedRequests.push({ url: r.url(), error: r.failure()?.errorText ?? 'unknown' }));
    page.on('response', (r) => { if (r.status() >= 400) item.badResponses.push({ url: r.url(), status: r.status() }); });
    const response = await page.goto(site + item.route, { waitUntil: 'domcontentloaded' });
    item.httpStatus = response?.status() ?? null;
    item.title = await page.title();
    item.visibleTitle = await page.locator('main h1').first().textContent().catch(() => null);
    item.headings = await page.locator('main h1, main h2').allTextContents();
    item.duplicateHeadings = Object.entries(item.headings.map(x => x.trim()).filter(Boolean).reduce((a,x) => (a[x]=(a[x]||0)+1,a), {})).filter(([,n]) => n > 1);
    item.markers = await page.locator('main').innerText().then((x) => ({
      placeholder: /lorem ipsum|coming soon|todo|example heading/i.test(x),
      financeTerms: /trading|order book|portfolio|market depth/i.test(x),
      employeeTerms: /employee|colleague|onboarding|people/i.test(x),
    }));
    const dims = await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 }));
    item.dimensions = dims;
    item.screenshot = path.relative(process.cwd(), path.join(outputDir, id + '-' + viewport.name + '.png')).replaceAll('\\', '/');
    await page.screenshot({ path: path.join(outputDir, id + '-' + viewport.name + '.png'), animations: 'disabled', fullPage: false });
    results.push(item);
    await page.close();
  }
  await context.close();
}
await browser.close();
const report = { site, siteVersion: 55, capturedAt: new Date().toISOString(), showcaseCount: ids.length, viewportCount: 2, results };
await writeFile(path.join(root, 'showcase-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ showcaseCount: ids.length, results: results.map(({ id, route, viewport, httpStatus, title, visibleTitle, duplicateHeadings, dimensions, console, pageErrors, failedRequests, badResponses }) => ({ id, route, viewport, httpStatus, title, visibleTitle, duplicateHeadings, dimensions, console, pageErrors, failedRequests, badResponses })) }, null, 2));
