import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('quality/evidence/step-45/public-v85-route-sweep');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const profile of [
  { name: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: 'mobile-390x844', viewport: { width: 390, height: 844 }, isMobile: true },
]) {
  const context = await browser.newContext(profile);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });

  const response = await page.goto(`${origin}/r/api-key-management`, { waitUntil: 'networkidle', timeout: 45000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const preview = page.frameLocator('iframe[title$="actual preview"], iframe[title$="live preview"]').first();
  await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 25000 });
  const body = await page.locator('main').innerText();
  expect(body).toMatch(/never handles credentials|without handling credentials/i);
  expect(body).not.toMatch(/tess_live_|tess_test_|Production Agent Token|Local Development Key/i);
  const previewText = await preview.locator('body').innerText();
  expect(previewText).toMatch(/example API tokens/i);
  expect(previewText).toMatch(/preview only.*no credentials are created or revoked/i);
  expect(previewText).not.toMatch(/tess_live_|tess_test_|Production Agent Token|Local Development Key/i);
  await page.screenshot({ path: path.join(output, `api-key-detail-${profile.name}.png`), fullPage: false });
  results.push({
    route: '/r/api-key-management', profile: profile.name, status: response?.status() ?? null,
    heading: await page.getByRole('heading', { level: 1 }).innerText(),
    previewLoaded: true, documentWidth: await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
    viewportWidth: profile.viewport.width, consoleErrors, pageErrors, failedRequests, httpErrors,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(output, 'api-key-detail.json'), `${JSON.stringify({ siteVersion: 85, canonicalCommit: '8574755fe9c1f51d90357c3a7b039ca6b8adac37', generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
