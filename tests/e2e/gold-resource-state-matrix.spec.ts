import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type FrameLocator, type Page } from '@playwright/test';

type ListFixture = {
  slug: string;
  prop: string;
  defaultMarker: string;
  emptyProps: Record<string, unknown>;
  largeProps: Record<string, unknown>;
  largeMarker: string;
  largeCount: number;
  verifyEmpty: (frame: FrameLocator) => Promise<void>;
  verifyLarge: (frame: FrameLocator) => Promise<void>;
};

const listFixtures: ListFixture[] = [
  {
    slug: 'marketing-nav-cta',
    prop: 'links',
    defaultMarker: 'Features',
    emptyProps: { links: [] },
    largeProps: { links: Array.from({ length: 40 }, (_, i) => ({ label: `Section ${i + 1}` })) },
    largeMarker: 'Section 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Features', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Section 40', { exact: true })).toBeVisible();
      await expect(frame.locator('header span.opacity-70')).toHaveCount(40);
    },
  },
  {
    slug: 'testimonial-grid',
    prop: 'testimonials',
    defaultMarker: 'Example Customer A',
    emptyProps: { testimonials: [] },
    largeProps: {
      testimonials: Array.from({ length: 40 }, (_, i) => ({
        quote: `Reviewed sample ${i + 1}`,
        author: `Customer ${i + 1}`,
        role: 'Product lead',
        company: `Organisation ${i + 1}`,
      })),
    },
    largeMarker: 'Customer 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Example Customer A', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Customer 40', { exact: true })).toBeVisible();
      await expect(frame.locator('section .grid > div')).toHaveCount(40);
    },
  },
  {
    slug: 'split-product-hero',
    prop: 'panels',
    defaultMarker: 'Tokens',
    emptyProps: { panels: [] },
    largeProps: {
      panels: Array.from({ length: 24 }, (_, i) => ({
        id: `panel-${i + 1}`,
        label: `Choice ${i + 1}`,
        text: `Employee workflow preview ${i + 1}`,
      })),
    },
    largeMarker: 'Choice 24',
    largeCount: 24,
    verifyEmpty: async (frame) =>
      expect(frame.getByRole('button', { name: 'Tokens', exact: true })).toHaveCount(0),
    verifyLarge: async (frame) =>
      expect(frame.getByRole('button', { name: 'Choice 24', exact: true })).toBeVisible(),
  },
  {
    slug: 'feature-matrix',
    prop: 'items',
    defaultMarker: 'Verified Zod Schemas',
    emptyProps: { items: [] },
    largeProps: {
      items: Array.from({ length: 30 }, (_, i) => ({
        title: `Capability ${i + 1}`,
        description: 'Reviewed',
        detail: 'Available',
      })),
    },
    largeMarker: 'Capability 30',
    largeCount: 30,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Verified Zod Schemas', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Capability 30', { exact: true })).toBeVisible();
      await expect(frame.locator('tbody tr')).toHaveCount(30);
    },
  },
  {
    slug: 'logo-cloud-minimal',
    prop: 'logos',
    defaultMarker: 'Example customer',
    emptyProps: { logos: [] },
    largeProps: { logos: Array.from({ length: 40 }, (_, i) => `Partner ${i + 1}`) },
    largeMarker: 'Partner 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Example customer', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Partner 40', { exact: true })).toBeVisible();
      await expect(frame.locator('section span.font-mono')).toHaveCount(40);
    },
  },
  {
    slug: 'footer-product',
    prop: 'links',
    defaultMarker: 'Compose',
    emptyProps: { links: [] },
    largeProps: {
      links: Array.from({ length: 40 }, (_, i) => ({ label: `Resource ${i + 1}`, href: '/docs' })),
    },
    largeMarker: 'Resource 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByRole('link', { name: 'Compose', exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByRole('link', { name: 'Resource 40', exact: true })).toBeVisible();
      await expect(frame.locator('footer li')).toHaveCount(40);
    },
  },
  {
    slug: 'collapsible-sidebar',
    prop: 'links',
    defaultMarker: 'Overview',
    emptyProps: { links: [] },
    largeProps: { links: Array.from({ length: 40 }, (_, i) => ({ label: `Screen ${i + 1}` })) },
    largeMarker: 'Screen 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Overview', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Screen 40', { exact: true })).toBeVisible();
      await expect(frame.getByRole('navigation', { name: 'Workspace screens' })).toContainText(
        'Screen 40'
      );
    },
  },
  {
    slug: 'minimal-top-nav',
    prop: 'links',
    defaultMarker: 'Overview',
    emptyProps: { links: [] },
    largeProps: { links: Array.from({ length: 40 }, (_, i) => ({ label: `Screen ${i + 1}` })) },
    largeMarker: 'Screen 40',
    largeCount: 40,
    verifyEmpty: async (frame) =>
      expect(frame.getByText('Overview', { exact: true })).toHaveCount(0),
    verifyLarge: async (frame) => {
      await expect(frame.getByText('Screen 40', { exact: true })).toBeVisible();
      await expect(frame.getByRole('navigation', { name: 'Product screens' })).toContainText(
        'Screen 40'
      );
    },
  },
];

