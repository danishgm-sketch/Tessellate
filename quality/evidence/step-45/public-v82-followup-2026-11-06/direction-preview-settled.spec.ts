import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const evidenceDir = path.resolve(
  'quality/evidence/step-45/public-v82-followup-2026-11-06/directions-settled',
);

test('all three public direction previews settle and expose their visible Design DNA', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await mkdir(evidenceDir, { recursive: true });

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const scriptRequests: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scriptRequests.push(request.url());
  });

  // Keep the user-visible lazy-load window observable while exercising the real hosted chunks.
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'script') {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    await route.continue();
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 30_000 });
  await page.locator('#description').fill(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.',
  );
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByText('Inferred Product Architecture', { exact: true })).toBeVisible({ timeout: 30_000 });

  const directions: Array<Record<string, unknown>> = [];
  const startedAt = Date.now();
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    const preview = page.getByTestId(`direction-preview-${number}`);
    await expect(card).toBeVisible();
    await expect(preview).toBeVisible();
    const initialLoadingNodes = await preview.locator('[data-testid="resource-loading"]').count();
    const initialLoadingMessages = await preview
      .locator('[data-testid="resource-loading"], [data-testid="resource-deferred"]')
      .allTextContents();
    if (initialLoadingMessages.length > 0) {
      expect(initialLoadingMessages.join(' ')).toMatch(/loading (?:interface element|section content)/i);
      expect(initialLoadingMessages.join(' ')).not.toMatch(/loading\s+[a-z0-9]+(?:-[a-z0-9]+)+/i);
    }
    const initialScreenshot = path.join(evidenceDir, `direction-${number}-${testInfo.project.name}-initial.png`);
    await preview.screenshot({ path: initialScreenshot });
    await expect(preview.locator('[data-testid="resource-loading"]')).toHaveCount(0, { timeout: 60_000 });
    const settledAtMs = Date.now() - startedAt;
    const previewSummary = await preview.evaluate((element) => ({
      text: element.innerText.slice(0, 500),
      resourceNodes: element.querySelectorAll('[data-node-id][data-resource-variant]').length,
      unresolved: element.querySelectorAll('[data-testid="missing-resource-recovery"]').length,
      requiredRoleDiagnostics: element.querySelectorAll('[data-testid="unresolved-required-role-diagnostic"]').length,
      loadFailures: element.querySelectorAll('[data-testid="resource-load-failure"]').length,
      documentWidth: element.scrollWidth,
      viewportWidth: element.clientWidth,
    }));
    const cardScreenshot = path.join(evidenceDir, `direction-${number}-${testInfo.project.name}-settled.png`);
    await preview.screenshot({ path: cardScreenshot });

    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-testid="resource-loading"]')).toHaveCount(0, { timeout: 60_000 });
    await dialog.getByText('Design DNA and resource references', { exact: true }).click();
    const detailText = await dialog.locator('pre').innerText();
    const details = JSON.parse(detailText) as Record<string, unknown>;
    const modalScreenshot = path.join(evidenceDir, `direction-${number}-${testInfo.project.name}-details.png`);
    await dialog.screenshot({ path: modalScreenshot });
    directions.push({
      number,
      projectId: await card.getAttribute('data-project-id'),
      name: await card.locator('h3').first().innerText(),
      summary: previewSummary,
      initialLoadingNodes,
      initialLoadingMessages,
      previewSettledAtMs: settledAtMs,
      details,
      initialScreenshot: path.relative(process.cwd(), initialScreenshot).replaceAll('\\', '/'),
      cardScreenshot: path.relative(process.cwd(), cardScreenshot).replaceAll('\\', '/'),
      modalScreenshot: path.relative(process.cwd(), modalScreenshot).replaceAll('\\', '/'),
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  const report = {
    deploymentUrl: page.url(),
    viewport: testInfo.project.name,
    checkedAt: new Date().toISOString(),
    directions,
    consoleErrors,
    consoleWarnings,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
    scriptRequests,
  };
  await writeFile(path.join(evidenceDir, `report-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(directions).toHaveLength(3);
  expect(new Set(directions.map((direction) => direction.name)).size).toBe(3);
  for (const direction of directions) {
    const summary = direction.summary as { resourceNodes: number; unresolved: number; requiredRoleDiagnostics: number; loadFailures: number };
    expect(summary.resourceNodes).toBeGreaterThan(0);
    expect(summary.unresolved).toBe(0);
    expect(summary.requiredRoleDiagnostics).toBe(0);
    expect(summary.loadFailures).toBe(0);
  }
  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
