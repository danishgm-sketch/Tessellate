import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('resource preview CTA opens Compose through a trusted host confirmation', async ({ page }) => {
  const catalogueResponses: number[] = [];
  page.on('response', (response) => {
    if (new URL(response.url()).pathname === '/data/catalog.json') {
      catalogueResponses.push(response.status());
    }
  });

  await page.goto('/r/cta-product-preview');
  const preview = page.frameLocator('iframe[title="CTA Product Preview live preview"]');
  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toBeVisible();

  await composeLink.click();

  const confirmation = page.getByRole('status').filter({
    hasText: 'This isolated preview requested a link to',
  });
  await expect(confirmation).toContainText('/compose');
  await expect(confirmation).toContainText('This isolated preview requested a link to /compose');
  await expect(page).toHaveURL(/\/r\/cta-product-preview\/?$/);
  const viewport = test.info().project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve('quality/evidence/step-39/after/preview-navigation');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `${viewport}-confirmation.png`),
    fullPage: true,
  });
  await confirmation.getByRole('link', { name: 'Open preview link' }).click();

  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 30_000 });
  expect(catalogueResponses).toContain(200);
  await expect(page.getByTestId('compose-submit-btn')).toBeEnabled();
  await page.screenshot({
    path: path.join(evidenceDirectory, `${viewport}-compose-ready.png`),
    fullPage: false,
  });
});
test('Explore opens the full resource page before following a preview link', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await page.getByLabel('Search catalogue').fill('CTA Product Preview');
  await expect(page.getByRole('link', { name: 'CTA Product Preview', exact: true })).toBeVisible();

  const frame = page.locator('iframe[title="CTA Product Preview actual preview"]');
  await frame.scrollIntoViewIfNeeded();
  const card = page.locator('div.group').filter({ has: frame }).first();
  await card.hover();
  await card.getByRole('link', { name: 'Preview', exact: true }).click();
  await expect(page).toHaveURL(/\/r\/cta-product-preview\/?$/);

  const preview = page.frameLocator('iframe[title="CTA Product Preview live preview"]');
  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toBeVisible();
  await composeLink.click();
  const confirmation = page.getByRole('status').filter({
    hasText: 'This isolated preview requested a link to',
  });
  await expect(confirmation).toContainText('/compose');
  await expect(page).toHaveURL(/\/r\/cta-product-preview\/?$/);
});

test('the direct preview wrapper presents a host confirmation before following resource links', async ({ page }) => {
  const consoleMessages: Array<{ type: string; text: string }> = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: string[] = [];
  const responses: Array<{ path: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? 'unknown'})`));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1') responses.push({ path: url.pathname, status: response.status() });
  });

  await page.goto('/preview/?resource=cta-product-preview');
  const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toBeVisible();
  await composeLink.click();

  const evidenceDirectory = path.resolve('audit/evidence/step-48/aud454-preview-wrapper-navigation');
  await mkdir(evidenceDirectory, { recursive: true });
  const viewport = test.info().project.name.includes('mobile') ? '390x844' : '1440x900';
  await page.screenshot({
    path: path.join(evidenceDirectory, `after-link-click-${viewport}.png`),
    fullPage: true,
  });

  const confirmation = page.getByRole('status').filter({
    hasText: 'This isolated preview requested a link to',
  });
  await expect(confirmation).toContainText('/compose');
  const screenshot = path.join(evidenceDirectory, `confirmation-${viewport}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await confirmation.getByRole('link', { name: 'Open preview link' }).click();

  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 30_000 });
  await writeFile(
    path.join(evidenceDirectory, `browser-report-${viewport}.json`),
    `${JSON.stringify({
      route: '/preview/?resource=cta-product-preview',
      finalUrl: page.url(),
      viewport: page.viewportSize(),
      result: 'PASS',
      confirmationVisible: true,
      console: consoleMessages,
      uncaughtExceptions,
      failedRequests,
      responses,
      screenshot: path.posix.join(
        'audit/evidence/step-48/aud454-preview-wrapper-navigation',
        path.basename(screenshot),
      ),
    }, null, 2)}\n`,
  );
  expect(consoleMessages.filter((message) => message.type === 'error')).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
});
