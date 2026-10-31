import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
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
  await page.goto('/preview/?resource=cta-product-preview');
  const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toBeVisible();
  await composeLink.click();

  const confirmation = page.getByRole('status').filter({
    hasText: 'This isolated preview requested a link to',
  });
  await expect(confirmation).toContainText('/compose');
  await confirmation.getByRole('link', { name: 'Open preview link' }).click();

  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 30_000 });
});
