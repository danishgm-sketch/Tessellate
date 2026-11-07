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

  const response = await page.goto(`${origin}/blocks`, { waitUntil: 'networkidle', timeout: 45000 });
  await expect(page.getByText(/Showing 50 of 56 resources/)).toBeVisible();
  const beforeCount = await page.getByRole('link', { name: /View details|Preview/ }).count();
  const more = page.getByRole('button', { name: 'Show more resources', exact: true });
  await more.scrollIntoViewIfNeeded();
  await expect(more).toBeEnabled();
  await more.click();
  await expect(page.getByText(/Showing 56 of 56 resources/)).toBeVisible({ timeout: 30000 });
  await expect(more).toHaveCount(0);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(output, `blocks-all-resources-${profile.name}.png`), fullPage: false });
  results.push({
    route: '/blocks', profile: profile.name, status: response?.status() ?? null,
    beforeCount, afterCount: await page.getByRole('link', { name: /View details|Preview/ }).count(),
    summary: await page.locator('#explore-catalogue-status').innerText(),
    documentWidth: await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
    viewportWidth: profile.viewport.width, consoleErrors, pageErrors, failedRequests, httpErrors,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(output, 'blocks-show-more.json'), `${JSON.stringify({ siteVersion: 85, canonicalCommit: '8574755fe9c1f51d90357c3a7b039ca6b8adac37', generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
