import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

async function downloadManifest(page: Page) {
  await page.getByRole('button', {name:'Export',exact:true}).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', {name:/Tessellate Manifest/}).click();
  const download = await pending;
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile((await download.path())!, 'utf8')));
  await page.getByRole('button', {name:'Export',exact:true}).click();
  return manifest;
}

test('real edits survive browser reload', async ({page}) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.getByRole('button',{name:'Compose Interface System',exact:true}).click();
  await page.getByTestId('open-workbench-dir-03').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await page.getByRole('button',{name:'Surprise',exact:true}).click();
  const edited = await downloadManifest(page);
  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const restored = await downloadManifest(page);
  expect(restored).toEqual(edited);
});

test('header search is a keyboard-operable dialog', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Search resources (Press Command-K)'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('textbox').fill('Explore');
  await page.getByRole('dialog').getByRole('textbox').press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
