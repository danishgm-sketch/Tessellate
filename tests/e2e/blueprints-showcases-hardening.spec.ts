import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { applyVisualAmbition } from '../../packages/dna/src/index.js';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

const blueprints = [
  'ai-product',
  'b2b-saas',
  'developer-platform',
  'fintech',
  'ecommerce',
  'marketplace',
  'analytics-platform',
  'research-intelligence',
  'crm-operations',
  'education-product',
  'creator-media',
  'consumer-productivity',
];

const showcases = [
  'showcase-ai-developer-platform',
  'showcase-creator-analytics',
  'showcase-financial-terminal',
  'showcase-luxury-ecommerce',
  'showcase-luxury-hospitality',
  'showcase-minimal-productivity',
  'showcase-playful-hr',
  'showcase-scientific-research',
];

async function waitForLoadedIslands(page: import('@playwright/test').Page) {
  await page.locator('astro-island[client="load"]').evaluateAll(async (islands) => {
    await Promise.all(
      islands.map((island) => {
        if (!island.hasAttribute('ssr')) return Promise.resolve();
        return new Promise<void>((resolve) =>
          island.addEventListener('astro:hydrate', resolve, { once: true })
        );
      })
    );
  });
}

type RuntimeCollection = {
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: string[];
  httpErrors: Array<{ status: number; url: string }>;
};

function observeRuntime(
  page: import('@playwright/test').Page,
  active: () => RuntimeCollection | null
) {
  page.on('console', (message) => {
    const current = active();
    if (message.type() === 'error') current?.consoleErrors.push(message.text());
    if (message.type() === 'warning') current?.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => active()?.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    active()?.failedRequests.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
    )
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      active()?.httpErrors.push({ status: response.status(), url: response.url() });
  });
}

function collectManifestResourceProps(value: unknown, slug: string) {
  const matches: Array<Record<string, unknown>> = [];
  const visit = (candidate: unknown) => {
    if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) return;
    const record = candidate as Record<string, unknown>;
    const reference = record.resourceRef;
    if (
      reference !== null &&
      typeof reference === 'object' &&
      !Array.isArray(reference) &&
      (reference as Record<string, unknown>).slug === slug &&
      record.props !== null &&
      typeof record.props === 'object' &&
      !Array.isArray(record.props)
    ) {
      matches.push(record.props as Record<string, unknown>);
    }
    if (Array.isArray(record.children)) record.children.forEach(visit);
  };
  visit(value);
  return matches;
}

