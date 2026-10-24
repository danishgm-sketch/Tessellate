import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const exactBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('Compose acknowledges work before generating the three real directions', async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'CPU throttling uses the Chromium DevTools protocol.');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('/compose/');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.getByLabel('Product Description & Objectives').fill(exactBrief);
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();

  const submit = page.getByTestId('compose-submit-btn');
  await submit.click();

  const progress = page.getByTestId('compose-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toContainText('Building the product model and three interface directions');
  await expect(submit).toBeDisabled();

  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-38/after');
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `compose-progress-${testInfo.project.name}.png`),
    fullPage: false,
  });

  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3, { timeout: 15000 });
  await expect(progress).toHaveCount(0);
  await expect(page.getByTestId('direction-preview-01').locator('[data-node-id]').first()).toBeVisible();
  await expect(page.getByTestId('direction-preview-02').locator('[data-node-id]').first()).toBeVisible();
  await expect(page.getByTestId('direction-preview-03').locator('[data-node-id]').first()).toBeVisible();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});
