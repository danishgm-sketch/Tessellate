import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const brief =
  'A mobile-first mutual-aid app for 30,000 residents in a dense city. Verified residents share local updates, organise cleanup events and skill swaps, ask neighbours for help, and follow street-by-street notices. Volunteer moderators handle reports and privacy controls. Users have limited data plans; motion should be optional and every action accessible.';

test('community coordination brief stays useful and coherent through three directions', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 15_000,
  });
  await page.getByLabel('Product Description & Objectives').fill(brief);
  await page.getByLabel('Product type (optional)').selectOption('');
  await page.getByLabel('Desired Feel / Adjectives').fill('welcoming, clear, and privacy-conscious');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();

  const architecture = await page.locator('body').innerText();
  expect(architecture).toContain('CONSUMER APPLICATIONS');
  expect(architecture).toContain('Coordinate consent-based local assistance');
  for (const screenName of [
    'Neighbourhood Updates',
    'Community Help Board',
    'Local Events & Skills',
    'Safety & Moderation',
    'Privacy & Languages',
  ]) {
    expect(architecture).toContain(screenName);
  }

  for (const direction of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${direction}`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${direction}`) });
    await expect(dialog).toBeVisible();
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const canvas = dialog.locator('.tess-screen');

    await screenSelect.selectOption({ label: 'Neighbourhood Updates' });
    await expect(canvas).toContainText('Neighbourhood Commons');
    await expect(canvas).toContainText('Community activity at a glance');
    await expect(canvas).toContainText('Open help requests');
    await expect(canvas).toContainText('No connected data');
    await expect(canvas).toContainText(/contact details hidden|contact details stay private/i);
    await expect(canvas).not.toContainText(/algorithmic|published media|media grid/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);
    await dialog.screenshot({
      path: testInfo.outputPath(`community-updates-${direction}.png`),
      animations: 'disabled',
    });

    await screenSelect.selectOption({ label: 'Community Help Board' });
    await expect(canvas).toContainText('Community help board');
    await expect(canvas).toContainText('Contact hidden until mutual consent');
    await expect(canvas).toContainText('Help service not connected');
    await expect(canvas).not.toContainText(/street address|date of birth|phone number/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Local Events & Skills' });
    await expect(canvas).toContainText('Local events and skill swaps');
    await expect(canvas).toContainText('Event service not connected');
    await expect(canvas).toContainText(/accessibility|language/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Safety & Moderation' });
    await expect(canvas).toContainText('Safety and moderation queue');
    await expect(canvas).toContainText('Moderation service not connected');
    await expect(canvas).toContainText(/no resident details/i);
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);

    await screenSelect.selectOption({ label: 'Privacy & Languages' });
    await expect(canvas).toContainText('Privacy & Languages');
    await expect(canvas).toContainText(/language|consent|neighbourhood/i);
    await expect(canvas).toContainText(/not saved in this preview/i);
    await expect(canvas).not.toContainText(/street address|date of birth|phone number/i);
    await expect(canvas.getByLabel('Privacy and language preferences')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Save privacy preferences' })).toBeDisabled();
    await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
    await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);
    const accessibility = await new AxeBuilder({ page })
      .include('.tess-screen')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);

    await dialog.screenshot({
      path: testInfo.outputPath(`community-privacy-${direction}.png`),
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  expect(errors).toEqual([]);
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(horizontalOverflow).toBe(false);
});
