import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('documentation index links to canonical repository contracts', async ({ page }, testInfo) => {
  const response = await page.goto('/docs/');

  expect(response?.status()).toBe(200);
  const documentationLinks = page.getByRole('navigation', { name: 'Documentation' }).getByRole('link');
  await expect(documentationLinks).toHaveCount(16);
  await expect(page.locator('a[href="/docs/grand-goal-progress/"]')).toHaveCount(0);
  const internalProgressDocument = await page.request.get('/docs/grand-goal-progress/');
  expect(internalProgressDocument.status()).toBe(404);
  for (const slug of [
    'architecture',
    'composition-engine',
    'data-contracts',
    'design-system',
    'product-spec',
    'quality-security',
    'workbench-spec',
  ]) {
    await expect(page.locator(`a[href="/docs/${slug}/"]`)).toBeVisible();
  }

  await page.locator('a[href="/docs/product-spec/"]').click();
  await expect(page).toHaveURL(/\/docs\/product-spec\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Tessellate Product Specification' })).toBeVisible();

  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-48/internal-doc-publication');
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, `${testInfo.project.name}-after.png`);
  await page.goto('/docs/');
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link')).toHaveCount(16);
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}-after.json`), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    documentationLinkCount: await documentationLinks.count(),
    internalProgressRouteStatus: internalProgressDocument.status(),
    internalProgressLinkCount: await page.locator('a[href="/docs/grand-goal-progress/"]').count(),
    screenshot,
  }, null, 2)}\n`, 'utf8');
});
