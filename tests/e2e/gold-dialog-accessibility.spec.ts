import { expect, test } from '@playwright/test';

test('Gold dialog preview exposes modal semantics and closes on Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'Run against the isolated Sites Worker preview.');
  await page.setViewportSize({ width: 390, height: 844 });
  const diagnostics = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) diagnostics.httpErrors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('/resources/dialog/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBe(true);

  const frame = page.frameLocator('iframe[title$=" live preview"]');
  const dialogTitle = frame.getByRole('heading', { name: 'Example dialog' });
  await expect(dialogTitle).toBeVisible();
  const before = 'audit/evidence/step-06/before/dialog-accessibility-390.png';
  await page.screenshot({ path: before, animations: 'disabled' });

  const dialog = dialogTitle.locator('xpath=../..');
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby', /.+/);
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialogTitle).toHaveCount(0);
  const reopen = frame.getByRole('button', { name: 'Reopen example' });
  await expect(reopen).toBeVisible();
  await reopen.click();
  await expect(dialogTitle).toBeVisible();
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialogTitle).toHaveCount(0);
  expect(diagnostics).toEqual({ consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] });
  await page.screenshot({ path: 'audit/evidence/step-06/after/dialog-accessibility-390.png', animations: 'disabled' });
});
