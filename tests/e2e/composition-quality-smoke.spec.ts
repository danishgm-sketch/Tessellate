import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const cases = [
  {
    id: 'MKT-01',
    brief:
      'A freelance services marketplace connects independent designers with clients, supports profile discovery, project proposals, messaging, and mutual reviews.',
    screen: 'Messages & Inquiries',
  },
  {
    id: 'CON-04',
    brief:
      'A casual community app lets hobby groups post updates, welcome members, and organize lightweight conversations around shared interests.',
    screen: 'Activity Stream',
  },
];

test('showcase identity survives composition and renders in the public preview', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  const routes: Array<Record<string, unknown>> = [];
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

  const previews = [
    {
      slug: 'showcase-ai-developer-platform',
      brand: 'Prompt Workspace',
      initials: 'PW',
    },
    {
      slug: 'showcase-financial-terminal',
      brand: 'Market Workspace',
      initials: 'MW',
      screen: 'Market Overview',
    },
  ];
  const viewport = page.viewportSize();
  const viewportLabel = viewport && viewport.width < 600 ? 'mobile' : 'desktop';

  for (const item of previews) {
    const response = await page.goto(`/showcase/${item.slug}/`);
    await expect(page.getByLabel('Example screen')).toBeVisible();
    await expect(page.getByText(item.brand, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(item.initials, { exact: true }).first()).toBeVisible();
    if (item.screen) {
      const screen = page.getByLabel('Example screen');
      await expect(screen.locator('option').filter({ hasText: item.screen })).toHaveCount(1);
      await screen.selectOption({ label: item.screen });
      const preview = page.locator('.tess-screen');
      await expect(preview).toContainText(item.screen);
      await expect(preview).not.toContainText(/bank statements|reconcile statements/i);
    }
    const screenshot = `${item.slug}-${viewportLabel}.png`;
    await page.screenshot({
      path: path.resolve(process.cwd(), 'quality/evidence/composition-quality/after', screenshot),
      fullPage: true,
    });
    routes.push({
      url: page.url(),
      viewport: page.viewportSize(),
      httpStatus: response?.status() ?? null,
      brand: item.brand,
      initials: item.initials,
      screenshot,
    });
  }

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/composition-quality/after');
  fs.writeFileSync(
    path.join(evidenceDir, `showcase-runtime-${viewportLabel}.json`),
    JSON.stringify({ routes, consoleErrors, uncaught, failedRequests, httpErrors }, null, 2)
  );
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});

