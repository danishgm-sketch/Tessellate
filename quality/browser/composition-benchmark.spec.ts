import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

type BenchmarkBrief = {
  id: string;
  industry: string;
  brief: string;
  expectedPrimaryArchetype: string;
  acceptableArchetypes: string[];
};

type Benchmark = { briefs: BenchmarkBrief[] };

type AuditNode = {
  semanticRole: string;
  resourceRef?: { slug?: string; id?: string };
  children?: AuditNode[];
};

type Screen = { id: string; name: string; rootNode: AuditNode };

type ProjectManifest = {
  id: string;
  dna: { primaryArchetype?: string };
  navigation: { model: string };
  grammar: string;
  screens: Screen[];
  diagnostics: unknown[];
};

type DirectionEvidence = {
  number: string;
  projectId: string;
  archetype: string | undefined;
  directionCardCopy: string;
  navigation: string;
  grammar: string;
  screenNames: string[];
  selectedRepresentativeScreen: string;
  semanticRoles: string[];
  uniqueResourceSlugs: string[];
  diagnostics: unknown[];
  geometry: { canvas: Record<string, number>; page: { width: number; scrollWidth: number } };
  screenshot: string;
};

function walk(node: AuditNode): AuditNode[] {
  return [node, ...(node.children ?? []).flatMap(walk)];
}

function distinctValues(values: string[]): string {
  return [...new Set(values)].sort().join('|');
}

