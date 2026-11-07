import { expect, test } from '@playwright/test';

test('homepage form fields expose stable IDs and names for browser autofill', async ({ page }) => {
  await page.goto('/');

  const identifiers = await page.locator('input, textarea, select').evaluateAll((fields) =>
    fields.map((field) => ({ id: field.id, name: field.getAttribute('name') }))
  );

  expect(identifiers.length).toBeGreaterThan(0);
  expect(identifiers.every(({ id, name }) => id.length > 0 && Boolean(name))).toBe(true);
  expect(new Set(identifiers.map(({ id }) => id)).size).toBe(identifiers.length);
  expect(new Set(identifiers.map(({ name }) => name)).size).toBe(identifiers.length);
});

test('homepage transfers an edited brief to Compose without eager engine loading', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText})`));
  await page.goto('/');
  await expect(page.getByLabel('Product description and requirements')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  const jsBytesBeforeEdit = await page.evaluate(() => performance.getEntriesByType('resource')
    .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
    .reduce((total, entry) => total + (entry as PerformanceResourceTiming).transferSize, 0));

  await page.getByLabel('Product description and requirements').fill(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.'
  );
  const mobileSettings = page.getByText('Feel, ambition and structure', { exact: true });
  if (await mobileSettings.isVisible()) await mobileSettings.click();
  await page.locator('input[aria-label="Interface feel"]:visible').fill('professional but playful');
  await page.waitForTimeout(400);

  const jsBytesAfterEdit = await page.evaluate(() => performance.getEntriesByType('resource')
    .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
    .reduce((total, entry) => total + (entry as PerformanceResourceTiming).transferSize, 0));
  expect(jsBytesAfterEdit - jsBytesBeforeEdit).toBeLessThan(10 * 1024);

  await page.locator('form').getByRole('button', { name: 'Compose' }).click();
  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByLabel('Product Description & Objectives')).toHaveValue(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.'
  );
  await expect(page.getByLabel('Desired Feel / Adjectives')).toHaveValue('professional but playful');
  await expect(page.getByText('(60)', { exact: false })).toBeVisible();
  await expect(page.getByText('(50)', { exact: false })).toBeVisible();
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
