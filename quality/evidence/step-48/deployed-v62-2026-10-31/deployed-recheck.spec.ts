import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ProjectManifestSchema } from '../../../../packages/schemas/src/index.js';

const evidenceRoot = path.resolve(process.cwd(), 'quality/evidence/step-48/deployed-v62-2026-10-31');
const baseEvidence = path.join(evidenceRoot, 'browser-recheck');
const financeTypography = 'financial-sans-tabular-mono';

function observe(page: Page) {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ status: number; url: string }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
  });
  return { consoleErrors, consoleWarnings, pageErrors, failedRequests, httpErrors };
}

async function saveEvidence(
  page: Page,
  testInfo: import('@playwright/test').TestInfo,
  name: string,
  runtime: ReturnType<typeof observe>,
  checks: Record<string, unknown>,
) {
  await mkdir(baseEvidence, { recursive: true });
  const screenshot = path.join(baseEvidence, `${name}-${testInfo.project.name}.png`);
  const evidence = path.join(baseEvidence, `${name}-${testInfo.project.name}.json`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    evidence,
    `${JSON.stringify(
      {
        deployment: 'Tessellate Sites v62',
        url: page.url(),
        viewport: page.viewportSize(),
        browserProject: testInfo.project.name,
        runtime,
        checks,
        screenshot: path.relative(process.cwd(), screenshot),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

test('AUD-403 deployed Surprise Me keeps employee SaaS typography domain-appropriate', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const runtime = observe(page);
  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });

  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = `aud403-v62-employee-${randomUUID()}`;
  manifest.name = 'Employee experience typography recheck';
  manifest.seed = '22c8a6fd-24fb-4be2-80cc-457350c086b6-dir-c';
  manifest.productModel.productArchetypes = [{ tag: 'saas', weight: 100 }];
  manifest.designDNA.primaryArchetype = 'saas';
  manifest.designDNA.typographyPersonality = 'geist-system';

  const importPath = testInfo.outputPath('aud403-seeded-employee.tess.json');
  await mkdir(path.dirname(importPath), { recursive: true });
  await writeFile(importPath, JSON.stringify(manifest, null, 2), 'utf8');
  await page.getByTestId('export-button').click();
  await page.getByTestId('manifest-import-input').setInputFiles(importPath);
  await expect(page.getByTestId('manifest-import-status')).toContainText('Opened Employee experience typography recheck');
  await page.getByTestId('surprise-me-button').click();
  await expect(page.getByRole('status').filter({ hasText: 'Surprise Me (divergence: 60%)' })).toBeVisible();

  await page.getByTestId('export-button').click();
  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  const downloadedPath = await download.path();
  if (!downloadedPath) throw new Error('The deployed Workbench did not create the manifest download.');
  const result = ProjectManifestSchema.parse(JSON.parse(await readFile(downloadedPath, 'utf8')));
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  await saveEvidence(page, testInfo, 'aud403-surprise-domain', runtime, {
    seed: result.seed,
    archetype: result.productModel.productArchetypes[0]?.tag,
    typographyBefore: manifest.designDNA.typographyPersonality,
    typographyAfter: result.designDNA.typographyPersonality,
    noHorizontalOverflow: !hasOverflow,
  });
  expect(result.seed).toBe('22c8a6fd-24fb-4be2-80cc-457350c086b6-dir-c');
  expect(result.productModel.productArchetypes[0]?.tag).toBe('saas');
  expect(result.designDNA.typographyPersonality).not.toBe(financeTypography);
  expect(hasOverflow).toBe(false);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('AUD-404 deployed ZIP failure is reported in the Workbench without a native dialog', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const runtime = observe(page);
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.addInitScript(() => {
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (object: Blob | MediaSource) => {
      if (object instanceof Blob && object.type === 'application/zip') {
        throw new Error('Injected ZIP download creation failure');
      }
      return createObjectURL(object);
    };
  });
  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Export failed: Injected ZIP download creation failure');
  const axe = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await saveEvidence(page, testInfo, 'aud404-inline-export-error', runtime, {
    inlineAlert: (await alert.allTextContents()).join(' ').trim(),
    nativeDialogs: dialogs,
    seriousOrCriticalAxeViolations: seriousOrCritical.map((violation) => ({ id: violation.id, impact: violation.impact })),
    noHorizontalOverflow: !hasOverflow,
  });
  expect(dialogs).toEqual([]);
  expect(seriousOrCritical).toEqual([]);
  expect(hasOverflow).toBe(false);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  expect(runtime.consoleErrors).toHaveLength(1);
  expect(runtime.consoleErrors[0]).toContain('Failed to generate standalone ZIP project:');
});
