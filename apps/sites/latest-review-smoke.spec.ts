import { test, expect } from '@playwright/test';

test('latest main loads, composes, edits, exports and preserves preview isolation', async ({ page, request }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const health = await request.get('/api/inference/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ hostOnline: false, engine: 'deterministic' });
  const catalog = await request.get('/data/catalog.json');
  expect(catalog.status()).toBe(200);
  expect((await catalog.json()).resources).toHaveLength(324);

  await page.goto('/');
  await expect(page).toHaveTitle(/Tessellate/);
  await page.screenshot({ path: testInfo.outputPath('homepage-desktop.png') });
  await page.goto('/r/button');
  const frame = page.locator('iframe').first();
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
  await expect(page.frameLocator('iframe').first().getByRole('button').first()).toBeVisible();

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill('Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.');
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('directions-desktop.png') });
  await page.getByTestId('open-workbench-dir-03').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await page.getByTestId('recompose-button').click();
  await page.getByTestId('surprise-me-button').click();
  const command = page.getByTestId('command-bar').locator('input');
  await command.fill('reduce motion');
  await command.press('Enter');
  await expect(page.getByTestId('command-bar')).toContainText('Deterministic');
  await page.getByTestId('export-button').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-zip-btn').click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  await download.saveAs(testInfo.outputPath(download.suggestedFilename()));
  await page.screenshot({ path: testInfo.outputPath('workbench-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('workbench-mobile.png') });
  expect(errors).toEqual([]);
});