function serializeReport(filePath: string, report: Record<string, unknown>) {
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`);
}

async function readVisibleManifest(page: Page): Promise<ProjectManifest> {
  const details = page
    .getByRole('dialog')
    .locator('details')
    .filter({ hasText: 'Design DNA and resource references' });
  await details.locator('summary').click();
  const source = await details.locator('pre').innerText();
  const manifest = JSON.parse(source) as ProjectManifest;
  await details.locator('summary').click();
  await page.getByRole('dialog').evaluate((element) => {
    element.scrollTo({ top: 0, left: 0 });
    for (const scrollable of element.querySelectorAll<HTMLElement>('*')) {
      if (scrollable.scrollHeight > scrollable.clientHeight) {
        scrollable.scrollTo({ top: 0, left: 0 });
      }
    }
  });
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0 }));
  return manifest;
}

test('compose all adjudicated briefs and inspect all three visible directions', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(3_600_000);
  const viewportName = isMobile ? 'mobile' : 'desktop';
  const benchmarkPath = path.resolve(process.cwd(), 'quality/COMPOSITION_QUALITY_BENCHMARK.json');
  const benchmark = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8')) as Benchmark;
  const requestedIds = new Set(
    (process.env.COMPOSITION_REVIEW_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  );
  const requestedBriefs = requestedIds.size
    ? benchmark.briefs.filter((brief) => requestedIds.has(brief.id))
    : benchmark.briefs;
  expect(requestedBriefs.map((brief) => brief.id).sort()).toEqual(
    requestedIds.size ? [...requestedIds].sort() : requestedBriefs.map((brief) => brief.id).sort()
  );
  const requestedLimit = Number(process.env.COMPOSITION_REVIEW_LIMIT ?? benchmark.briefs.length);
  const briefs = requestedBriefs.slice(0, Number.isFinite(requestedLimit) ? requestedLimit : undefined);
  const evidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-14/manual-review/current',
    viewportName
  );
  fs.mkdirSync(evidenceDirectory, { recursive: true });

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  const briefsEvidence: Array<{ id: string; brief: string; directions: DirectionEvidence[] }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`
    );
  });
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  const reportPath = path.join(evidenceDirectory, 'browser-review.json');
  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    sourceSha:
      process.env.AUDIT_SOURCE_SHA ??
      execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    source: 'Visible /compose UI; each brief entered through the form and each direction opened in the preview dialog.',
    viewport: { label: viewportName, ...page.viewportSize() },
    expectedBriefCount: briefs.length,
    completedBriefCount: 0,
    directionCount: 0,
    status: 'in_progress',
    briefs: briefsEvidence,
    consoleErrors,
    consoleWarnings,
    uncaught,
    failedRequests,
    httpErrors,
  };
  serializeReport(reportPath, report);

  for (const brief of briefs) {
    const initialResponse = await page.goto('/compose');
    expect(initialResponse?.status(), `${brief.id} Compose should return HTTP 200`).toBe(200);
    await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
      timeout: 15000,
    });
    await page.locator('textarea#description').fill(brief.brief);
    const submit = page.locator('[data-testid="compose-submit-btn"]');
    await expect(submit).toBeEnabled();
    await submit.click();

    const directions: DirectionEvidence[] = [];
    for (const number of ['01', '02', '03']) {
      const card = page.locator(`[data-testid="direction-card-${number}"]`);
      await expect(card).toBeVisible();
      const cardCopy = await card.innerText();
      await expect(card.locator(`[data-testid="direction-preview-${number}"] [data-testid="missing-resource-recovery"]`)).toHaveCount(0);
      await expect(
        card.locator(
          `[data-testid="direction-preview-${number}"] [data-testid="unresolved-required-role-diagnostic"]`
        )
      ).toHaveCount(0);
      await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();

      const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
      await expect(dialog).toBeVisible();
      const manifest = await readVisibleManifest(page);
      const manifestCaptureIds = new Set(
        (process.env.COMPOSITION_REVIEW_CAPTURE_MANIFESTS ?? '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      );
      if (manifestCaptureIds.has(brief.id)) {
        const manifestDirectory = path.join(evidenceDirectory, 'manifests');
        fs.mkdirSync(manifestDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(manifestDirectory, `${brief.id.toLowerCase()}-direction-${number}.json`),
          `${JSON.stringify(manifest, null, 2)}\n`
        );
      }
      expect(manifest.id, `${brief.id} Direction ${number} must have a project identity`).toBeTruthy();
      expect(manifest.dna.primaryArchetype).toBeTruthy();
      expect(brief.acceptableArchetypes).toContain(manifest.dna.primaryArchetype);
      expect(manifest.screens.length, `${brief.id} Direction ${number} needs product screens`).toBeGreaterThan(0);
      expect(new Set(manifest.screens.map((screen) => screen.name)).size).toBe(
        manifest.screens.length
      );
      expect(manifest.diagnostics, `${brief.id} Direction ${number} must resolve all resources`).toEqual([]);

      const nodes = manifest.screens.flatMap((screen) => walk(screen.rootNode));
      const resources = [...new Set(nodes.flatMap((node) => (node.resourceRef?.slug ? [node.resourceRef.slug] : [])))].sort();
      expect(resources.length, `${brief.id} Direction ${number} must use real resources`).toBeGreaterThan(0);
      const screen = manifest.screens.find((candidate) => !/marketing|landing/i.test(candidate.name)) ?? manifest.screens[0]!;
      const screenSelect = dialog.getByLabel('Direction preview screen');
      await expect(screenSelect.locator('option')).toHaveCount(manifest.screens.length);
      await screenSelect.selectOption({ value: screen.id });
      await expect(dialog.getByRole('heading', { name: new RegExp(`Direction ${number}`) })).toBeVisible();
      const remainingDialogScroll = await dialog.evaluate((element) => {
        const scrollables = [element, ...element.querySelectorAll<HTMLElement>('*')].filter(
          (candidate) => candidate.scrollHeight > candidate.clientHeight
        );
        return scrollables.map((candidate) => candidate.scrollTop);
      });
      expect(remainingDialogScroll, `${brief.id} Direction ${number} screenshot must start at the preview top`).toEqual(
        remainingDialogScroll.map(() => 0)
      );
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas.locator('[data-semantic-role]')).not.toHaveCount(0);
      await expect(canvas.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
      await expect(canvas.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);

      if (brief.id === 'RES-01' && number === '03' && screen.name === 'Research Terminal') {
        await expect(
          canvas.locator('nav[aria-label="Product screens"]'),
          'Direction C should expose the product navigation once'
        ).toHaveCount(1);
        const canvasViewport = canvas.locator('[data-semantic-role="canvas-viewport"]');
        const inspector = canvas.locator('[data-semantic-role="inspector-panel"]');
        await expect(canvasViewport).toContainText('Global search');
        await expect(canvasViewport).not.toContainText(
          /global-search|expand-relations|highlight-findings|export-dossier/
        );
        const [canvasBounds, inspectorBounds] = await Promise.all([
          canvasViewport.boundingBox(),
          inspector.boundingBox(),
        ]);
        expect(canvasBounds, 'the main research canvas should render').not.toBeNull();
        expect(inspectorBounds, 'the research inspector should render').not.toBeNull();
        if (canvasBounds && inspectorBounds) {
          if (isMobile) {
            expect(canvasBounds.y, 'mobile canvas should precede its inspector').toBeLessThan(
              inspectorBounds.y
            );
          } else {
            expect(canvasBounds.x, 'desktop canvas should occupy the primary column').toBeLessThan(
              inspectorBounds.x
            );
            expect(canvasBounds.width, 'desktop canvas should be wider than the inspector').toBeGreaterThan(
              inspectorBounds.width
            );
          }
        }
      }

      const geometry = await canvas.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          scrollWidth: element.scrollWidth,
          scrollHeight: element.scrollHeight,
        };
      });
      const pageGeometry = await page.evaluate(() => ({
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(pageGeometry.scrollWidth).toBeLessThanOrEqual(pageGeometry.width + 2);

      const screenshotName = `${brief.id.toLowerCase()}-direction-${number}.png`;
      const screenshotPath = path.join(evidenceDirectory, screenshotName);
      await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
      const direction: DirectionEvidence = {
        number,
        projectId: manifest.id,
        archetype: manifest.dna.primaryArchetype,
        directionCardCopy: cardCopy,
        navigation: manifest.navigation.model,
        grammar: manifest.grammar,
        screenNames: manifest.screens.map((candidate) => candidate.name),
        selectedRepresentativeScreen: screen.name,
        semanticRoles: [...new Set(nodes.map((node) => node.semanticRole))].sort(),
        uniqueResourceSlugs: resources,
        diagnostics: manifest.diagnostics,
        geometry: { canvas: geometry, page: pageGeometry },
        screenshot: path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'),
      };
      directions.push(direction);
      await dialog.getByRole('button', { name: 'Close dialog' }).click();
    }

    const pairwise = [
      [directions[0]!, directions[1]!],
      [directions[0]!, directions[2]!],
      [directions[1]!, directions[2]!],
    ];
    for (const [left, right] of pairwise) {
      const differenceAxes = [
        left.navigation !== right.navigation,
        left.grammar !== right.grammar,
        distinctValues(left.screenNames) !== distinctValues(right.screenNames),
        distinctValues(left.uniqueResourceSlugs) !== distinctValues(right.uniqueResourceSlugs),
      ].filter(Boolean).length;
      expect(differenceAxes, `${brief.id} directions ${left.number}/${right.number} need structural differences`).toBeGreaterThanOrEqual(2);
    }

    briefsEvidence.push({ id: brief.id, brief: brief.brief, directions });
    report.completedBriefCount = briefsEvidence.length;
    report.directionCount = briefsEvidence.reduce((count, item) => count + item.directions.length, 0);
    serializeReport(reportPath, report);
  }

  report.status = 'passed';
  report.finishedAt = new Date().toISOString();
  serializeReport(reportPath, report);
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});
