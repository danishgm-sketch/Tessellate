import { expect, test } from '@playwright/test';

test('structured content drafts follow undo and redo of the applied project value', async ({ page }) => {
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Select screen Team Overview' }).click();
  if (!mobile) await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
  await page.getByTestId('layer-node-node-screen-overview-data-table-5').click();
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Content', exact: true }).click();

  const rowsField = page.getByRole('textbox', { name: 'rows JSON' });
  await expect(rowsField).toBeVisible();
  const original = JSON.parse(await rowsField.inputValue()) as Array<Record<string, unknown>>;
  const edited = structuredClone(original);
  edited[0] = { ...edited[0], name: 'Edited employee record' };

  await rowsField.fill(JSON.stringify(edited, null, 2));
  await page.getByRole('button', { name: 'Apply rows' }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(async () => JSON.parse(await rowsField.inputValue())).toEqual(original);

  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect.poll(async () => JSON.parse(await rowsField.inputValue())).toEqual(edited);
});
