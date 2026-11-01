import { expect, test } from '@playwright/test';

test('selecting a Workbench screen keeps the route and visible screen in sync after reload', async ({ page }) => {
  const viewport = page.viewportSize();
  const mobile = (viewport?.width ?? 1440) < 1024;
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/workbench');
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible();
  await expect(page).toHaveURL(/#screen-marketing-home$/);

  if (mobile) {
    const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
    await mobileNavigation.getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages' }).click();
  }

  await page.getByRole('button', { name: 'Select screen Team Overview' }).click();
  await expect(page).toHaveURL(/#screen-overview$/);
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Preview' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Team Overview', exact: true, level: 2 })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Team Overview', exact: true, level: 2 })).toBeVisible();

  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages' }).click();
  }
  await expect(page.getByRole('button', { name: 'Select screen Team Overview' })).toHaveAttribute('aria-pressed', 'true');

  await page.goBack();
  await expect(page).toHaveURL(/#screen-marketing-home$/);
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages' }).click();
  }
  await expect(page.getByRole('button', { name: 'Select screen Marketing Home' })).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page).toHaveURL(/#screen-overview$/);
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Preview' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Team Overview', exact: true, level: 2 })).toBeVisible();

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