async function updatePreviewProps(
  iframe: import('@playwright/test').Locator,
  props: Record<string, unknown>
) {
  await iframe.evaluate((element, nextProps) => {
    (element as HTMLIFrameElement).contentWindow?.postMessage(
      { type: 'TESSELLATE_PREVIEW_UPDATE', props: nextProps },
      '*'
    );
  }, props);
}

async function assertNoOverflow(frame: FrameLocator) {
  const dimensions = await frame
    .locator('html')
    .evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
}

async function recordCapture(
  page: Page,
  slug: string,
  state: 'before' | 'empty' | 'large' | 'three-items'
) {
  const dir = path.resolve(
    process.cwd(),
    `audit/evidence/step-06/${state === 'before' ? 'before' : 'after'}/gold-state-matrix`
  );
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}-${state}-390.png`);
  if (state !== 'before' || !existsSync(file))
    await page.screenshot({ path: file, animations: 'disabled' });
  return path.relative(process.cwd(), file).replaceAll('\\', '/');
}

for (const fixture of listFixtures) {
  test(`Gold ${fixture.slug} handles empty and large ${fixture.prop} states`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'sites-chromium',
      'Run against the isolated Sites Worker preview.'
    );
    test.setTimeout(30000);
    await page.setViewportSize({ width: 390, height: 844 });
    const diagnostics = {
      consoleErrors: [] as string[],
      pageErrors: [] as string[],
      failedRequests: [] as string[],
      httpErrors: [] as string[],
    };
    page.on('console', (message) => {
      if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) =>
      diagnostics.failedRequests.push(
        `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`
      )
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        diagnostics.httpErrors.push(`${response.status()} ${response.url()}`);
    });

    const response = await page.goto(`/resources/${fixture.slug}/`, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.ok()).toBe(true);
    const iframe = page.locator('iframe[title$=" live preview"]');
    const frame = page.frameLocator('iframe[title$=" live preview"]');
    await expect(frame.locator('.tess-screen')).toHaveCount(1);
    await expect(frame.getByText(fixture.defaultMarker, { exact: true })).toBeVisible();
    const screenshots = [await recordCapture(page, fixture.slug, 'before')];

    await updatePreviewProps(iframe, fixture.emptyProps);
    await fixture.verifyEmpty(frame);
    await assertNoOverflow(frame);
    screenshots.push(await recordCapture(page, fixture.slug, 'empty'));

    await updatePreviewProps(iframe, fixture.largeProps);
    await fixture.verifyLarge(frame);
    await assertNoOverflow(frame);
    screenshots.push(await recordCapture(page, fixture.slug, 'large'));

    expect(diagnostics, `${fixture.slug} browser diagnostics`).toEqual({
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      httpErrors: [],
    });
    const resultDir = path.resolve(
      process.cwd(),
      'audit/evidence/step-06/results/gold-state-matrix'
    );
    mkdirSync(resultDir, { recursive: true });
    writeFileSync(
      path.join(resultDir, `${fixture.slug}.json`),
      JSON.stringify(
        {
          schemaVersion: '1.0.0',
          slug: fixture.slug,
          stateProp: fixture.prop,
          viewport: '390x844',
          empty: 'PASS',
          largeCount: fixture.largeCount,
          large: 'PASS',
          overflow: 'PASS',
          diagnostics,
          screenshots,
        },
        null,
        2
      )
    );
  });
}

test('Gold form controls honor disabled state and state patterns remain announced', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'Run against the isolated Sites Worker preview.'
  );
  test.setTimeout(30000);
  await page.setViewportSize({ width: 390, height: 844 });
  const checked: string[] = [];

  for (const [slug, selector] of [
    ['button', 'button:visible'],
    ['input', 'input:visible'],
    ['select', 'select:visible'],
  ]) {
    const response = await page.goto(`/resources/${slug}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBe(true);
    const iframe = page.locator('iframe[title$=" live preview"]');
    const frame = page.frameLocator('iframe[title$=" live preview"]');
    await expect(frame.locator('.tess-screen')).toHaveCount(1);
    await updatePreviewProps(iframe, { disabled: true });
    const control = frame.locator(selector).first();
    await expect(control).toBeDisabled();
    checked.push(slug);
  }

  const skeletonResponse = await page.goto('/resources/dashboard-skeleton/', {
    waitUntil: 'domcontentloaded',
  });
  expect(skeletonResponse?.ok()).toBe(true);
  await expect(
    page
      .frameLocator('iframe[title$=" live preview"]')
      .getByRole('status', { name: 'Loading dashboard metrics' })
  ).toBeVisible();
  checked.push('dashboard-skeleton-loading');

  const errorResponse = await page.goto('/resources/error-state/', {
    waitUntil: 'domcontentloaded',
  });
  expect(errorResponse?.ok()).toBe(true);
  await expect(
    page.frameLocator('iframe[title$=" live preview"]').getByRole('alert')
  ).toBeVisible();
  checked.push('error-state-alert');

  const resultDir = path.resolve(process.cwd(), 'audit/evidence/step-06/results/gold-state-matrix');
  mkdirSync(resultDir, { recursive: true });
  writeFileSync(
    path.join(resultDir, 'control-and-status-states.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        viewport: '390x844',
        disabledControls: checked.slice(0, 3),
        loadingState: checked[3],
        errorState: checked[4],
        status: 'PASS',
      },
      null,
      2
    )
  );
});

