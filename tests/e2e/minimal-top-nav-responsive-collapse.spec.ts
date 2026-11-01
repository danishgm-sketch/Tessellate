import { expect, test } from '@playwright/test';

test('Minimal Top Navigation collapses inside a narrow preview and remains keyboard-operable', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'This regression exercises the isolated ChatGPT Sites Worker runtime.'
  );

  const browserErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/resources/minimal-top-nav/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const preview = page.frameLocator('iframe[title$=" live preview"]');
  const navigation = preview.getByRole('navigation', { name: 'Product screens', exact: true });
  const toggle = preview.locator('button[aria-controls]');

  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(toggle).toHaveCount(1, { timeout: 3000 });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAccessibleName('Open navigation');
    await expect(navigation).toBeHidden();
    const collapsedMetrics = await preview.locator('body').evaluate((body) => ({
      clientWidth: body.clientWidth,
      scrollWidth: body.scrollWidth,
    }));
    expect(collapsedMetrics.scrollWidth).toBeLessThanOrEqual(collapsedMetrics.clientWidth);

    if (testInfo.project.name === 'sites-mobile-chromium') await toggle.tap();
    else await toggle.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Close navigation');
    await expect(navigation).toBeVisible();
    await expect(preview.getByText('Overview', { exact: true })).toBeVisible();
    const expandedMetrics = await preview.locator('body').evaluate((body) => ({
      clientWidth: body.clientWidth,
      scrollWidth: body.scrollWidth,
    }));
    expect(expandedMetrics.scrollWidth).toBeLessThanOrEqual(expandedMetrics.clientWidth);
    const linkHeights = await navigation.locator('a, span').evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
    expect(linkHeights.every((height) => height >= 44)).toBe(true);

    await toggle.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toBeHidden();
    await expect(toggle).toBeFocused();
  }

  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(toggle).toBeHidden();
    await expect(navigation).toBeVisible();
    const metrics = await preview.locator('body').evaluate((body) => ({
      clientWidth: body.clientWidth,
      scrollWidth: body.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  }

  expect(browserErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
