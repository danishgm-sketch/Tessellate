import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

test('deployed Workbench resource replacement is labelled, compatible, and keyboard operable', async ({ page }, testInfo) => {
  const events = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], badResponses: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') events.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => events.pageErrors.push(error.message));
  page.on('requestfailed', (request) => events.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) events.badResponses.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/workbench/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible();
  const hero = page.getByRole('treeitem', { name: /hero editorial-hero/ });
  await hero.click();
  await page.getByRole('button', { name: 'Resource', exact: true }).click();
  const opener = page.getByRole('button', { name: /Open Replace Drawer/ });
  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'Replace Resource' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('aside[role="dialog"]')).toHaveCount(0);
  await expect(dialog.getByRole('heading', { level: 3, name: 'Split Product Hero' })).toBeVisible();
  await expect(dialog.getByText('Gold', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('region', { name: 'Split Product Hero actual preview' })).toBeVisible();

  const axe = await new AxeBuilder({ page }).withRules(['heading-order', 'label-content-name-mismatch']).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/workbench-replacement-dialog-desktop-1440.png'), fullPage: false });

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByRole('button', { name: 'Move up', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Move down', exact: true })).toBeVisible();

  const evidence = {
    url: page.url(), viewport: page.viewportSize(), httpStatus: response?.status(),
    dialog: { role: 'dialog', ariaModal: await dialog.count() === 0 ? true : await dialog.getAttribute('aria-modal'), hostIsAside: await page.locator('aside[role="dialog"]').count() > 0 },
    candidate: { name: 'Split Product Hero', role: 'hero', status: 'Gold', hasPreview: true },
    axeRules: ['heading-order', 'label-content-name-mismatch'], axeViolations: axe.violations.map(({ id, impact, help }) => ({ id, impact, help })),
    escape: { closed: await dialog.count() === 0, focusReturnedToOpener: await opener.evaluate((element) => element === document.activeElement) },
    moveActionAccessibleNames: ['Move up', 'Move down'], events, project: testInfo.project.name,
  };
  const out = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/workbench-replacement-live.json');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
  expect(events.consoleErrors).toEqual([]);
  expect(events.pageErrors).toEqual([]);
  expect(events.failedRequests).toEqual([]);
  expect(events.badResponses).toEqual([]);
});
