import {test,expect,type Page} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';import {mkdir,readFile,writeFile} from 'node:fs/promises';import path from 'node:path';
async function openEmployee(page:Page){await page.goto('/compose/');await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');await page.getByLabel('Product Description & Objectives').fill('Employee experience platform for 500 people with teams and onboarding');await page.getByTestId('compose-submit-btn').click();await page.getByTestId('open-workbench-dir-03').click();await expect(page.getByTestId('top-toolbar')).toBeVisible();}
async function manifest(page:Page){await page.getByTestId('export-button').click();const pending=page.waitForEvent('download');await page.getByTestId('export-manifest-btn').click();const file=await pending;return JSON.parse(await readFile((await file.path())!,'utf8'));}
test('Pages selection and actions satisfy accessibility rules',async({page,isMobile})=>{test.skip(isMobile,'Desktop Pages panel');await openEmployee(page);await page.getByTestId('left-panel').getByRole('button',{name:'Pages',exact:true}).click();const axe=await new AxeBuilder({page}).options({preload:false}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);});
test('blending a project preserves its source project undo history', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop Blend panel');
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
  await openEmployee(page);
  const sourceUrl = page.url();
  const source = await manifest(page);

  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const ambition = page.getByRole('slider', { name: 'Visual Ambition' });
  await ambition.press('ArrowRight');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  await page.getByTestId('top-toolbar').getByRole('button', { name: 'Blend', exact: true }).click();
  await page.getByRole('button', { name: 'Apply Direction Blend' }).click();
  const blended = await manifest(page);
  expect(new URL(page.url()).searchParams.get('project')).toBe(blended.id);
  expect(blended.id).not.toBe(source.id);
  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  expect((await manifest(page)).id).toBe(blended.id);

  await page.goto(sourceUrl);
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-21');
  await mkdir(path.join(evidenceDirectory, 'before'), { recursive: true });
  await mkdir(path.join(evidenceDirectory, 'after'), { recursive: true });
  const sourceLoadAlert = page.getByRole('heading', { name: 'Local project needs attention' });
  await Promise.race([
    page.getByTestId('top-toolbar').waitFor({ state: 'visible' }),
    sourceLoadAlert.waitFor({ state: 'visible' }),
  ]);
  if (await sourceLoadAlert.isVisible()) {
    const screenshot = 'quality/evidence/step-21/before/blend-source-history-overwritten-desktop-1440.png';
    await page.screenshot({ path: path.resolve(process.cwd(), screenshot), fullPage: true });
    await writeFile(path.join(evidenceDirectory, 'before/blend-source-history-overwritten-desktop-1440.json'), `${JSON.stringify({
      url: page.url(), viewport: page.viewportSize(), status: 'reproduced', issue: 'AUD-158',
      actual: await page.getByRole('alert').innerText(), screenshot, consoleErrors, consoleWarnings,
      uncaughtExceptions, failedRequests, httpErrors,
    }, null, 2)}\n`, 'utf8');
  }
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(
    String(source.designDNA.visualAmbition)
  );
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  const afterScreenshot = 'quality/evidence/step-21/after/blend-source-history-preserved-desktop-1440.png';
  await page.screenshot({ path: path.resolve(process.cwd(), afterScreenshot), fullPage: true });
  await writeFile(path.join(evidenceDirectory, 'after/blend-source-history-preserved-desktop-1440.json'), `${JSON.stringify({
    url: page.url(), viewport: page.viewportSize(), status: 'passed', issue: 'AUD-158',
    checks: { blendedProjectReloaded: true, sourceProjectReloaded: true, sourceUndoEnabled: true, undoRestoredSourceAmbition: true },
    consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, screenshot: afterScreenshot,
  }, null, 2)}\n`, 'utf8');
  expect(consoleErrors).toEqual([]);
  expect(consoleWarnings).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
