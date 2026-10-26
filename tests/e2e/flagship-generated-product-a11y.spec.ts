import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const EMPLOYEE_EXPERIENCE_BRIEF =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('the generated employee experience opens in Workbench without serious accessibility violations', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/compose/');
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(EMPLOYEE_EXPERIENCE_BRIEF);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();

  const directionC = page.getByTestId('direction-card-03');
  await expect(directionC.getByTestId('direction-preview-03')).toBeVisible();
  await expect(directionC.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await expect(directionC.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);
  await directionC.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Workbench:/ })).toBeVisible();
  await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .withRules(['target-size'])
    .analyze();
  await page.screenshot({ path: testInfo.outputPath(`generated-employee-workbench-${testInfo.project.name}.png`), fullPage: false });
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    projectName: await page.getByRole('heading', { name: /^Workbench:/ }).innerText(),
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    axeRules: ['target-size'],
    violations: axe.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map((node) => node.target) })),
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    project: testInfo.project.name,
  };
  const evidencePath = testInfo.outputPath(`generated-employee-workbench-${testInfo.project.name}.json`);
  mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await testInfo.attach(`generated-employee-workbench-${testInfo.project.name}.json`, { path: evidencePath, contentType: 'application/json' });
  expect(axe.violations, JSON.stringify(evidence, null, 2)).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});
