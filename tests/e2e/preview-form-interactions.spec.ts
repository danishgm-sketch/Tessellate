import { existsSync, mkdirSync } from 'node:fs';
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