test('all blueprint and showcase routes render with usable content at this viewport', async ({
  page,
}, testInfo) => {
  const directory = path.resolve(process.cwd(), 'quality/evidence/step-34/after');
  await mkdir(directory, { recursive: true });
  const findings: Array<Record<string, unknown>> = [];
  let current: Record<string, unknown> | null = null;
  page.on('console', (message) => {
    if (message.type() === 'error')
      (current?.consoleErrors as string[] | undefined)?.push(message.text());
    if (message.type() === 'warning')
      (current?.consoleWarnings as string[] | undefined)?.push(message.text());
  });
  page.on('pageerror', (error) =>
    (current?.uncaughtExceptions as string[] | undefined)?.push(error.message)
  );
  page.on('requestfailed', (request) =>
    (current?.failedRequests as string[] | undefined)?.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
    )
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      (current?.httpErrors as Array<{ status: number; url: string }> | undefined)?.push({
        status: response.status(),
        url: response.url(),
      });
    }
  });

  const routes = [
    { kind: 'gallery' as const, slug: 'blueprints', path: '/blueprints/' },
    { kind: 'gallery' as const, slug: 'showcase', path: '/showcase/' },
    { kind: 'gallery' as const, slug: 'showcases', path: '/showcases/' },
    ...blueprints.map((slug) => ({
      kind: 'blueprint' as const,
      slug,
      path: `/blueprints/${slug}/`,
    })),
    ...showcases.map((slug) => ({ kind: 'showcase' as const, slug, path: `/showcase/${slug}/` })),
  ];

  for (const route of routes) {
    current = {
      kind: route.kind,
      slug: route.slug,
      route: route.path,
      viewport: page.viewportSize(),
      consoleErrors: [],
      consoleWarnings: [],
      uncaughtExceptions: [],
      failedRequests: [],
      httpErrors: [],
    };
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    await waitForLoadedIslands(page);

    if (route.kind === 'gallery') {
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      const expectedLinks =
        route.slug === 'blueprints'
          ? blueprints.map((slug) => `/blueprints/${slug}/`)
          : showcases.map((slug) => `/showcase/${slug}/`);
      for (const href of expectedLinks)
        await expect(
          page.locator(`a[href="${href}"]`),
          `${route.path} links to ${href}`
        ).toHaveCount(route.slug === 'blueprints' ? 1 : 2);
    } else if (route.kind === 'blueprint') {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Audience and objective' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Required page classes' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Anti-patterns' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Compose this blueprint' })).toBeVisible();
    } else {
      // Showcase content may include the app preview's own H1; verify the
      // showcase title without treating its embedded product heading as a duplicate failure.
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      const screenSelect = page.getByRole('combobox', { name: 'Example screen' });
      await expect(screenSelect).toBeVisible();
      const screenOptions = await screenSelect.locator('option').evaluateAll((options) =>
        options.map((option) => ({
          label: (option as HTMLOptionElement).label,
          value: (option as HTMLOptionElement).value,
        }))
      );
      const options = screenOptions.map((option) => option.label);
      expect(options.length, route.slug).toBeGreaterThanOrEqual(3);
      const renderedScreen = page.locator('.tess-screen');
      await expect(renderedScreen).toBeVisible();
      const screenRenders: Array<Record<string, unknown>> = [];
      for (const option of screenOptions) {
        await screenSelect.selectOption({ value: option.value });
        await expect(renderedScreen).toHaveAttribute('data-screen-id', option.value);
        await expect(
          renderedScreen.locator('[data-testid="missing-resource-recovery"]')
        ).toHaveCount(0);
        await expect(
          renderedScreen.locator('[data-testid="unresolved-required-role-diagnostic"]')
        ).toHaveCount(0);
        const geometry = await renderedScreen.evaluate((element) => ({
          viewportWidth: element.clientWidth,
          contentWidth: element.scrollWidth,
          horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
        }));
        expect(geometry.horizontalOverflow, `${route.path} ${option.label}`).toBe(false);
        if (route.slug === 'showcase-ai-developer-platform' && option.label === 'Prompt Canvas') {
          const navigationCount = await renderedScreen.locator('[data-semantic-role="navigation"]').count();
          const editorToolbarCount = await renderedScreen.locator('[data-semantic-role="editor-toolbar"]').count();
          expect(navigationCount, 'Prompt Canvas should have one product navigation').toBe(1);
          expect(editorToolbarCount, 'Prompt Canvas must not substitute a second product navigation for its editor toolbar').toBe(0);
          const promptCanvasScreenshot = `quality/evidence/step-34/after/${testInfo.project.name}-showcase-ai-developer-platform-prompt-canvas.png`;
          await renderedScreen.screenshot({ path: path.resolve(process.cwd(), promptCanvasScreenshot) });
          current!.promptCanvasNavigation = { navigationCount, editorToolbarCount, screenshot: promptCanvasScreenshot };
        }
        screenRenders.push({ label: option.label, screenId: option.value, ...geometry });
      }
      current!.screenRenders = screenRenders;

      if (screenOptions[1]) await screenSelect.selectOption({ value: screenOptions[1].value });

      const addCondition = page.getByRole('button', { name: '+ Add Condition' });
      if (await addCondition.count()) {
        await addCondition.click();
        const field = page.getByLabel('Field 1');
        const value = page.getByLabel('Value 1');
        await expect(field).toBeVisible();
        await field.selectOption('name');
        await page.getByLabel('Operator 1').selectOption('contains');
        await value.fill('Example');
        await expect(page.getByRole('status')).toContainText('Name contains Example');
        await page.getByRole('button', { name: 'Remove condition 1' }).click();
        await expect(field).toHaveCount(0);
        current!.exampleFilterInteraction = 'add, edit, announce and remove passed';
      }

      await screenSelect.selectOption({ value: screenOptions[0]!.value });

      const pendingDownload = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Download exact example manifest' }).click();
      const download = await pendingDownload;
      const destination = path.join(testInfo.outputDir, `${route.slug}.tess.json`);
      await download.saveAs(destination);
      const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(destination, 'utf8')));
      expect(manifest.id).toBe(route.slug);
      expect(manifest.screens.map((screen) => screen.name)).toEqual(options);
      const unconnectedButtons = manifest.screens.flatMap((screen) =>
        collectManifestResourceProps(screen.rootNode, 'button')
      );
      for (const props of unconnectedButtons) {
        expect(props.disabled, `${route.slug} unconnected ${String(props.children)}`).toBe(true);
        expect(props.helperText).toBeTruthy();
      }

      if (route.slug === 'showcase-luxury-hospitality') {
        expect(manifest.productModel.productArchetypes[0]?.tag).toBe('travel');
        expect(options).toEqual(
          expect.arrayContaining(['Find a Stay', 'Room Details', 'Reservation Checkout'])
        );
        expect(JSON.stringify(manifest).toLowerCase()).not.toMatch(
          /article reader|journalist|newsroom/
        );
      }
      if (route.slug === 'showcase-playful-hr') {
        expect(manifest.name).toBe('Kudos Employee Experience');
        expect(options).toEqual(
          expect.arrayContaining([
            'People Directory',
            'Teams',
            'Onboarding',
            'Engagement',
            'Settings & Policies',
          ])
        );
        expect(JSON.stringify(manifest).toLowerCase()).not.toMatch(
          /candidate|applicant|hiring|recruiter|interview/
        );
      }
    }

    const viewport = page.viewportSize();
    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    const axe = await new AxeBuilder({ page }).analyze();
    const screenshot = `quality/evidence/step-34/after/${testInfo.project.name}-${route.kind}-${route.slug}.png`;
    await page.screenshot({ path: path.resolve(process.cwd(), screenshot), fullPage: true });
    current!.viewport = viewport ? `${viewport.width}x${viewport.height}` : 'unknown';
    current!.httpStatus = response?.status() ?? null;
    current!.layout = layout;
    current!.axeViolations = axe.violations.map(({ id, impact, help }) => ({ id, impact, help }));
    current!.screenshot = screenshot;
    findings.push(current);
    expect(current.consoleErrors, route.path).toEqual([]);
    expect(current.uncaughtExceptions, route.path).toEqual([]);
    expect(current.failedRequests, route.path).toEqual([]);
    expect(current.httpErrors, route.path).toEqual([]);
    expect(layout.horizontalOverflow, route.path).toBe(false);
    expect(
      axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
    ).toEqual([]);
  }

  current = null;
  await writeFile(
    path.join(directory, `${testInfo.project.name}-route-audit.json`),
    `${JSON.stringify({ viewport: page.viewportSize(), routes: findings }, null, 2)}\n`,
    'utf8'
  );
});

