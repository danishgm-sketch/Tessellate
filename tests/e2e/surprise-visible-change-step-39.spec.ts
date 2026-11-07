import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectManifestSchema, type ProjectManifest, type ProjectNode } from '../../packages/schemas/src/index.js';

function flattenNodes(node: ProjectNode): ProjectNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

function findNode(manifest: ProjectManifest, id: string): ProjectNode | undefined {
  for (const screen of manifest.screens) {
    const found = flattenNodes(screen.rootNode).find((node) => node.id === id);
    if (found) return found;
  }
  return undefined;
}

test('Surprise Me changes a real rendered resource variant through the Workbench UI', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  const downloadManifest = async (name: string) => {
    await page.getByTestId('export-button').click();
    const pending = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await pending;
    const file = testInfo.outputPath(name);
    await download.saveAs(file);
    return ProjectManifestSchema.parse(JSON.parse(await readFile(file, 'utf8')));
  };

  const before = await downloadManifest('surprise-before.tess.json');
  const hero = flattenNodes(before.screens[0]!.rootNode).find(
    (node) => node.resourceRef?.slug === 'editorial-hero',
  );
  expect(hero, 'The active showcase screen should render its actual editorial hero resource.').toBeDefined();
  if (!hero) throw new Error('The showcase does not contain its editorial hero resource.');
  const heroElement = page.locator(`[data-node-id="${hero.id}"]`);
  await expect(heroElement).toBeVisible();
  const beforeVariant = await heroElement.getAttribute('data-resource-variant');
  const beforeImage = await heroElement.screenshot();

  await page.getByTestId('surprise-me-button').click();
  const status = page.getByRole('status').filter({ hasText: 'Surprise Me (divergence: 60%)' });
  await expect(status).toContainText('Changed the visible variant for editorial-hero');
  const after = await downloadManifest('surprise-after.tess.json');
  const updatedHero = findNode(after, hero.id);
  expect(updatedHero?.resourceRef?.slug).toBe('editorial-hero');
  expect(updatedHero?.variant).not.toBe(hero.variant);
  await expect(heroElement).toHaveAttribute('data-resource-variant', updatedHero!.variant!);
  const afterImage = await heroElement.screenshot();
  expect(Buffer.from(afterImage).equals(Buffer.from(beforeImage))).toBe(false);

  const evidence = {
    route: new URL(page.url()).pathname,
    viewport: page.viewportSize(),
    projectId: before.id,
    activeResourceNodeId: hero.id,
    resourceSlug: hero.resourceRef?.slug,
    previousVariant: beforeVariant,
    updatedVariant: updatedHero?.variant,
    status: await status.innerText(),
    screenshots: {
      before: `quality/evidence/step-39/surprise-visible-change/${testInfo.project.name}-before.png`,
      after: `quality/evidence/step-39/surprise-visible-change/${testInfo.project.name}-after.png`,
    },
    ...runtime,
  };
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/surprise-visible-change');
  await mkdir(evidenceDirectory, { recursive: true });
  await heroElement.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-after.png`) });
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}-before.png`), beforeImage);
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
