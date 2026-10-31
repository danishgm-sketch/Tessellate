import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

const financeTypography = 'financial-sans-tabular-mono';
const reproducedSeed = '22c8a6fd-24fb-4be2-80cc-457350c086b6-dir-c';

test('Surprise Me keeps seeded employee SaaS typography out of financial styles', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );

  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });

  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = `aud403-seeded-employee-${randomUUID()}`;
  manifest.name = 'Seeded employee experience typography regression';
  manifest.seed = reproducedSeed;
  manifest.productModel.productArchetypes = [{ tag: 'saas', weight: 100 }];
  manifest.designDNA.primaryArchetype = 'saas';
  manifest.designDNA.typographyPersonality = 'geist-system';

  const importPath = testInfo.outputPath('seeded-employee-experience.tess.json');
  await mkdir(path.dirname(importPath), { recursive: true });
  await writeFile(importPath, JSON.stringify(manifest, null, 2), 'utf8');

  await page.getByTestId('export-button').click();
  await page.getByTestId('manifest-import-input').setInputFiles(importPath);
  await expect(page.getByTestId('manifest-import-status')).toContainText('Opened Seeded employee experience');
  await expect(page.getByTestId('top-toolbar')).toContainText('Seeded employee experience typography regression');

  await page.getByTestId('surprise-me-button').click();
  await expect(page.getByRole('status').filter({ hasText: 'Surprise Me (divergence: 60%)' })).toBeVisible();

  await page.getByTestId('export-button').click();
  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  const downloadedPath = await download.path();
  if (!downloadedPath) throw new Error('The seeded employee manifest was not downloaded.');
  const result = ProjectManifestSchema.parse(JSON.parse(await readFile(downloadedPath, 'utf8')));

  const evidence = {
    route: new URL(page.url()).pathname,
    viewport: page.viewportSize(),
    seed: result.seed,
    archetype: result.productModel.productArchetypes[0]?.tag,
    typographyBefore: manifest.designDNA.typographyPersonality,
    typographyAfter: result.designDNA.typographyPersonality,
    consoleErrors,
    pageErrors,
    failedRequests,
  };
  const evidencePath = testInfo.outputPath('aud403-surprise-domain-evidence.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await page.screenshot({ path: testInfo.outputPath('aud403-surprise-domain-workbench.png'), fullPage: true });

  expect(result.seed).toBe(reproducedSeed);
  expect(result.productModel.productArchetypes[0]?.tag).toBe('saas');
  expect(result.designDNA.typographyPersonality).not.toBe(financeTypography);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
