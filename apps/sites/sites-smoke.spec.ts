import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index';
import { GOLD_40_SLUGS } from '../../packages/catalog/src/gold';

// Reuse the exporter's existing ZIP dependency without adding a deployment dependency.
const { unzipSync, strFromU8 } = createRequire(
  new URL('../../packages/exporter/package.json', import.meta.url)
)('fflate') as {
  unzipSync(data: Uint8Array): Record<string, Uint8Array>;
  strFromU8(data: Uint8Array): string;
};

test('packaged employee-experience journey, actual ZIP and zero browser errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const exportManifest = async () => {
    await page.getByTestId('export-button').click();
    const pending = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await pending;
    const destination = testInfo.outputPath('employee-experience.tess.json');
    await download.saveAs(destination);
    return ProjectManifestSchema.parse(JSON.parse(readFileSync(destination, 'utf8')));
  };
  const checkResources = async (manifest: ProjectManifest) => {
    await expect(
      page.locator(
        '[data-testid="missing-resource-recovery"], [data-testid="unresolved-required-role-diagnostic"]'
      )
    ).toHaveCount(0);
    const refs: Array<{ id: string; slug: string }> = [];
    const walk = (node: ProjectNode) => {
      if (node.resourceRef) refs.push({ id: node.resourceRef.id, slug: node.resourceRef.slug });
      for (const child of node.children) walk(child);
    };
    for (const screen of manifest.screens) walk(screen.rootNode);
    expect(refs.length).toBeGreaterThan(0);
    const response = await page.request.get('/data/catalog.json');
    expect(response.ok()).toBe(true);
    const catalog = (await response.json()) as { resources: Array<{ id: string; slug: string }> };
    const known = new Set(catalog.resources.map((resource) => `${resource.id}:${resource.slug}`));
    expect(refs.every((resource) => known.has(`${resource.id}:${resource.slug}`))).toBe(true);
    expect(refs.every(({ slug }) => (GOLD_40_SLUGS as readonly string[]).includes(slug))).toBe(
      true
    );
    expect(refs.some(({ slug }) => slug.startsWith('res_synth_'))).toBe(false);
  };

  await page.goto('/');
  await expect(page.locator('main#main-content')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('homepage-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('homepage-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page
    .locator('#description')
    .fill(
      'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.'
    );
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  for (const id of ['01', '02', '03']) {
    await expect(page.getByTestId(`direction-preview-${id}`)).toBeVisible();
    await expect(
      page
        .getByTestId(`direction-preview-${id}`)
        .locator('[data-testid="missing-resource-recovery"]')
    ).toHaveCount(0);
  }
  await page.screenshot({ path: testInfo.outputPath('directions-desktop.png'), fullPage: true });
  await page.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  expect(await page.evaluate(() => '__tessellate_workbench_store__' in window)).toBe(false);
  await page.getByTestId('recompose-button').click();
  await expect(page.getByRole('status').filter({ hasText: 'Recomposed' })).toBeVisible();
  let manifest = await exportManifest();
  await checkResources(manifest);
  await page.getByTestId('surprise-me-button').click();
  await expect(page.getByRole('status').filter({ hasText: 'Surprise Me' })).toBeVisible();
  manifest = await exportManifest();
  await checkResources(manifest);
  await page.screenshot({ path: testInfo.outputPath('workbench-desktop.png'), fullPage: true });
  await page.getByTestId('export-button').click();
  const downloaded = page.waitForEvent('download');
  await page.getByTestId('export-zip-btn').click();
  const zip = await downloaded;
  expect(await zip.failure()).toBeNull();
  expect(zip.suggestedFilename()).toMatch(/\.zip$/);
  const savedPath = testInfo.outputPath(zip.suggestedFilename());
  await zip.saveAs(savedPath);
  const files = unzipSync(readFileSync(savedPath));
  expect(Object.keys(files).some((name) => name.endsWith('package.json'))).toBe(true);
  expect(Object.keys(files).some((name) => name.endsWith('vite.config.ts'))).toBe(true);
  for (const content of Object.values(files))
    expect(strFromU8(content)).not.toContain('res_synth_');
  const packageJson = JSON.parse(strFromU8(files['package.json']!)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const runtimeDependencies = Object.keys(packageJson.dependencies ?? {});
  expect(runtimeDependencies).not.toContainEqual(expect.stringMatching(/^@tessellate\//));
  expect(runtimeDependencies).not.toContain('tessellate');
  const archivedManifest = ProjectManifestSchema.parse(
    JSON.parse(strFromU8(files['project.tess.json']!))
  );
  expect(archivedManifest).toEqual(manifest);
  expect(errors).toEqual([]);
});

test('all existing tools, catalogue and a resource detail load without browser errors', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const catalogResponse = await request.get('/data/catalog.json');
  expect(catalogResponse.ok()).toBe(true);
  const catalog = await catalogResponse.json();
  expect(catalog.count).toBe(324);
  for (const route of [
    '/explore',
    '/r/button',
    '/showcases',
    ...[
      'dna',
      'backgrounds',
      'motion',
      'palette',
      'typography',
      'layout',
      'section-planner',
      'dataviz',
      'accessibility',
      'icons',
    ].map((slug) => `/tools/${slug}`),
  ]) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBe(true);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0, { timeout: 15000 });
  }
  expect(errors).toEqual([]);
});
