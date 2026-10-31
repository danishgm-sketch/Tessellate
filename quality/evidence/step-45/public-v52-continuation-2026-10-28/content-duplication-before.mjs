import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const dir = path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const output = { site, siteVersion: 52, route: '/showcase/showcase-playful-hr/', capture: [] };
for (const viewport of [
  { name: 'desktop-1440x900', width: 1440, height: 900, mobile: false, touch: false },
  { name: 'mobile-390x844', width: 390, height: 844, mobile: true, touch: true },
]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.mobile, hasTouch: viewport.touch, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const console = [], pageErrors = [], failedRequests = [], badResponses = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.push({ type: m.type(), text: m.text().slice(0, 700) }); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('requestfailed', r => failedRequests.push({ url: r.url(), error: r.failure()?.errorText ?? 'unknown' }));
  page.on('response', r => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }); });
  const response = await page.goto(site + '/showcase/showcase-playful-hr/', { waitUntil: 'domcontentloaded' });
  const headline = 'A better workday starts with people.';
  const description = 'Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.';
  const headings = page.getByRole('heading', { name: headline, exact: true });
  const headingCount = await headings.count();
  const paragraphCount = await page.getByText(description, { exact: true }).count();
  const url = page.url();
  if (headingCount > 1) await headings.nth(1).scrollIntoViewIfNeeded();
  const screenshot = path.join(dir, 'showcase-copy-before-' + viewport.name + '.png');
  await page.screenshot({ path: screenshot, animations: 'disabled', fullPage: false });
  output.capture.push({
    viewport: viewport.name,
    url,
    httpStatus: response?.status() ?? null,
    heroAndCtaHeadlineOccurrences: headingCount,
    repeatedHeroParagraphOccurrences: paragraphCount,
    matchingHeadings: await page.locator('h1,h2').allTextContents(),
    screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
    console,
    pageErrors,
    failedRequests,
    badResponses,
  });
  await context.close();
}
await browser.close();
await writeFile(path.join(dir, 'showcase-copy-before.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
