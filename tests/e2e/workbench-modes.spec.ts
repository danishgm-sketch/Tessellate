import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const modes = ['structure', 'style', 'motion', 'content', 'audit'] as const;

test('Workbench mode controls reveal their working panels at desktop and mobile sizes', async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ status: number; url: string }> = [];
  const axeFindings: Array<{ mode: string; impact: string | null; id: string; nodes: number }> = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
  });

  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  for (const mode of modes) {
    const control = page
      .getByTestId('top-toolbar')
      .getByRole('button', { name: new RegExp(`^${mode}$`, 'i') });
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');

    if (mode === 'audit') {
      await expect(page.getByTestId('audit-panel')).toBeVisible();
      await expect(page.getByText('Deterministic Quality Audit', { exact: true })).toBeVisible();
    } else if (mode === 'structure' && isMobile) {
      await expect(
        page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' })
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('button', { name: 'Select screen Marketing Home' })).toBeVisible();
    } else if (mode === 'structure') {
      await expect(page.locator('.tess-screen').first()).toBeVisible();
    } else {
      await expect(page.getByTestId(`${mode}-tab`)).toBeVisible();
    }

    const axe = await new AxeBuilder({ page }).analyze();
    axeFindings.push(
      ...axe.violations.map((violation) => ({
        mode,
        impact: violation.impact,
        id: violation.id,
        nodes: violation.nodes.length,
      }))
    );

    await page.screenshot({
      path: testInfo.outputPath(`mode-${mode}-${isMobile ? 'mobile-390' : 'desktop-1440'}.png`),
      animations: 'disabled',
    });
  }

  const evidenceDirectory = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/workbench-modes'
  );
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    path.join(evidenceDirectory, `report-${isMobile ? 'mobile-390' : 'desktop-1440'}.json`),
    `${JSON.stringify(
      { route: page.url(), viewport: page.viewportSize(), modes, axeFindings, consoleErrors, uncaught, failedRequests, httpErrors },
      null,
      2
    )}\n`
  );
  expect(axeFindings.filter((finding) => finding.impact === 'critical' || finding.impact === 'serious')).toEqual([]);
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});
