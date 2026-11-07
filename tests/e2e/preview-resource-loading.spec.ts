import { expect, test } from '@playwright/test';

test('Button slug and canonical ID load the real keyboard-operable preview', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()}`));

  for (const resourceId of ['button', 'res_primitive_button_01']) {
    await page.goto(`/?resource=${resourceId}`);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Button preview' })).toBeAttached();
    const button = page.getByRole('button', { name: 'Click me' });
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Example action activated.');
  }
  expect(failures).toEqual([]);
});
