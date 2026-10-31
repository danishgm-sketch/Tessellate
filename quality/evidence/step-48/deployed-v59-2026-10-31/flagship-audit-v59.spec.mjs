import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const brief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('employee Workbench audit does not report valid page headings and navigation as missing hierarchy', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const runtime = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/compose/');
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  const directionC = page.getByTestId('direction-card-03');
  await expect(directionC.getByTestId('direction-preview-03')).toBeVisible();
  await expect(directionC.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);
  await directionC.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);

  if ((page.viewportSize()?.width ?? 1440) < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Audit', exact: true }).click();
  } else {
    await page.getByTestId('top-toolbar').getByRole('button', { name: 'audit', exact: true }).click();
  }
  const audit = page.getByTestId('audit-panel');
  await expect(audit.getByRole('heading', { name: 'Deterministic Quality Audit' })).toBeVisible();
  await expect(audit.getByText(/lacks a primary focal header or navigation landmark/)).toHaveCount(0);
  const hierarchyScore = await audit.getByRole('button').filter({ hasText: 'Hierarchy' }).first().innerText();
  await page.screenshot({ path: testInfo.outputPath(`employee-hierarchy-audit-${testInfo.project.name}.png`), animations: 'disabled' });

  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    selectedDirection: 'C',
    screens: ['Marketing Home', 'Team Overview', 'People Directory', 'Teams', 'Engagement', 'Onboarding', 'Settings & Policies'],
    hierarchyScore,
    falseHierarchyFindings: 0,
    ...runtime,
  };
  const root = path.resolve(process.cwd(), 'quality/evidence/step-48/deployed-v59-2026-10-31');
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, `employee-hierarchy-audit-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