test('Gold fixed-slot resource renders partial input without unresolved values', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'Run against the isolated Sites Worker preview.'
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const diagnostics = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400)
      diagnostics.httpErrors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto('/resources/feature-bento/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBe(true);
  const iframe = page.locator('iframe[title$=" live preview"]');
  const frame = page.frameLocator('iframe[title$=" live preview"]');
  await expect(frame.getByText('A coherent vocabulary', { exact: true })).toBeVisible();
  await recordCapture(page, 'feature-bento', 'before');
  await updatePreviewProps(iframe, { items: [] });
  const body = await frame.locator('body').innerText();
  expect(body).not.toMatch(/\b(undefined|null)\b/);
  await expect(frame.getByText('A coherent vocabulary', { exact: true })).toHaveCount(0);
  await assertNoOverflow(frame);
  await recordCapture(page, 'feature-bento', 'empty');
  await updatePreviewProps(iframe, {
    items: [
      { title: 'Find a purchase', description: 'Review a previous order.', detail: 'Order lookup' },
      {
        title: 'Choose eligible items',
        description: 'Select items to return.',
        detail: 'Return request',
      },
      {
        title: 'Follow refund progress',
        description: 'Review approval and refund status.',
        detail: 'Refund status',
      },
    ],
  });
  await expect(frame.locator('h3')).toHaveCount(3);
  expect(
    await frame
      .locator('h3')
      .evaluateAll((headings) => headings.every((heading) => heading.textContent?.trim()))
  ).toBe(true);
  await expect(frame.locator('section .grid > div')).toHaveCount(3);
  await expect(frame.getByRole('heading', { name: 'Follow refund progress' })).toBeVisible();
  await assertNoOverflow(frame);
  await iframe.evaluate((element) => {
    const previewFrame = element as HTMLIFrameElement;
    previewFrame.style.height = '1300px';
    previewFrame.style.minHeight = '0';
    const deviceFrame = previewFrame.parentElement;
    if (deviceFrame) deviceFrame.style.height = '1300px';
    const frameContainer = deviceFrame?.parentElement;
    if (frameContainer) {
      frameContainer.style.maxHeight = 'none';
      frameContainer.style.overflow = 'visible';
    }
  });
  const threeItemScreenshots: string[] = [];
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(frame.locator('h3')).toHaveCount(3);
    await assertNoOverflow(frame);
    const threeItemPath = path.resolve(
      process.cwd(),
      `audit/evidence/step-06/after/gold-state-matrix/feature-bento-three-items-${viewport.width}.png`
    );
    mkdirSync(path.dirname(threeItemPath), { recursive: true });
    await page.screenshot({ path: threeItemPath, fullPage: true, animations: 'disabled' });
    threeItemScreenshots.push(path.relative(process.cwd(), threeItemPath).replaceAll('\\', '/'));
  }
  const resultDir = path.resolve(process.cwd(), 'audit/evidence/step-06/results/gold-state-matrix');
  mkdirSync(resultDir, { recursive: true });
  writeFileSync(
    path.join(resultDir, 'feature-bento.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        slug: 'feature-bento',
        stateProp: 'items',
        stateCoverage: 'empty and three-item inputs tested',
        empty: 'PASS',
        partialThreeItemInput: 'PASS',
        noBlankCards: 'PASS',
        noUnresolvedValues: 'PASS',
        overflow: 'PASS',
        viewports: ['390x844', '1440x900'],
        diagnostics,
        screenshots: [
          'audit/evidence/step-06/before/gold-state-matrix/feature-bento-before-390.png',
          'audit/evidence/step-06/after/gold-state-matrix/feature-bento-empty-390.png',
          ...threeItemScreenshots,
        ],
      },
      null,
      2
    )
  );
  expect(diagnostics, 'Feature Bento partial-input browser diagnostics').toEqual({
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  });
});

