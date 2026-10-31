import { expect, test } from '@playwright/test';

test('activity feed discloses its built-in entries are samples', async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));

  const response = await page.goto('/r/activity-feed/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const preview = page.frameLocator('iframe[title$=" live preview"]');
  await expect(preview.getByRole('heading', { level: 2, name: 'Workspace Activity Feed' })).toBeVisible();
  await expect(preview.getByText('Sample activity', { exact: true })).toBeVisible();
  await expect(preview.getByText(/validated 72|pull request #142|Elena R\.|Marcus V\./i)).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
