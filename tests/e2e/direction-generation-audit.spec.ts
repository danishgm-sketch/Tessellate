import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const employeeBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('employee dashboard marks unavailable metrics with a neutral status tone', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(90000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-14/manual-review');
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
    timeout: 15000,
  });
  await page.locator('textarea#description').fill(employeeBrief);
  const submit = page.locator('[data-testid="compose-submit-btn"]');
  await expect(submit).toBeEnabled();
  await submit.click();

  const reviewed: Array<Record<string, unknown>> = [];
  for (const number of ['01', '02', '03']) {
    const card = page.locator(`[data-testid="direction-card-${number}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Direction preview screen').selectOption({ label: 'Team Overview' });
    const canvas = dialog.locator('.tess-screen');
    const unavailable = canvas.getByText('No connected data', { exact: true });
    await expect(unavailable).toHaveCount(2);

    const beforePath = path.join(
      evidenceDir,
      'before',
      `aud-133-unavailable-kpi-success-tone-${viewportLabel}.png`
    );
    fs.mkdirSync(path.dirname(beforePath), { recursive: true });
    if (!fs.existsSync(beforePath)) {
      await dialog.screenshot({ path: beforePath, animations: 'disabled' });
    }

    const badgeClasses = await unavailable.evaluateAll((elements) =>
      elements.map((element) => element.className)
    );
    expect(
      badgeClasses.join(' '),
      'metrics without connected data must not use the success-green status treatment'
    ).not.toMatch(/(?:bg|text)-emerald/);

    const afterPath = path.join(
      evidenceDir,
      'after',
      `aud-133-unavailable-kpi-neutral-tone-${viewportLabel}.png`
    );
    fs.mkdirSync(path.dirname(afterPath), { recursive: true });
    await dialog.screenshot({ path: afterPath, animations: 'disabled' });
    reviewed.push({ direction: number, unavailableMetricCount: await unavailable.count(), badgeClasses });
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  const runtimeReport = {
    url: page.url(),
    viewport: page.viewportSize(),
    status: 'passed',
    reviewed,
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(
    path.join(evidenceDir, 'after', `aud-133-runtime-${viewportLabel}.json`),
    `${JSON.stringify(runtimeReport, null, 2)}\n`
  );
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});

test('flagship directions use distinct rendered structures and a real three-pane dashboard', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Direction comparison is captured at the required desktop viewport.');
  test.setTimeout(60000);

  const phase = process.env.STEP12_EVIDENCE_PHASE ?? 'current';
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/directions', phase);
  fs.mkdirSync(evidenceDir, { recursive: true });

  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(
      `${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`
    )
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
    timeout: 15000,
  });
  await page.locator('textarea#description').fill(employeeBrief);
  await page.locator('input#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.locator('[data-testid="compose-submit-btn"]').click();

  const directions: Array<Record<string, unknown>> = [];
  const expectedRootRoles = ['sidebar-shell', 'top-nav-page-canvas', 'workspace-dock-shell'];
  const expectedScreens = ['01', '02', '03'];

  for (let index = 0; index < expectedScreens.length; index += 1) {
    const number = expectedScreens[index]!;
    const card = page.locator(`[data-testid="direction-card-${number}"]`);
    await expect(card).toBeVisible();
    await expect(
      card.locator(
        `[data-testid="direction-preview-${number}"] [data-testid="missing-resource-recovery"]`
      )
    ).toHaveCount(0);
    await expect(
      card.locator(
        `[data-testid="direction-preview-${number}"] [data-testid="unresolved-required-role-diagnostic"]`
      )
    ).toHaveCount(0);
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();

    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Direction preview screen').selectOption({ label: 'Team Overview' });
    const canvas = dialog.locator('.tess-screen');
    await expect(canvas.locator('[data-semantic-role="data-table"]')).toBeVisible();
    await expect(canvas.locator('[data-semantic-role="activity-feed"]')).toBeVisible();

    await dialog.screenshot({
      path: path.join(evidenceDir, `direction-${number}-team-overview.png`),
    });

    const details = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText()) as {
      id: string;
      navigation: { model: string };
      grammar: string;
      dna: Record<string, unknown>;
      screens: Array<{ id: string; name: string; rootNode: AuditNode }>;
      diagnostics: unknown[];
    };
    const dashboard = manifest.screens.find((screen) => screen.name === 'Team Overview');
    expect(
      dashboard,
      'the selected direction should contain the inferred employee dashboard'
    ).toBeTruthy();

    const geometry = await canvas.evaluate((root) => {
      const roles = [
        'sidebar-shell',
        'top-nav-page-canvas',
        'workspace-dock-shell',
        'workspace-multi-pane',
        'navigation',
        'data-table',
        'activity-feed',
      ];
      const rect = (role: string) => {
        const element = root.querySelector<HTMLElement>(`[data-semantic-role="${role}"]`);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          left: Math.round(box.left),
          top: Math.round(box.top),
          width: Math.round(box.width),
          height: Math.round(box.height),
          display: getComputedStyle(element).display,
          gridColumn: getComputedStyle(element).gridColumn,
        };
      };
      return Object.fromEntries(roles.map((role) => [role, rect(role)]));
    });
    const walk = (node: AuditNode): AuditNode[] => [node, ...node.children.flatMap(walk)];
    const selectedResources = manifest.screens.flatMap((screen) =>
      walk(screen.rootNode)
        .filter((node) => node.resourceRef)
        .map((node) => ({
          screen: screen.name,
          role: node.semanticRole,
          slug: node.resourceRef!.slug,
          variant: node.variant,
        }))
    );

    directions.push({
      number,
      projectId: manifest.id,
      navigation: manifest.navigation.model,
      grammar: manifest.grammar,
      dna: manifest.dna,
      screenNames: manifest.screens.map((screen) => screen.name),
      dashboardRoot: dashboard?.rootNode.semanticRole,
      dashboardHierarchy: dashboard
        ? walk(dashboard.rootNode).map((node) => node.semanticRole)
        : [],
      dashboardActivityResource: selectedResources.find(
        (resource) => resource.screen === 'Team Overview' && resource.role === 'activity-feed'
      )?.slug,
      selectedResources,
      geometry,
      diagnostics: manifest.diagnostics,
    });

    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  const audit = {
    route: page.url(),
    viewport: page.viewportSize(),
    brief: employeeBrief,
    directions,
    resourceOverlap: [
      [0, 1],
      [0, 2],
      [1, 2],
    ].map(([leftIndex, rightIndex]) => {
      const left = new Set(
        (directions[leftIndex]!.selectedResources as Array<{ slug: string }>).map(
          (resource) => resource.slug
        )
      );
      const right = new Set(
        (directions[rightIndex]!.selectedResources as Array<{ slug: string }>).map(
          (resource) => resource.slug
        )
      );
      const shared = [...left].filter((slug) => right.has(slug));
      return {
        left: directions[leftIndex]!.number,
        right: directions[rightIndex]!.number,
        shared,
        onlyLeft: [...left].filter((slug) => !right.has(slug)),
        onlyRight: [...right].filter((slug) => !left.has(slug)),
        jaccard: Number((shared.length / new Set([...left, ...right]).size).toFixed(3)),
      };
    }),
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(path.join(evidenceDir, 'runtime.json'), `${JSON.stringify(audit, null, 2)}\n`);

  expect(directions.map((direction) => direction.dashboardRoot)).toEqual(expectedRootRoles);
  expect(directions.map((direction) => direction.navigation)).toEqual([
    'sidebar',
    'top-nav',
    'rail',
  ]);
  expect(new Set(directions.map((direction) => direction.grammar)).size).toBe(3);
  expect(directions.map((direction) => direction.dashboardActivityResource)).toEqual([
    'timeline',
    'timeline',
    'timeline',
  ]);
  expect(new Set(directions.map((direction) => JSON.stringify(direction.screenNames))).size).toBe(
    1
  );
  expect(directions.every((direction) => (direction.diagnostics as unknown[]).length === 0)).toBe(
    true
  );

  const directionC = directions[2]!;
  const cGeometry = directionC.geometry as Record<string, { left: number } | null>;
  const table = cGeometry['data-table'];
  const feed = cGeometry['activity-feed'];
  expect(table, 'Direction C should render the dashboard data table').not.toBeNull();
  expect(feed, 'Direction C should render the dashboard activity feed').not.toBeNull();
  expect(table!.left).toBeLessThan(feed!.left - 80);
  expect(
    Math.abs(table!.top - feed!.top),
    'Direction C should align the data table and activity stream on the same row'
  ).toBeLessThanOrEqual(24);
  expect(consoleErrors, 'the direction workflow should not log browser errors').toEqual([]);
  expect(uncaught, 'the direction workflow should not throw uncaught browser exceptions').toEqual(
    []
  );
  expect(failedRequests, 'all required requests should complete').toEqual([]);
  expect(httpErrors, 'all route and asset responses should be successful').toEqual([]);
});

interface AuditNode {
  semanticRole: string;
  resourceRef?: { slug: string };
  variant?: string;
  children: AuditNode[];
}