test('Gold long-text props remain readable without mobile overflow', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'Run against the isolated Sites Worker preview.'
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const longHeadline = `Employee experience, made clear and useful. ${'Every team member can find the next step. '.repeat(18)}`;
  const longSubheadline = `A welcoming workplace for a 500-person technology company. ${'People, teams, onboarding and policies stay connected. '.repeat(16)}`;
  const longTitle = `Employee Directory ${'Across Every Engineering and Product Team '.repeat(12)}`;
  const longSubtitle = `Organisational context, responsibilities and onboarding progress. ${'A clear view for every employee and manager. '.repeat(14)}`;
  const screenshots: string[] = [];

  for (const scenario of [
    {
      slug: 'editorial-hero',
      props: { headline: longHeadline, subheadline: longSubheadline },
      heading: longHeadline,
      body: longSubheadline,
    },
    {
      slug: 'entity-profile-header',
      props: { title: longTitle, subtitle: longSubtitle },
      heading: longTitle,
      body: longSubtitle,
    },
  ]) {
    const response = await page.goto(`/resources/${scenario.slug}/`, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.ok()).toBe(true);
    const iframe = page.locator('iframe[title$=" live preview"]');
    const frame = page.frameLocator('iframe[title$=" live preview"]');
    await expect(frame.locator('.tess-screen')).toHaveCount(1);
    screenshots.push(await recordCapture(page, scenario.slug, 'before'));
    await updatePreviewProps(iframe, scenario.props);
    await expect(frame.getByRole('heading', { name: scenario.heading, exact: true })).toBeVisible();
    await expect(frame.getByText(scenario.body, { exact: true })).toBeVisible();
    await assertNoOverflow(frame);
    const dir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/gold-state-matrix');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${scenario.slug}-long-text-390.png`);
    await page.screenshot({ path: file, animations: 'disabled' });
    screenshots.push(path.relative(process.cwd(), file).replaceAll('\\', '/'));
  }

  const resultDir = path.resolve(process.cwd(), 'audit/evidence/step-06/results/gold-state-matrix');
  mkdirSync(resultDir, { recursive: true });
  writeFileSync(
    path.join(resultDir, 'long-text-mobile.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        viewport: '390x844',
        resources: ['editorial-hero', 'entity-profile-header'],
        longTextVisible: 'PASS',
        documentOverflow: 'PASS',
        screenshots,
      },
      null,
      2
    )
  );
});
