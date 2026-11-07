import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('deployed isolated preview asks before following Compose link and hands off to ready Compose', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];
  const catalogueStatuses: number[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => {
    if (new URL(response.url()).pathname === '/data/catalog.json') catalogueStatuses.push(response.status());
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  const detailResponse = await page.goto('/r/cta-product-preview');
  expect(detailResponse?.status()).toBe(200);
  const preview = page.frameLocator('iframe[title="CTA Product Preview live preview"]');
  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toBeVisible();
  await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/preview-detail-before-handoff.png'), fullPage: false });

  await composeLink.click();
  const confirmation = page.getByRole('status').filter({ hasText: 'This isolated preview requested a link to' });
  await expect(confirmation).toContainText('/compose');
  await expect(page).toHaveURL(/\/r\/cta-product-preview\/?$/);
  await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/preview-host-confirmation.png'), fullPage: false });

  await confirmation.getByRole('link', { name: 'Open preview link' }).click();
  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 30_000 });
  expect(catalogueStatuses).toContain(200);
  await expect(page.getByTestId('compose-submit-btn')).toBeEnabled();
  await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/preview-compose-ready.png'), fullPage: false });

  await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37'), { recursive: true });
  await writeFile(path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/preview-navigation-live.json'), `${JSON.stringify({
    viewport: page.viewportSize(),
    startUrl: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/r/cta-product-preview',
    finalUrl: page.url(),
    detailHttpStatus: detailResponse?.status(),
    catalogueStatuses,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
  }, null, 2)}\n`);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});