test('every blueprint composes three real directions, opens Workbench, mutates and exports', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome');
  test.setTimeout(240000);
  const directory = path.resolve(
    process.cwd(),
    'quality/evidence/step-34/after/blueprint-workbench'
  );
  await mkdir(directory, { recursive: true });
  const results: Array<Record<string, unknown>> = [];
  let current: RuntimeCollection | null = null;
  observeRuntime(page, () => current);

  for (const slug of blueprints) {
    current = {
      consoleErrors: [],
      consoleWarnings: [],
      uncaughtExceptions: [],
      failedRequests: [],
      httpErrors: [],
    };
    await page.goto(`/blueprints/${slug}/`);
    await page.getByRole('link', { name: 'Compose this blueprint' }).click();
    await expect(page).toHaveURL(new RegExp(`/compose\\?blueprint=${slug}`));
    await waitForLoadedIslands(page);
    await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
      timeout: 20000,
    });
    const description = page.locator('textarea#description');
    await expect(description).not.toHaveValue('');
    await page.getByTestId('compose-submit-btn').click();

    for (const direction of ['01', '02', '03']) {
      const card = page.getByTestId(`direction-card-${direction}`);
      await expect(card).toBeVisible();
      await expect(
        card.getByTestId(`direction-preview-${direction}`).locator('.tess-screen')
      ).toBeVisible();
      await expect(card.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
      await expect(card.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
        0
      );
    }

    const chosen = page.getByTestId('direction-card-03');
    const projectId = await chosen.getAttribute('data-project-id');
    expect(projectId).toBeTruthy();
    await chosen.getByTestId('open-workbench-dir-03').click();
    await expect(page).toHaveURL(new RegExp(`/workbench\\?project=${projectId}`));
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    await expect(page.locator('[data-screen-id]').first()).toBeVisible();

    await page
      .getByTestId('right-inspector')
      .getByRole('button', { name: 'Intent', exact: true })
      .click();
    const ambition = page.getByRole('slider', { name: 'Visual Ambition' });
    await ambition.focus();
    await ambition.press('Home');
    await expect(ambition).toHaveValue('0');

    await page.getByTestId('export-button').click();
    const pendingDownload = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await pendingDownload;
    const destination = path.join(testInfo.outputDir, `${slug}-${projectId}.tess.json`);
    await download.saveAs(destination);
    const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(destination, 'utf8')));
    expect(manifest.id).toBe(projectId);
    expect(manifest.designDNA.visualAmbition).toBe(0);
    expect(manifest.screens.length).toBeGreaterThan(0);

    const screenshot = path.join(directory, `${slug}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    expect(current.consoleErrors, slug).toEqual([]);
    expect(current.uncaughtExceptions, slug).toEqual([]);
    expect(current.failedRequests, slug).toEqual([]);
    expect(current.httpErrors, slug).toEqual([]);
    results.push({
      slug,
      projectId,
      screens: manifest.screens.map((screen) => screen.name),
      mutatedVisualAmbition: manifest.designDNA.visualAmbition,
      exportSchemaValid: true,
      screenshot: path.relative(process.cwd(), screenshot),
      ...current,
    });
  }

  await writeFile(
    path.join(directory, 'workflow.json'),
    `${JSON.stringify(results, null, 2)}\n`,
    'utf8'
  );
});

test('every showcase opens in Workbench, accepts a visible DNA edit, and exports that project', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome');
  test.setTimeout(180000);
  const directory = path.resolve(
    process.cwd(),
    'quality/evidence/step-34/after/showcase-workbench'
  );
  await mkdir(directory, { recursive: true });
  const results: Array<Record<string, unknown>> = [];
  let current: RuntimeCollection | null = null;
  observeRuntime(page, () => current);

  for (const slug of showcases) {
    current = {
      consoleErrors: [],
      consoleWarnings: [],
      uncaughtExceptions: [],
      failedRequests: [],
      httpErrors: [],
    };
    await page.goto(`/showcase/${slug}/`);
    const sourceDownloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download exact example manifest' }).click();
    const sourceDownload = await sourceDownloadPromise;
    const sourcePath = path.join(testInfo.outputDir, `${slug}-source.tess.json`);
    await sourceDownload.saveAs(sourcePath);
    const sourceManifest = ProjectManifestSchema.parse(
      JSON.parse(await readFile(sourcePath, 'utf8'))
    );
    expect(sourceManifest.id).toBe(slug);

    await page.goto(`/showcase/${slug}/`);
    await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
    await expect(page).toHaveURL(new RegExp(`/workbench\\?showcase=${slug}`));
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    await expect(page.locator('[data-screen-id]').first()).toBeVisible();
    await page
      .getByTestId('right-inspector')
      .getByRole('button', { name: 'Intent', exact: true })
      .click();
    const ambition = page.getByRole('slider', { name: 'Visual Ambition' });
    await ambition.focus();
    await ambition.press('Home');
    await expect(ambition).toHaveValue('0');

    await page.getByTestId('export-button').click();
    const pendingDownload = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await pendingDownload;
    const destination = path.join(testInfo.outputDir, `${slug}-edited.tess.json`);
    await download.saveAs(destination);
    const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(destination, 'utf8')));
    expect(manifest.id).not.toBe(slug);
    expect(manifest.name).toBe(sourceManifest.name);
    expect(manifest.productModel).toEqual(sourceManifest.productModel);
    expect(manifest.screens).toEqual(sourceManifest.screens);
    // Visual Ambition is a named composite control: its documented companion
    // fields move together while the other Design DNA values remain intact.
    expect(manifest.designDNA).toEqual(applyVisualAmbition(sourceManifest.designDNA, 0));

    const screenshot = path.join(directory, `${slug}-workbench.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    expect(current.consoleErrors, slug).toEqual([]);
    expect(current.uncaughtExceptions, slug).toEqual([]);
    expect(current.failedRequests, slug).toEqual([]);
    expect(current.httpErrors, slug).toEqual([]);
    results.push({
      slug,
      projectId: manifest.id,
      screens: manifest.screens.map((screen) => screen.name),
      mutatedVisualAmbition: manifest.designDNA.visualAmbition,
      exportSchemaValid: true,
      screenshot: path.relative(process.cwd(), screenshot),
      ...current,
    });
  }

  await writeFile(
    path.join(directory, 'workflow.json'),
    `${JSON.stringify(results, null, 2)}\n`,
    'utf8'
  );
});
