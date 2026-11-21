import { expect, test } from '@playwright/test';

const brief =
  'A field safety intelligence and equipment maintenance platform for a 1,200-person offshore wind operator. Dispatch crews across three time zones. Technicians use rugged tablets with intermittent connectivity; control room teams manage turbine status, sea conditions, permits to work, lockout/tagout, and incident escalation.';

test('offshore wind safety brief composes truthful, domain-specific directions', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.method()} ${request.url()} (${request.failure()?.errorText})`)
  );
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 15_000,
  });
  await page.getByLabel('Product Description & Objectives').fill(brief);
  await page.getByLabel('Product type (optional)').selectOption('');
  await page.getByLabel('Desired Feel / Adjectives').fill('clear, assured, and highly legible');
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(
    page
      .locator('section')
      .filter({ hasText: 'Inferred Product Architecture' })
      .getByText('ERP & Operations', { exact: true })
  ).toBeVisible();
  await expect(page.getByText(/Keep offshore turbines safe and available/i)).toBeVisible();
  const plannedScreens = await page.locator('body').innerText();
  for (const screenName of [
    'Turbine Operations',
    'Work Orders',
    'Permits to Work',
    'Incident Response',
    'Crew & Vessel Dispatch',
  ]) {
    expect(plannedScreens).toContain(screenName);
  }

  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const canvas = dialog.locator('.tess-screen');

    await screenSelect.selectOption({ label: 'Turbine Operations' });
    await expect(canvas).toContainText('Fleet and safety status');
    await expect(canvas).toContainText('Fleet availability');
    await expect(canvas).toContainText('Permits awaiting approval');
    await expect(canvas).toContainText('Crew coverage');
    await expect(canvas).toContainText('Safe access windows');
    await expect(canvas).toContainText('No connected data');
    await expect(canvas).toContainText(/sea condition|weather/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Work Orders' });
    await expect(canvas).toContainText(/maintenance|work order/i);
    await expect(canvas).toContainText(/crew|dispatch/i);
    await expect(canvas).toContainText(/weather|access window/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Permits to Work' });
    await expect(canvas).toContainText(/Permit to work/i);
    await expect(canvas).toContainText(/isolation/i);
    await expect(canvas).toContainText(/not connected/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Incident Response' });
    await expect(canvas).toContainText(/incident/i);
    await expect(canvas).toContainText(/crew/i);
    await expect(canvas).toContainText(/escalat/i);
    await expect(canvas).not.toContainText(/monthly plan price|free plan/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Crew & Vessel Dispatch' });
    await expect(canvas).toContainText(/crew/i);
    await expect(canvas).toContainText(/vessel/i);
    await expect(canvas).toContainText(/weather window|access window/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Turbine Operations' });
    const screenshot = testInfo.outputPath(`offshore-safety-direction-${number}.png`);
    await dialog.screenshot({ path: screenshot, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  expect({ consoleErrors, uncaught, failedRequests, badResponses }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    badResponses: [],
  });

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(horizontalOverflow).toBe(false);
});
