import { expect, test } from '@playwright/test';

test('AI Copilot Sidebar discloses sample content and disables its unconnected apply action', async ({ page }) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ url: string; status: number }> = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/ai-copilot-sidebar/');
  await expect(page.getByRole('heading', { name: 'AI Copilot Sidebar', level: 1 })).toBeVisible();
  await expect(
    page.getByText(/Example copilot sidebar with sample file context and suggested fixes/i).first()
  ).toBeVisible();

  const iframe = page.locator('iframe[title="AI Copilot Sidebar live preview"]');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  const preview = page.frameLocator('iframe[title="AI Copilot Sidebar live preview"]');
  await expect(preview.getByText(/does not inspect files or change source code/i)).toBeVisible();
  await expect(preview.getByText('Example: use a contrast token')).toBeVisible();
  await expect(preview.getByText('Example: add table shortcuts')).toBeVisible();
  await expect(preview.getByTestId('ai-copilot-apply-help'))
    .toContainText('host connects a validated apply action');
  await expect(preview.getByRole('button', { name: 'Apply All Recommended Fixes' })).toBeDisabled();

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    'the resource detail page should fit the current viewport'
  ).toBe(true);
  expect(consoleErrors).toEqual([]);
  expect(consoleWarnings).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
