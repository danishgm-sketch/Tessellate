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

test('showcase identity survives composition and renders in the public preview', async ({ page }) => {
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
      brand: 'Account Workspace',
      initials: 'AW',
    },
  ];
  const viewport = page.viewportSize();
  const viewportLabel = viewport && viewport.width < 600 ? 'mobile' : 'desktop';

  for (const item of previews) {
    const response = await page.goto(`/showcase/${item.slug}/`);
    await expect(page.getByLabel('Example screen')).toBeVisible();
    await expect(page.getByText(item.brand, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(item.initials, { exact: true }).first()).toBeVisible();
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
        await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
        const reachedEnd = await dialog.evaluate(
          (element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 2,
        );
        expect(reachedEnd, `${item.id} Direction ${number} preview content must remain scroll-reachable`).toBe(true);
        continuationScreenshot = `composition-${item.id.toLowerCase()}-direction-${number}-continued.png`;
        await dialog.screenshot({ path: path.join(evidenceDir, continuationScreenshot) });
        await dialog.evaluate((element) => { element.scrollTop = 0; });
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
