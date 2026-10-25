import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

async function downloadManifest(page: Page) {
  await page.getByRole('button', {name:'Export',exact:true}).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', {name:/Tessellate Manifest/}).click();
  const download = await pending;
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile((await download.path())!, 'utf8')));
  if(await page.getByTestId('export-menu').isVisible()) await page.getByRole('button', {name:'Export',exact:true}).click();
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
  await page.getByRole('button',{name:'Search ⌘K'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('textbox').fill('Explore');
  await page.getByRole('dialog').getByRole('textbox').press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('Workbench uses a readable dark inspector in a light browser',async({page})=>{
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/workbench');
  await expect(page.getByTestId('right-inspector')).toHaveCSS('background-color','rgb(17, 20, 25)');
});

 test('hosting enforces security headers and isolates the actual Gold preview',async({page})=>{
  const response=await page.goto('/r/area-chart/');
  expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  await expect(page.locator('iframe')).toHaveAttribute('sandbox','allow-scripts');
  await expect(page.frameLocator('iframe').getByRole('heading',{name:'Active Ingestion Volume'})).toBeVisible();
  expect(await page.frameLocator('iframe').getByRole('button',{name:'Confirm Action'}).count()).toBe(0);
 });

test('palette choice changes visible semantic colour and survives reload',async({page})=>{
 await page.goto('/compose');
 await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
 await page.getByTestId('compose-submit-btn').click();
 await page.getByTestId('open-workbench-dir-03').click();
 await expect(page.getByTestId('right-inspector')).toBeVisible();
 const root=page.locator('[data-node-id^="root-"]').first();
 const before=await root.evaluate(element=>getComputedStyle(element).getPropertyValue('--tess-accent-primary'));
 await page.getByTestId('right-inspector').getByRole('button',{name:'Style',exact:true}).click();
 await page.getByRole('button',{name:/Coral Human/}).click();
 const after=await root.evaluate(element=>getComputedStyle(element).getPropertyValue('--tess-accent-primary'));
 expect(after).not.toBe(before);
 const manifest=await downloadManifest(page);
 expect(manifest.screens[0]?.rootNode.tokenOverrides?.paletteId).toBe('coral-human');
 await page.reload();
 await expect(page.getByTestId('right-inspector')).toBeVisible();
 expect(await root.evaluate(element=>getComputedStyle(element).getPropertyValue('--tess-accent-primary'))).toBe(after);
});