test('review representative marketplace and community compositions in the real browser', async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    'This visual review captures direction previews at the desktop reference size.'
  );
  test.setTimeout(90000);

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/composition-quality/after');
  fs.mkdirSync(evidenceDir, { recursive: true });

  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
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

  const reviewed: Array<Record<string, unknown>> = [];
  for (const item of cases) {
    await page.goto('/compose');
    await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
      timeout: 15000,
    });
    await page.locator('textarea#description').fill(item.brief);
    const submit = page.locator('[data-testid="compose-submit-btn"]');
    await expect(submit).toBeEnabled();
    await submit.click();

    const directions: Array<Record<string, unknown>> = [];
    for (const number of ['01', '02', '03']) {
      const card = page.locator(`[data-testid="direction-card-${number}"]`);
      await expect(card).toBeVisible();
      const preview = card.locator(`[data-testid="direction-preview-${number}"]`);
      await expect(preview.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
      await expect(
        preview.locator('[data-testid="unresolved-required-role-diagnostic"]')
      ).toHaveCount(0);
      await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();

      const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
      await expect(dialog).toBeVisible();
      const screenSelect = dialog.getByLabel('Direction preview screen');
      await screenSelect.selectOption({ label: item.screen });
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas.locator('[data-semantic-role]')).not.toHaveCount(0);
      await expect(canvas.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
      await expect(
        canvas.locator('[data-testid="unresolved-required-role-diagnostic"]')
      ).toHaveCount(0);
      const screenshot = `composition-${item.id.toLowerCase()}-direction-${number}.png`;
      await dialog.screenshot({ path: path.join(evidenceDir, screenshot) });
      const scrollState = await dialog.evaluate((element) => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflows: element.scrollHeight > element.clientHeight,
      }));
      let continuationScreenshot: string | undefined;
      if (scrollState.overflows) {
        await dialog.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        const reachedEnd = await dialog.evaluate(
          (element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 2
        );
        expect(
          reachedEnd,
          `${item.id} Direction ${number} preview content must remain scroll-reachable`
        ).toBe(true);
        continuationScreenshot = `composition-${item.id.toLowerCase()}-direction-${number}-continued.png`;
        await dialog.screenshot({ path: path.join(evidenceDir, continuationScreenshot) });
        await dialog.evaluate((element) => {
          element.scrollTop = 0;
        });
      }
      const visibleCopy = await canvas.innerText();

      const details = dialog
        .locator('details')
        .filter({ hasText: 'Design DNA and resource references' });
      await details.locator('summary').click();
      const manifest = JSON.parse(await details.locator('pre').innerText()) as {
        diagnostics: unknown[];
        screens: Array<{ name: string; rootNode: AuditNode }>;
      };
      const selectedScreen = manifest.screens.find((screen) => screen.name === item.screen);
      expect(
        selectedScreen,
        `${item.id} Direction ${number} should include ${item.screen}`
      ).toBeTruthy();
      const nodes = selectedScreen ? collectNodes(selectedScreen.rootNode) : [];
      const messageComposers = nodes.filter((node) => node.semanticRole === 'message-composer');
      const channelsRails = nodes.filter((node) => node.semanticRole === 'channels-rail');
      const resourceSlugs = nodes.flatMap((node) =>
        node.resourceRef?.slug ? [node.resourceRef.slug] : []
      );

      if (item.id === 'MKT-01' && item.screen === 'Messages & Inquiries') {
        expect(
          messageComposers.length,
          'the messaging screen should include its message input'
        ).toBeGreaterThan(0);
        expect(messageComposers.every((node) => node.resourceRef?.slug === 'input')).toBe(true);
        expect(messageComposers.every((node) => node.props.label === 'Write a message')).toBe(true);
        expect(
          channelsRails.every((node) => node.resourceRef?.slug === 'collapsible-sidebar')
        ).toBe(true);
        if (channelsRails.length) {
          expect(nodes.filter((node) => node.semanticRole === 'navigation')).toHaveLength(0);
        }
        await expect(canvas.getByLabel('Write a message')).toBeVisible();
        expect(visibleCopy.toLocaleLowerCase()).toContain('project inquiry');
        expect(visibleCopy.toLocaleLowerCase()).toContain('proposal reply');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('complete booking');
      }

      if (item.id === 'CON-04' && item.screen === 'Activity Stream') {
        expect(visibleCopy.toLocaleLowerCase()).toContain('community');
        expect(visibleCopy.toLocaleLowerCase()).toContain('latest community updates');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('snap photo');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('algorithmic social stream');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('example profile summary');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('mark all as read');
        expect(visibleCopy.toLocaleLowerCase()).not.toContain('step 1');
        expect(visibleCopy).not.toContain(' → ');
        const metricNodes = nodes.filter((node) => node.resourceRef?.slug === 'dashboard-kpi-grid');
        expect(metricNodes).toHaveLength(0);
        expect(nodes.find((node) => node.semanticRole === 'activity-feed')?.resourceRef?.slug).toBe(
          'timeline'
        );
        if (number === '03') {
          const contentGrid = canvas.locator('[data-semantic-role="workspace-multi-pane"]');
          const feed = canvas.locator('[data-semantic-role="activity-feed"]');
          const [gridBox, feedBox] = await Promise.all([
            contentGrid.boundingBox(),
            feed.boundingBox(),
          ]);
          expect(gridBox).not.toBeNull();
          expect(feedBox).not.toBeNull();
          expect(feedBox!.width).toBeGreaterThanOrEqual(gridBox!.width * 0.95);
        }
      }

      directions.push({
        id: number,
        screen: item.screen,
        roles: nodes.map((node) => node.semanticRole),
        resourceSlugs,
        diagnostics: manifest.diagnostics,
        screenshot,
        scrollState,
        continuationScreenshot,
      });
      await dialog.getByRole('button', { name: 'Close dialog' }).click();
    }
    reviewed.push({ id: item.id, brief: item.brief, directions });
  }

  const runtime = {
    url: page.url(),
    viewport: page.viewportSize(),
    cases: reviewed,
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(path.join(evidenceDir, 'runtime.json'), `${JSON.stringify(runtime, null, 2)}\n`);

  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('SaaS overview activity uses a truthful chronological feed with human-readable examples', async ({
  page,
  isMobile,
}) => {
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  test.setTimeout(120000);
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
  await page
    .locator('textarea#description')
    .fill(
      'A cloud workspace helps a 120-person design consultancy plan client projects, assign ownership, review milestones, and control access by team role.'
    );
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
    const details = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText()) as {
      diagnostics: unknown[];
      screens: Array<{ id: string; name: string; rootNode: AuditNode }>;
    };
    const dashboard = manifest.screens.find((screen) => screen.name === 'Overview Dashboard');
    expect(dashboard, `Direction ${number} must include the SaaS overview`).toBeDefined();
    const activity = dashboard
      ? collectNodes(dashboard.rootNode).find((node) => node.semanticRole === 'activity-feed')
      : undefined;
    expect(activity?.resourceRef?.slug).toBe('timeline');
    expect(activity?.props.title).toBe('Recent activity');
    const events = activity?.props.events as
      Array<{ time: string; title: string; desc: string }> | undefined;
    expect(events?.length).toBeGreaterThan(0);
    expect(events?.every((event) => event.time.trim() && !/^example$/i.test(event.time))).toBe(
      true
    );
    const eventCopy = JSON.stringify(events);
    expect(eventCopy).not.toMatch(/\bStep\s+\d+\b/i);
    expect(eventCopy).not.toMatch(/\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/i);

    await details.locator('summary').click();
    const screenSelect = dialog.getByLabel('Direction preview screen');
    await screenSelect.selectOption(dashboard!.id);
    const canvas = dialog.locator('.tess-screen');
    const workspaceBrand = canvas.getByText('Team Workspace', { exact: true });
    await workspaceBrand.scrollIntoViewIfNeeded();
    await expect(workspaceBrand).toBeInViewport();
    if (number === '01') {
      const screenshotPath = path.resolve(
        process.cwd(),
        'quality/evidence/step-14/manual-review/after',
        `aud-122-workspace-brand-fixed-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, animations: 'disabled' });
    }
    await expect(canvas).toContainText('Recent activity');
    await expect(canvas).not.toContainText(/Workspace\s+Workspace/i);
    await expect(workspaceBrand).toBeVisible();
    await expect(canvas.getByText('TW', { exact: true })).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: 'Overview Dashboard', exact: true })
    ).toHaveCount(1);
    await expect(canvas.getByRole('heading', { name: 'Key metrics', exact: true })).toBeVisible();
    if (number === '01') {
      const screenshotPath = path.resolve(
        process.cwd(),
        'quality/evidence/step-14/manual-review/after',
        `aud-123-kpi-heading-fixed-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, animations: 'disabled' });
    }
    await expect(canvas).not.toContainText('Mark all as read');
    await expect(canvas).not.toContainText('Step 1');
    await expect(canvas.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
    await expect(canvas.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
      0
    );
    const activityVisual = canvas.locator('[data-semantic-role="activity-feed"]');
    await dialog.evaluate((element) => {
      element.scrollTop = 0;
    });
    const topScreenshot = isMobile
      ? `activity-feed-sas-01-direction-${number}-${viewportLabel}-top.png`
      : undefined;
    if (topScreenshot) {
      await page.screenshot({
        path: path.resolve(
          process.cwd(),
          'quality/evidence/step-14/manual-review/after',
          topScreenshot
        ),
        animations: 'disabled',
      });
    }
    await activityVisual.scrollIntoViewIfNeeded();
    await expect(activityVisual).toBeInViewport();
    const visibleTimes = (await activityVisual.locator('span').allTextContents())
      .map((value) => value.trim())
      .filter(Boolean);
    expect(visibleTimes.length).toBeGreaterThan(0);
    expect(visibleTimes).not.toContain('Example');
    if (number === '01') {
      const timestampScreenshot = path.resolve(
        process.cwd(),
        'quality/evidence/step-14/manual-review/after',
        `aud-124-activity-timestamp-fixed-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(timestampScreenshot), { recursive: true });
      await page.screenshot({ path: timestampScreenshot, animations: 'disabled' });
    }

    const screenshot = `activity-feed-sas-01-direction-${number}-${viewportLabel}.png`;
    const screenshotPath = path.resolve(
      process.cwd(),
      'quality/evidence/step-14/manual-review/after',
      screenshot
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, animations: 'disabled' });
    const dialogTitle = dialog.getByRole('heading', {
      name: new RegExp(`Direction ${number}`),
    });
    await dialogTitle.scrollIntoViewIfNeeded();
    await expect(dialogTitle).toBeInViewport();
    reviewed.push({
      direction: number,
      screen: dashboard!.name,
      activityResource: activity!.resourceRef?.slug,
      activityTitle: activity!.props.title,
      events,
      workspaceBrand: await workspaceBrand.innerText(),
      avatarInitials: await canvas.getByText('TW', { exact: true }).innerText(),
      metricSectionHeading: await canvas
        .getByRole('heading', { name: 'Key metrics', exact: true })
        .innerText(),
      screenshot,
      topScreenshot,
    });
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  const runtimeReportPath = path.resolve(
    process.cwd(),
    'quality/evidence/step-14/manual-review/after',
    `activity-feed-runtime-${viewportLabel}.json`
  );
  fs.writeFileSync(
    runtimeReportPath,
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        status: 'passed',
        reviewed,
        consoleErrors,
        uncaught,
        failedRequests,
        httpErrors,
      },
      null,
      2
    )}\n`
  );
  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('brokerage terminal brief composes market workflows instead of banking screens', async ({
  page,
  isMobile,
}) => {
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  test.setTimeout(120000);
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
  await page
    .locator('textarea#description')
    .fill(
      'A brokerage terminal displays securities, market data, order-book depth, and verified trade execution for professional equity dealers.'
    );
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
    const details = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText()) as {
      diagnostics: unknown[];
      screens: Array<{ id: string; name: string; rootNode: AuditNode }>;
    };
    const screenNames = manifest.screens.map((screen) => screen.name);
    expect(screenNames).toEqual(
      expect.arrayContaining(['Market Overview', 'Order Book', 'Positions & Risk'])
    );
    expect(manifest.diagnostics).toEqual([]);
    expect(JSON.stringify(manifest.screens).toLocaleLowerCase()).not.toMatch(
      /bank statements|reconcile statements|household budget/
    );

    const marketOverview = manifest.screens.find((screen) => screen.name === 'Market Overview');
    expect(marketOverview).toBeDefined();
    const metrics = marketOverview
      ? collectNodes(marketOverview.rootNode).find(
          (node) => node.resourceRef?.slug === 'dashboard-kpi-grid'
        )
      : undefined;
    const metricCards = metrics?.props.cards as Array<{ val: string; status: string }> | undefined;
    expect(metricCards?.length).toBeGreaterThan(0);
    expect(
      metricCards?.every((card) => card.val === '—' && card.status === 'Market data not connected')
    ).toBe(true);
    const activity = marketOverview
      ? collectNodes(marketOverview.rootNode).find((node) => node.semanticRole === 'activity-feed')
      : undefined;
    expect(activity?.resourceRef?.slug).toBe('timeline');
    expect(activity?.props.title).toBe('Recent activity');
    const events = activity?.props.events as
      Array<{ time: string; title: string; desc: string }> | undefined;
    expect(events?.length).toBeGreaterThan(0);
    expect(events?.every((event) => event.time.trim() && !/^example$/i.test(event.time))).toBe(
      true
    );
    expect(JSON.stringify(events)).not.toMatch(/\bStep\s+\d+\b|\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/i);

    await details.locator('summary').click();
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const canvas = dialog.locator('.tess-screen');
    await screenSelect.selectOption(marketOverview!.id);
    await expect(canvas).toContainText('Market Overview');
    await expect(canvas).not.toContainText(/bank statements|reconcile statements/i);
    for (const screenName of ['Order Book', 'Positions & Risk']) {
      const screen = manifest.screens.find((candidate) => candidate.name === screenName);
      expect(screen, `${screenName} should exist in Direction ${number}`).toBeDefined();
      await screenSelect.selectOption(screen!.id);
      await expect(canvas).toContainText(screenName);
    }
    await screenSelect.selectOption(marketOverview!.id);
    await expect(canvas).toContainText('Recent activity');
    const unavailableBadges = canvas.getByText('Market data not connected', { exact: true });
    await expect(unavailableBadges).toHaveCount(metricCards!.length);
    for (let index = 0; index < metricCards!.length; index += 1) {
      await expect(unavailableBadges.nth(index)).toHaveClass(/bg-neutral-/);
      await expect(unavailableBadges.nth(index)).not.toHaveClass(/bg-emerald-/);
    }
    const metricGrid = unavailableBadges.first().locator('xpath=../..');
    const gridColumnCount = await metricGrid.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length
    );
    expect(gridColumnCount).toBe(isMobile ? 1 : 3);
    const screenshot = `fintech-trading-fin-05-direction-${number}-${viewportLabel}.png`;
    const screenshotPath = path.resolve(
      process.cwd(),
      'quality/evidence/step-14/manual-review/after',
      screenshot
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await dialog.evaluate((root) => {
      const scrollables = [root, ...root.querySelectorAll('*')].filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 1
      );
      for (const element of scrollables) element.scrollTop = 0;
    });
    await page.screenshot({ path: screenshotPath, animations: 'disabled' });
    const screenshots = [screenshot];
    if (isMobile) {
      const bottomScreenshot = `fintech-trading-fin-05-direction-${number}-mobile-bottom.png`;
      const bottomScreenshotPath = path.resolve(
        process.cwd(),
        'quality/evidence/step-14/manual-review/after',
        bottomScreenshot
      );
      await dialog.evaluate((root) => {
        const scrollables = [root, ...root.querySelectorAll('*')].filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 1
        );
        for (const element of scrollables) element.scrollTop = element.scrollHeight;
      });
      await page.screenshot({ path: bottomScreenshotPath, animations: 'disabled' });
      screenshots.push(bottomScreenshot);
    }
    reviewed.push({
      direction: number,
      screenNames,
      activityResource: activity?.resourceRef?.slug,
      activityTitle: activity?.props.title,
      metricCards,
      metricGridColumns: gridColumnCount,
      events,
      screenshots,
    });
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  const runtimeReportPath = path.resolve(
    process.cwd(),
    'quality/evidence/step-14/manual-review/after',
    `fintech-trading-runtime-${viewportLabel}.json`
  );
  fs.writeFileSync(
    runtimeReportPath,
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        status: 'passed',
        reviewed,
        consoleErrors,
        uncaught,
        failedRequests,
        httpErrors,
      },
      null,
      2
    )}\n`
  );
  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('product catalog offers a clear path to the generated product detail screen', async ({
  page,
  isMobile,
}) => {
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  test.setTimeout(90000);
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
  await page
    .locator('textarea#description')
    .fill(
      'A direct-to-consumer clothing store helps shoppers browse a seasonal catalog, compare garment details, choose a size, and complete checkout.'
    );
  const submit = page.locator('[data-testid="compose-submit-btn"]');
  await expect(submit).toBeEnabled();
  await submit.click();

  for (const number of ['01', '02', '03']) {
    const card = page.locator(`[data-testid="direction-card-${number}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const details = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText()) as {
      screens: Array<{ id: string; screenNodeId: string; name: string; rootNode: AuditNode }>;
    };
    const catalogScreen = manifest.screens.find((screen) => screen.name === 'Product Catalog');
    const resultTable = (catalogScreen ? collectNodes(catalogScreen.rootNode) : []).find(
      (node) => node.semanticRole === 'results-grid'
    );
    const rows = resultTable?.props.rows as Array<{ name: string; href?: string }> | undefined;
    expect(
      rows?.length,
      `Direction ${number} should provide product-specific paths to product details`
    ).toBe(3);
    expect(rows?.every((row) => row.href?.startsWith('#'))).toBe(true);
    const targetId = rows?.[0]?.href?.slice(1) ?? '';
    const targetScreen = manifest.screens.find(
      (screen) => screen.id === targetId || screen.screenNodeId === targetId
    );
    expect(targetScreen?.name).toBe('Product Detail');
    expect(
      (catalogScreen ? collectNodes(catalogScreen.rootNode) : []).some(
        (node) => node.resourceRef?.slug === 'cta-minimal'
      )
    ).toBe(false);

    const screenSelect = dialog.getByLabel('Direction preview screen');
    await details.locator('summary').click();
    const productDetailLinks = dialog.getByRole('link', { name: /Example garment A/ });
    await expect(productDetailLinks).toHaveCount(1);
    if (number === '01') {
      const screenshotPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-01-direction-01-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
    }
    await productDetailLinks.click();
    await expect(screenSelect).toHaveValue(targetScreen?.id ?? '');
    await expect(dialog.locator('.tess-screen')).toContainText('Product Detail');
    if (number === '01') {
      const screenshotPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-01-product-detail-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
      const runtimeReportPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-cta-runtime-${viewportLabel}.json`
      );
      fs.writeFileSync(
        runtimeReportPath,
        `${JSON.stringify(
          {
            url: page.url(),
            viewport: page.viewportSize(),
            status: 'passed',
            direction: number,
            selectedScreen: await screenSelect.inputValue(),
            visibleDestination: 'Product Detail',
            consoleErrors,
            uncaught,
            failedRequests,
            httpErrors,
          },
          null,
          2
        )}\n`
      );
    }
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('returns portal brief composes order lookup, return request, and refund status', async ({
  page,
  isMobile,
}) => {
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  test.setTimeout(90000);
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
  await page
    .locator('textarea#description')
    .fill(
      'An online returns portal lets customers find a previous purchase, choose eligible items, and follow the return approval and refund steps.'
    );
  const submit = page.locator('[data-testid="compose-submit-btn"]');
  await expect(submit).toBeEnabled();
  await submit.click();

  for (const number of ['01', '02', '03']) {
    const card = page.locator(`[data-testid="direction-card-${number}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const details = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText()) as {
      diagnostics: unknown[];
      screens: Array<{ id: string; screenNodeId: string; name: string; rootNode: AuditNode }>;
    };
    const screenNames = manifest.screens.map((screen) => screen.name);
    expect(screenNames).toEqual(
      expect.arrayContaining(['Order Lookup', 'Return Request', 'Refund Status'])
    );
    expect(screenNames).not.toEqual(
      expect.arrayContaining(['Storefront Catalog', 'Product Detail', 'Checkout'])
    );
    expect(manifest.diagnostics).toEqual([]);

    const orderLookup = manifest.screens.find((screen) => screen.name === 'Order Lookup');
    const returnRequest = manifest.screens.find((screen) => screen.name === 'Return Request');
    const refundStatus = manifest.screens.find((screen) => screen.name === 'Refund Status');
    expect(orderLookup).toBeDefined();
    expect(returnRequest).toBeDefined();
    expect(refundStatus).toBeDefined();
    expect(
      returnRequest
        ? collectNodes(returnRequest.rootNode).filter(
            (node) => node.semanticRole === 'settings-nav'
          )
        : []
    ).toHaveLength(0);
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const canvas = dialog.locator('.tess-screen');
    await details.locator('summary').click();
    await screenSelect.selectOption(orderLookup!.id);
    await expect(canvas).toContainText('Order Lookup');
    await expect(canvas).toContainText('Orders and returns');
    await expect(canvas).not.toContainText('Flagship Feature');

    await screenSelect.selectOption(returnRequest!.id);
    await expect(canvas).toContainText('Return Request');
    await expect(canvas.locator('nav')).toHaveCount(1);
    await expect(canvas.getByLabel('Return reason')).toBeVisible();
    const disabledSubmit = canvas.getByRole('button', { name: 'Submit return request' });
    await expect(disabledSubmit).toBeDisabled();
    await expect(disabledSubmit).toHaveAttribute(
      'title',
      'Connect a returns service before submitting requests.'
    );
    const disabledSubmitTitle = await disabledSubmit.getAttribute('title');
    if (number === '03') {
      const screenshotPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-06-return-request-direction-03-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
    }

    await screenSelect.selectOption(refundStatus!.id);
    await expect(canvas).toContainText('Return progress');
    await expect(canvas).toContainText('Return request received');
    await expect(canvas).toContainText('Refund progress updated');
    const selectedScreenId = await screenSelect.inputValue();
    expect(manifest.screens.find((screen) => screen.id === selectedScreenId)?.name).toBe(
      'Refund Status'
    );
    if (number === '03') {
      const screenshotPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-06-direction-03-${viewportLabel}.png`
      );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
      const runtimeReportPath = path.resolve(
        process.cwd(),
        `quality/evidence/step-14/manual-review/after/ecom-06-runtime-${viewportLabel}.json`
      );
      fs.writeFileSync(
        runtimeReportPath,
        `${JSON.stringify(
          {
            url: page.url(),
            viewport: page.viewportSize(),
            status: 'passed',
            selectedDirection: number,
            screens: screenNames,
            selectedScreen: selectedScreenId,
            selectedScreenName: manifest.screens.find((screen) => screen.id === selectedScreenId)
              ?.name,
            disabledSubmitTitle,
            verifiedVisibleStates: [
              'Order Lookup',
              'Return Request (truthfully disabled)',
              'Refund Status timeline',
            ],
            consoleErrors,
            uncaught,
            failedRequests,
            httpErrors,
          },
          null,
          2
        )}\n`
      );
    }
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
  }

  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

test('real-estate and travel directions use truthful, domain-fit content', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(120000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-14/manual-review/after');
  fs.mkdirSync(evidenceDir, { recursive: true });

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

  const domainCases = [
    {
      id: 'MKT-01-SEARCH',
      brief:
        'A freelance services marketplace connects independent designers with clients, supports profile discovery, project proposals, messaging, and mutual reviews.',
      screen: 'Explore Listings',
    },
    {
      id: 'REA-01',
      brief:
        'A home-search service helps buyers compare neighborhoods, filter available properties, save favorites, and arrange a viewing with an agent.',
      screen: 'Property Search',
    },
    {
      id: 'TRV-01',
      brief:
        'A trip-planning service helps travelers compare destinations, save places, coordinate dates, and keep a shared itinerary.',
      screen: 'Destination Search',
    },
  ];
  const reviewed: Array<Record<string, unknown>> = [];

  for (const item of domainCases) {
    await page.goto('/compose');
    await expect(page.locator('[data-testid="catalog-status"]')).toContainText('Catalogue ready', {
      timeout: 15000,
    });
    await page.locator('textarea#description').fill(item.brief);
    const submit = page.locator('[data-testid="compose-submit-btn"]');
    await expect(submit).toBeEnabled();
    await submit.click();

    for (const number of ['01', '02', '03']) {
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
      const screenSelect = dialog.getByLabel('Direction preview screen');
      await screenSelect.selectOption({ label: item.screen });
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas.locator('[data-semantic-role]')).not.toHaveCount(0);
      const visibleCopy = await canvas.innerText();
      const screenshot = `${item.id.toLowerCase()}-direction-${number}-${viewportLabel}.png`;
      await dialog.screenshot({ path: path.join(evidenceDir, screenshot) });

      const details = dialog
        .locator('details')
        .filter({ hasText: 'Design DNA and resource references' });
      await details.locator('summary').click();
      const manifest = JSON.parse(await details.locator('pre').innerText()) as {
        diagnostics: unknown[];
        screens: Array<{ name: string; rootNode: AuditNode }>;
      };
      expect(manifest.diagnostics).toEqual([]);
      const selectedScreen = manifest.screens.find((screen) => screen.name === item.screen);
      expect(selectedScreen).toBeDefined();
      const nodes = selectedScreen ? collectNodes(selectedScreen.rootNode) : [];
      const resources = nodes.flatMap((node) => (node.resourceRef ? [node.resourceRef.slug] : []));

      if (item.id === 'MKT-01-SEARCH') {
        const searchInput = nodes.find((node) => node.semanticRole === 'search-header');
        const results = nodes.find((node) => node.semanticRole === 'results-grid');
        expect(searchInput?.props.label).toBe('Search listings');
        expect(results?.resourceRef?.slug).toBe('advanced-data-table');
        expect(results?.props.title).toBe('Available listings');
        expect(visibleCopy).toContain('Search listings');
        expect(visibleCopy).toContain('Example listing A');
        expect(visibleCopy).toContain('Availability not connected');
        expect(visibleCopy).not.toContain('Continue onboarding');
        expect(visibleCopy.toLowerCase()).not.toMatch(/proposal|review|0\/100/);
        expect(visibleCopy).not.toContain(
          'Example field. Connect persistence and your backend in the exported application.'
        );
        if (isMobile) {
          const mobileRecords = canvas.locator('[data-testid="advanced-data-table-mobile-record"]');
          await expect(mobileRecords).toHaveCount(3);
          await expect(mobileRecords.first()).toContainText('Example listing A');
          await expect(mobileRecords.first()).toContainText('Availability not connected');
          await expect(canvas.locator('[data-testid="advanced-data-table-scroll"]')).toBeHidden();
          await expect(mobileRecords.first().locator('dd').nth(1)).toHaveClass(
            /text-neutral-(300|600)/
          );
          expect(
            await mobileRecords
              .first()
              .evaluate((element) => element.scrollWidth <= element.clientWidth)
          ).toBe(true);
        } else {
          await expect(
            canvas.getByText('Availability not connected', { exact: true }).first()
          ).toHaveClass(/text-neutral-(300|600)/);
        }
      } else if (item.id === 'REA-01') {
        const searchInput = nodes.find((node) => node.semanticRole === 'search-header');
        const results = nodes.find((node) => node.semanticRole === 'results-grid');
        expect(searchInput?.props.label).toBe('Search property listings');
        expect(results?.resourceRef?.slug).toBe('advanced-data-table');
        expect(results?.props.title).toBe('Available property listings');
        expect(visibleCopy).toContain('Search property listings');
        expect(visibleCopy).toContain('Example property A');
        expect(visibleCopy).toContain('Price not connected');
        expect(visibleCopy).not.toContain('Search & Map Explorer');
        expect(visibleCopy.toLowerCase()).not.toMatch(/latency|telemetry|portfolio/);
      } else {
        const searchInput = nodes.find((node) => node.semanticRole === 'search-header');
        const results = nodes.find((node) => node.semanticRole === 'results-grid');
        expect(searchInput?.props.label).toBe('Search destinations');
        expect(results?.resourceRef?.slug).toBe('advanced-data-table');
        expect(results?.props.title).toBe('Search results');
        expect(visibleCopy).toContain('Search destinations');
        expect(visibleCopy).toContain('Example Destination');
        expect(visibleCopy).toContain('A destination being considered or saved for the trip');
        expect(visibleCopy.toLowerCase()).not.toMatch(/latency|telemetry|portfolio|order book/);
      }

      reviewed.push({
        id: item.id,
        direction: number,
        route: page.url(),
        viewport: page.viewportSize(),
        screen: item.screen,
        resources,
        diagnostics: manifest.diagnostics,
        screenshot,
      });
      await dialog.getByRole('button', { name: 'Close dialog' }).click();
    }
  }

  const runtime = {
    route: page.url(),
    viewport: page.viewportSize(),
    reviewed,
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(
    path.join(evidenceDir, `domain-content-runtime-${viewportLabel}.json`),
    `${JSON.stringify(runtime, null, 2)}\n`
  );
  expect(consoleErrors).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});

interface AuditNode {
  semanticRole: string;
  resourceRef?: { slug: string };
  props: Record<string, unknown>;
  children: AuditNode[];
}

function collectNodes(node: AuditNode, output: AuditNode[] = []): AuditNode[] {
  output.push(node);
  for (const child of node.children) collectNodes(child, output);
  return output;
}
