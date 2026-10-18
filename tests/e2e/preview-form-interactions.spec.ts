import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const beforeDir = path.resolve(process.cwd(), 'audit/evidence/step-06/before/form-interactions');
const afterDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/form-interactions');
mkdirSync(beforeDir, { recursive: true });
mkdirSync(afterDir, { recursive: true });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'Form interaction regressions run against the isolated Sites Worker preview.');
  await page.setViewportSize({ width: 1440, height: 900 });
});

test('Text Input and Textarea retain text typed into the live preview', async ({ page }) => {
  await page.goto('/resources/input/', { waitUntil: 'domcontentloaded' });
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  const fullName = preview.getByRole('textbox', { name: 'Full name' });

  await fullName.click();
  await fullName.pressSequentially('Ada Lovelace');
  const before = path.join(beforeDir, 'input-event-corruption-1440.png');
  if (!existsSync(before)) await page.screenshot({ path: before, animations: 'disabled' });

  await expect(fullName).toHaveValue('Ada Lovelace');
  await page.screenshot({ path: path.join(afterDir, 'input-retains-value-1440.png'), animations: 'disabled' });

  await page.goto('/resources/textarea/', { waitUntil: 'domcontentloaded' });
  const textareaPreview = page.frameLocator('iframe[title$=" live preview"]');
  const notes = textareaPreview.locator('textarea').first();
  await notes.fill('Prepare the onboarding checklist for the People team.');
  await expect(notes).toHaveValue('Prepare the onboarding checklist for the People team.');
  await page.screenshot({ path: path.join(afterDir, 'textarea-retains-value-1440.png'), animations: 'disabled' });
});

test('Select retains the chosen option in the live preview', async ({ page }) => {
  await page.goto('/resources/select/', { waitUntil: 'domcontentloaded' });
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  const select = preview.getByRole('combobox', { name: 'Select an option' });

  await select.selectOption('second');
  const before = path.join(beforeDir, 'select-state-reset-1440.png');
  if (!existsSync(before)) await page.screenshot({ path: before, animations: 'disabled' });

  await expect(select).toHaveValue('second');
  await page.screenshot({ path: path.join(afterDir, 'select-retains-choice-1440.png'), animations: 'disabled' });
});

test('Filter Builder adds editable conditions and removes them without inserting unrelated rules', async ({ page }) => {
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-14/manual-review/after');
  mkdirSync(evidenceDir, { recursive: true });
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/resources/filter-builder/', { waitUntil: 'domcontentloaded' });
  const preview = page.frameLocator('iframe[title$=" live preview"]');

  await preview.getByRole('button', { name: /Add Condition/i }).click();
  const field = preview.getByRole('combobox', { name: 'Field 1' });
  await expect(field).toBeVisible();
  await field.selectOption('status');
  await preview.getByRole('combobox', { name: 'Operator 1' }).selectOption('equals');
  await preview.getByRole('textbox', { name: 'Value 1' }).fill('available');
  await expect(preview.getByText('Status equals available')).toBeVisible();
  const desktopScreenshot = 'aud-128-filter-builder-editable-desktop.png';
  await page.screenshot({ path: path.join(evidenceDir, desktopScreenshot), animations: 'disabled' });

  await preview.getByRole('button', { name: /Add Condition/i }).click();
  await expect(preview.getByRole('combobox', { name: 'Field 2' })).toBeVisible();
  await preview.getByRole('button', { name: 'Remove condition 1' }).click();
  await expect(preview.getByRole('combobox', { name: 'Field 1' })).toBeVisible();
  await expect(preview.getByRole('combobox', { name: 'Field 2' })).toHaveCount(0);
  await preview.getByRole('combobox', { name: 'Field 1' }).selectOption('location');
  await preview.getByRole('textbox', { name: 'Value 1' }).fill('London');
  await expect(preview.getByText('Location contains London')).toBeVisible();
  await expect(preview.getByText(/Example rules only/i)).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview.getByRole('combobox', { name: 'Field 1' })).toBeVisible();
  const previewWidth = await preview.locator('body').evaluate((body) => {
    const documentElement = body.ownerDocument.documentElement;
    return { viewport: documentElement.clientWidth, content: documentElement.scrollWidth };
  });
  expect(previewWidth.content).toBeLessThanOrEqual(previewWidth.viewport);
  await expect(preview.getByText('Location contains London')).toBeVisible();
  const mobileScreenshot = 'aud-128-filter-builder-editable-mobile.png';
  await page.screenshot({ path: path.join(evidenceDir, mobileScreenshot), animations: 'disabled' });
  const runtime = {
    url: page.url(),
    viewports: ['1440x900', '390x844'],
    desktopScreenshot,
    mobileScreenshot,
    interaction: ['add condition', 'select field/operator/value', 'remove condition', 'edit remaining condition'],
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  writeFileSync(path.join(evidenceDir, 'aud-128-filter-builder-runtime.json'), `${JSON.stringify(runtime, null, 2)}\n`);
  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('form-control focus does not announce a generic action', async ({ page }) => {
  await page.goto('/resources/input/', { waitUntil: 'domcontentloaded' });
  const inputPreview = page.frameLocator('iframe[title$=" live preview"]');
  await inputPreview.getByRole('textbox', { name: 'Full name' }).click();
  const before = path.join(beforeDir, 'input-misleading-action-status-1440.png');
  if (!existsSync(before)) await page.screenshot({ path: before, animations: 'disabled' });
  await expect(inputPreview.getByRole('status')).toHaveCount(0);
  await page.screenshot({ path: path.join(afterDir, 'input-no-false-action-status-1440.png'), animations: 'disabled' });

  await page.goto('/resources/select/', { waitUntil: 'domcontentloaded' });
  const selectPreview = page.frameLocator('iframe[title$=" live preview"]');
  await selectPreview.getByRole('combobox', { name: 'Select an option' }).click();
  await expect(selectPreview.getByRole('status')).toHaveCount(0);

  await page.goto('/resources/textarea/', { waitUntil: 'domcontentloaded' });
  const textareaPreview = page.frameLocator('iframe[title$=" live preview"]');
  await textareaPreview.locator('textarea').first().click();
  await expect(textareaPreview.getByRole('status')).toHaveCount(0);
});

test('Button preview still reports an activated example action', async ({ page }) => {
  await page.goto('/resources/button/', { waitUntil: 'domcontentloaded' });
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  await preview.getByRole('button', { name: 'Click me' }).click();
  await expect(preview.getByRole('status')).toHaveText('Example action activated.');
});

test('Reduced Motion toggle disables CSS transitions in the live resource preview', async ({ page }) => {
  await page.goto('/resources/fade-up-reveal/', { waitUntil: 'domcontentloaded' });
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  const card = preview.locator('div.w-full.p-6');

  await expect(card).toHaveCount(1);
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0.3s');

  await page.getByTitle('Reduced Motion: OFF').click();
  await expect(page.getByTitle('Reduced Motion: ON')).toBeVisible();
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  await preview.getByRole('button', { name: 'Replay Entrance' }).click();
  await expect(preview.getByRole('status')).toHaveText('Entrance animation skipped because reduced motion is enabled.');
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');

  await page.getByTitle('Reduced Motion: ON').click();
  await expect(page.getByTitle('Reduced Motion: OFF')).toBeVisible();
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0.3s');
});
