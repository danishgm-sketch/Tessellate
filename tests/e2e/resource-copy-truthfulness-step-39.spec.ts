import AxeBuilder from '@axe-core/playwright';
import { expect, test, type FrameLocator, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ResourceRuntimeEvidence = {
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
};

function watchRuntime(page: Page): ResourceRuntimeEvidence {
  const runtime: ResourceRuntimeEvidence = {
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return runtime;
}

async function captureAssessmentEvidence(
  page: Page,
  projectName: string,
  status: number | null,
  runtime: ResourceRuntimeEvidence
) {
  const viewport = projectName.includes('mobile') ? 'mobile' : 'desktop';
  const directory = path.resolve(process.cwd(), `quality/evidence/step-39/after/${viewport}`);
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, 'resource-assessment.png');
  page.removeAllListeners('console');
  // Axe injects temporary styles; keep user-session runtime evidence separate from its instrumentation.
  const runtimeBeforeAxe = {
    consoleErrors: [...runtime.consoleErrors],
    consoleWarnings: [...runtime.consoleWarnings],
    uncaughtExceptions: [...runtime.uncaughtExceptions],
    failedRequests: [...runtime.failedRequests],
    httpErrors: [...runtime.httpErrors],
  };
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  const previewRoot = page
    .frameLocator('iframe[title="Success State live preview"]')
    .locator('.tess-screen');
  const previewScreenshot = path.join(directory, 'resource-assessment-preview.png');
  await previewRoot.screenshot({ path: previewScreenshot });
  await page.screenshot({ path: screenshot });
  const preview = await previewRoot.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      text: element.innerText,
      width: rect.width,
      height: rect.height,
      scrollWidth: element.scrollWidth,
      className: element.className,
    };
  });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    status,
    layout,
    assessmentText: await page.locator('main').innerText(),
    preview,
    seriousOrCriticalAxe: axe.violations
      .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      .map(({ id, impact, description }) => ({ id, impact, description })),
    runtime: runtimeBeforeAxe,
    axeInstrumentationConsoleErrors: runtime.consoleErrors.slice(
      runtimeBeforeAxe.consoleErrors.length
    ),
    screenshot,
    previewScreenshot,
  };
  await writeFile(
    path.join(directory, 'resource-assessment.json'),
    `${JSON.stringify(evidence, null, 2)}\n`
  );
  expect(evidence.seriousOrCriticalAxe).toEqual([]);
  expect(layout.horizontalOverflow).toBe(false);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
}

async function openResourcePreview(page: Page, slug: string): Promise<FrameLocator> {
  await page.goto(`/preview/?resource=${encodeURIComponent(slug)}`);
  // The trusted wrapper intentionally exposes resource DOM only inside its opaque sandbox frame.
  await page.waitForLoadState('networkidle');
  const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
  await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
  return preview;
}

test('accessibility, compliance, trust, and security resources distinguish templates from verified claims', async ({
  page,
}) => {
  const routes = [
    {
      slug: 'accessibility-commitment-section',
      forbidden: /automated audit guarantees|compliance guarantee|keyboard guarantees/i,
    },
    {
      slug: 'compliance-proof',
      forbidden: /certified badges and downloadable reports|downloadable audit attestations/i,
    },
    {
      slug: 'trust-badges-strip',
      forbidden: /SOC2 \/ ISO \/ HIPAA certification badge strip|uncompromised data integrity/i,
    },
    {
      slug: 'security-proof',
      forbidden: /comprehensive enterprise security overview|zero-vulnerability guarantees/i,
    },
  ];

  for (const route of routes) {
    await page.goto(`/r/${route.slug}`);
    const detail = await page.locator('main').innerText();
    expect(detail).not.toMatch(route.forbidden);
    const preview = await openResourcePreview(page, route.slug);
    const previewText = await preview.locator('body').innerText();
    if (route.slug === 'accessibility-commitment-section')
      expect(previewText).toContain('Design goal:');
    if (route.slug === 'compliance-proof') expect(previewText).toContain('Illustrative layout.');
    if (route.slug === 'trust-badges-strip') {
      expect(previewText).toContain('Sample labels only');
      expect(previewText).not.toContain('✓');
    }
    if (route.slug === 'security-proof') {
      expect(previewText).toContain('Review prompts only');
      expect(previewText).not.toMatch(/Zero runtime eval|Untrusted previews run/i);
    }
  }
});

test('success state uses truthful defaults, a real action state, and accessible contrast', async ({
  page,
}) => {
  const preview = await openResourcePreview(page, 'success-state');
  const content = await preview.locator('body').innerText();
  expect(content).toContain('Your action finished. Review its output before using it.');
  expect(content).not.toMatch(
    /11 production-ready|zero external lock-in|System Export Completed Successfully/i
  );
  const artifactButton = preview.getByRole('button', { name: 'View Exported Files' });
  await expect(artifactButton).toBeDisabled();
  await expect(artifactButton).toHaveClass(/disabled:bg-neutral-200/);
  await expect(
    preview.getByText(/Connect an artifact viewer to enable this action/i)
  ).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    axe.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    )
  ).toEqual([]);
});

test('document detail displays a static example without promising universal export or a dead action', async ({
  page,
}) => {
  const preview = await openResourcePreview(page, 'document-detail');
  const content = await preview.locator('body').innerText();
  expect(content).not.toMatch(/guarantees full exportability|any modern React environment/i);
  expect(content).toContain('static example');
  await expect(preview.getByRole('button', { name: /Export Spec/ })).toHaveCount(0);
});

test('accordion motion answers describe the actual disclosure and avoid blanket accessibility claims', async ({
  page,
}) => {
  const preview = await openResourcePreview(page, 'accordion-spring');
  const question = preview.getByRole('button', {
    name: /Do the example colors meet WCAG AA automatically/i,
  });
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  const content = await preview.locator('body').innerText();
  expect(content).toContain('This example uses React and CSS transitions.');
  expect(content).toContain('Color pairs depend on the chosen values');
  expect(content).not.toMatch(
    /mathematically verified contrast ratios|preserve 0 paid dependencies|All catalog resources use standard React/i
  );
});

test('editorial and workflow samples describe current output without production guarantees', async ({
  page,
}) => {
  let preview = await openResourcePreview(page, 'editorial-display-stack');
  let content = await preview.locator('body').innerText();
  expect(content).toContain('Use a clear heading, supporting copy, and one emphasized phrase');
  expect(content).not.toMatch(/production-ready interface systems|SYSTEM ARCHITECTURE • V2\.4/i);

  preview = await openResourcePreview(page, 'feature-tabs');
  const agentsTab = preview.getByRole('button', { name: 'For agents' });
  await agentsTab.click();
  await expect(agentsTab).toHaveAttribute('aria-pressed', 'true');
  content = await preview.locator('body').innerText();
  expect(content).toContain('Agents can read project manifests and use MCP tools');
  expect(content).not.toMatch(/verified UIs without guesswork/i);

  preview = await openResourcePreview(page, 'feature-sticky-narrative');
  content = await preview.locator('body').innerText();
  expect(content).toContain('Choose a product brief');
  expect(content).toContain('Refine the selected project');
  expect(content).toContain('Export a standalone project');
  expect(
    await preview
      .getByRole('heading', { name: 'A shared manifest carries the work forward' })
      .count()
  ).toBe(1);

  preview = await openResourcePreview(page, 'how-it-works-steps');
  content = await preview.locator('body').innerText();
  expect(content).toContain('Download a React/Vite project to continue in your own repository');
  expect(content).not.toMatch(
    /Direct code emission to your local repository|zero SaaS runtime tax/i
  );
});

test('interactive preview describes its local controls instead of simulated runtime results', async ({
  page,
}) => {
  const preview = await openResourcePreview(page, 'interactive-demo-hero');
  let content = await preview.locator('body').innerText();
  expect(content).toContain('Change this sample card’s spacing and color theme');
  expect(content).not.toMatch(/200 OK|Zero styling leakage detected|real-time DOM normalisation/i);
  await preview.getByRole('button', { name: 'compact' }).click();
  await preview.getByRole('button', { name: 'light' }).click();
  content = await preview.locator('body').innerText();
  expect(content).toContain('compact spacing');
  expect(content).toContain('dark theme');
});

test('AI command and empty-state patterns expose only the actions that are connected', async ({
  page,
}) => {
  let preview = await openResourcePreview(page, 'ai-command-bar');
  let content = await preview.locator('body').innerText();
  expect(content).toContain(
    'Demo only. Typing filters the sample list; commands are not run here.'
  );
  expect(content).not.toMatch(
    /understands natural-language system instructions|Interpret natural language user requests into concrete platform actions/i
  );
  const filter = preview.getByRole('searchbox', { name: 'Filter sample commands' });
  await filter.fill('export');
  await expect(
    preview.getByText('Export current workspace as standalone Vite project')
  ).toBeVisible();
  await expect(preview.getByText('Switch to Nocturne visual mode')).toHaveCount(0);
  await expect(preview.locator('[data-command-sample]')).toHaveCount(1);
  expect(
    await preview.locator('[data-command-sample]').evaluate((row) => getComputedStyle(row).cursor)
  ).not.toBe('pointer');

  preview = await openResourcePreview(page, 'ai-empty-state');
  content = await preview.locator('body').innerText();
  expect(content).toContain('Connect a prompt handler to enable these starters.');
  const starters = preview.getByRole('button', {
    name: /Compose B2B SaaS Dashboard|Review color contrast|Export Standalone Vite App/,
  });
  await expect(starters).toHaveCount(3);
  for (const starter of await starters.all()) await expect(starter).toBeDisabled();
});

test('palette preset copy limits itself to the selected contrast pairs', async ({ page }) => {
  await page.goto('/tools/palette');
  await page.waitForLoadState('networkidle');
  const monochromePreset = page.getByRole('button', { name: 'Pure Monochrome' });
  await monochromePreset.click();
  await expect(monochromePreset).toHaveAttribute('aria-pressed', 'true');
  const description = page.getByText(
    /Dark neutral text on white with monochrome accents\. Check the listed token pairs; test component states separately\./i
  );
  await expect(description).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selected Pair Contrast Check' })).toBeVisible();
  await expect(page.getByText(/Checks these four token pairs only/i)).toBeVisible();
  await expect(page.getByText(/18:1\+|adhering strictly to WCAG 2\.2 AAA/i)).toHaveCount(0);
  const viewport = page.viewportSize();
  const viewportName = viewport?.width === 390 ? 'mobile' : 'desktop';
  await page.screenshot({
    path: `quality/evidence/step-39/after/palette-selected-pair-${viewportName}.png`,
  });
});

test('resource scores and accessibility declarations are identified as manifest claims', async ({
  page,
}) => {
  await page.goto('/explore?q=success-state');
  await page.waitForLoadState('networkidle');
  const title = page.getByRole('link', { name: 'Success State' });
  await expect(title).toBeVisible();
  const card = title.locator('xpath=../../..');
  await expect(card).not.toContainText(/\b98\b/);
  const viewport = page.viewportSize();
  const viewportName = viewport?.width === 390 ? 'mobile' : 'desktop';
  await title.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `quality/evidence/step-39/after/resource-quality-card-${viewportName}.png`,
  });

  await page.goto('/r/success-state');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Quality assessment: Not assessed.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Accessibility' }).click();
  await expect(
    page.getByText(
      'This shows resource-manifest declarations. Gold browser checks provide independent evidence for the validated runtime set; other resource claims remain unverified. Test the rendered component in your application.'
    )
  ).toBeVisible();
  await expect(page.getByText('WCAG AA target', { exact: true })).toBeVisible();
  await page.screenshot({
    path: `quality/evidence/step-39/after/resource-accessibility-metadata-${viewportName}.png`,
  });
});

test('unassessed resources do not present template scores or accessibility declarations as verified results', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/r/success-state');
  await page.waitForLoadState('networkidle');
  await expect(
    page.frameLocator('iframe[title="Success State live preview"]').locator('.tess-screen')
  ).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Quality assessment: Not assessed.', { exact: true })).toBeVisible();
  await expect(page.getByText(/\b(?:96|98)\s*\/\s*100\b/)).toHaveCount(0);

  await page.getByRole('tab', { name: 'Accessibility' }).click();
  const accessibilityPanel = page.locator('main');
  await expect(accessibilityPanel.getByText('WCAG AA target', { exact: true })).toBeVisible();
  await expect(
    accessibilityPanel.getByText('Not independently verified', { exact: true }).first()
  ).toBeVisible();
  await expect(accessibilityPanel.getByText('WCAG AAA', { exact: true })).toHaveCount(0);

  await captureAssessmentEvidence(page, testInfo.project.name, response?.status() ?? null, runtime);

  await page.goto('/r/button');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Accessibility' }).click();
  await expect(page.getByText('Gold browser checked', { exact: true }).first()).toBeVisible();
});

test('resource accessibility status cards keep every label and status readable across widths', async ({
  page,
}) => {
  const runtime = watchRuntime(page);
  const responsiveWidths = [360, 390, 430, 640, 768, 1024, 1440];
  const measurements = [];
  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: width >= 1280 ? 900 : 844 });
    const response = await page.goto('/r/success-state');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Accessibility' }).click();
    const cards = page.locator('[data-accessibility-assessment-card]');
    await expect(cards).toHaveCount(5);
    const geometry = await cards.evaluateAll((elements) => {
      const columns = getComputedStyle(elements[0].parentElement!).gridTemplateColumns.split(
        ' '
      ).length;
      return {
        columns,
        cards: elements.map((card) => {
          const cardRect = card.getBoundingClientRect();
          const textRects = Array.from(card.querySelectorAll('span')).map((span) => {
            const rect = span.getBoundingClientRect();
            return {
              text: span.innerText,
              left: Math.round(rect.left * 100) / 100,
              right: Math.round(rect.right * 100) / 100,
            };
          });
          return {
            label: card.querySelector(':scope > span')?.innerText,
            left: Math.round(cardRect.left * 100) / 100,
            right: Math.round(cardRect.right * 100) / 100,
            scrollWidth: card.scrollWidth,
            clientWidth: card.clientWidth,
            overflowingText: textRects.filter(
              (text) => text.right > cardRect.right + 1 || text.left < cardRect.left - 1
            ),
          };
        }),
      };
    });
    const expectedColumns = width < 640 ? 1 : width < 1024 ? 2 : 3;
    measurements.push({ width, status: response?.status() ?? null, expectedColumns, ...geometry });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Accessibility' }).scrollIntoViewIfNeeded();
  const cards = page.locator('[data-accessibility-assessment-card]');
  await cards.first().scrollIntoViewIfNeeded();
  const hasOverflow = measurements.some((measurement) =>
    measurement.cards.some((card) => card.overflowingText.length > 0)
  );
  const directory = path.resolve(process.cwd(), 'quality/evidence/step-39');
  const viewportName = 'responsive';
  const evidencePhase = hasOverflow ? 'before' : 'after';
  const screenshot = path.join(
    directory,
    evidencePhase,
    `resource-accessibility-overflow-${viewportName}.png`
  );
  const json = path.join(
    directory,
    evidencePhase,
    `resource-accessibility-overflow-${viewportName}.json`
  );
  // Axe injects temporary styles; keep user-session runtime evidence separate from its instrumentation.
  const runtimeBeforeAxe = {
    consoleErrors: [...runtime.consoleErrors],
    consoleWarnings: [...runtime.consoleWarnings],
    uncaughtExceptions: [...runtime.uncaughtExceptions],
    failedRequests: [...runtime.failedRequests],
    httpErrors: [...runtime.httpErrors],
  };
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot });
  await writeFile(
    json,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        route: page.url(),
        viewport: page.viewportSize(),
        responsiveWidths,
        statusByWidth: measurements.map(({ width, status }) => ({ width, status })),
        layout,
        measurements,
        seriousOrCriticalAxe: axe.violations
          .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
          .map(({ id, impact, description }) => ({ id, impact, description })),
        runtime: runtimeBeforeAxe,
        axeInstrumentationConsoleErrors: runtime.consoleErrors.slice(
          runtimeBeforeAxe.consoleErrors.length
        ),
        screenshot,
      },
      null,
      2
    )}\n`
  );

  expect(measurements.map(({ columns }) => columns)).toEqual([1, 1, 1, 2, 2, 3, 3]);
  expect(
    measurements.flatMap(({ cards: measuredCards }) =>
      measuredCards.filter((card) => card.overflowingText.length > 0)
    )
  ).toEqual([]);
  expect(layout.horizontalOverflow).toBe(false);
  expect(
    axe.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    )
  ).toEqual([]);
  expect(runtimeBeforeAxe.consoleErrors).toEqual([]);
  expect(runtimeBeforeAxe.uncaughtExceptions).toEqual([]);
  expect(runtimeBeforeAxe.failedRequests).toEqual([]);
  expect(runtimeBeforeAxe.httpErrors).toEqual([]);
});

test('metrics strip catalogue copy matches its real example preview', async ({ page }) => {
  const runtime = watchRuntime(page);
  const viewportName = test.info().project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceRoot = path.resolve(process.cwd(), 'quality/evidence/step-39');
  await mkdir(evidenceRoot, { recursive: true });
  const evidenceDirectory = path.join(evidenceRoot, 'after');
  await mkdir(evidenceDirectory, { recursive: true });
  const detailScreenshot = path.join(
    evidenceDirectory,
    `customer-metrics-copy-${viewportName}.png`
  );
  const previewScreenshot = path.join(
    evidenceDirectory,
    `customer-metrics-preview-${viewportName}.png`
  );
  const evidencePath = path.join(evidenceDirectory, `customer-metrics-copy-${viewportName}.json`);
  const response = await page.goto('/r/customer-metrics-strip');
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  expect(detail).toContain(
    'Four-column metrics strip for projects, teams, tasks and completion progress'
  );
  expect(detail).toContain('Replace the example values with measured data');
  expect(detail).not.toMatch(/uptime, volume, latency, and scale/);
  const embeddedPreview = page.frameLocator('iframe[title="Customer Metrics Strip live preview"]');
  const embeddedScreen = embeddedPreview.locator('.tess-screen');
  await expect(embeddedScreen).toBeVisible({ timeout: 15_000 });
  const embeddedContent = await embeddedScreen.innerText();
  expect(embeddedContent).toContain('Example Projects');
  expect(embeddedContent).toContain('Example Completion');
  await page.screenshot({ path: detailScreenshot, fullPage: true });

  const preview = await openResourcePreview(page, 'customer-metrics-strip');
  const content = await preview.locator('body').innerText();
  expect(content).toContain('Example Projects');
  expect(content).toContain('Example Teams');
  expect(content).toContain('Example Tasks');
  expect(content).toContain('Example Completion');
  expect(content).toContain('Illustrative metrics; replace with measured data');
  const previewRoot = preview.locator('.tess-screen');
  await previewRoot.screenshot({ path: previewScreenshot });
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await writeFile(
    evidencePath,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        route: '/r/customer-metrics-strip',
        previewRoute: '/preview/?resource=customer-metrics-strip',
        viewport: page.viewportSize(),
        detailStatus: response?.status(),
        detailCopy: detail,
        embeddedPreviewCopy: embeddedContent,
        previewCopy: content,
        runtime,
        screenshots: { detail: detailScreenshot, preview: previewScreenshot },
      },
      null,
      2
    )}\n`
  );
});

test('logo marquee defaults are not presented as real customer or partner wordmarks', async ({ page }) => {
  const runtime = watchRuntime(page);
  const viewportName = test.info().project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceRoot = path.resolve(process.cwd(), 'quality/evidence/step-39');
  await mkdir(evidenceRoot, { recursive: true });
  const response = await page.goto('/r/logo-cloud-marquee');
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  const embeddedPreview = page.frameLocator('iframe[title="Logo Cloud Marquee live preview"]');
  const embeddedScreen = embeddedPreview.locator('.tess-screen');
  await expect(embeddedScreen).toBeVisible({ timeout: 15_000 });
  const embeddedContent = await embeddedScreen.innerText();
  const scrollRegion = embeddedScreen.getByRole('region', { name: 'Partner names, horizontally scrollable' });
  const geometry = await scrollRegion.evaluate((track) => {
    const trackRect = track.getBoundingClientRect();
    const first = track.querySelector('span');
    const firstRect = first?.getBoundingClientRect();
    return {
      clientWidth: track.clientWidth,
      scrollWidth: track.scrollWidth,
      trackLeft: Math.round(trackRect.left * 100) / 100,
      firstLeft: firstRect ? Math.round(firstRect.left * 100) / 100 : null,
      firstClipped: firstRect ? firstRect.left < trackRect.left - 1 : true,
      hasHorizontalScroll: track.scrollWidth > track.clientWidth + 1,
    };
  });
  const evidencePhase = geometry.firstClipped ? 'before' : 'after';
  const evidenceDirectory = path.join(evidenceRoot, evidencePhase);
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, `logo-cloud-marquee-${viewportName}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });

  expect(detail).toMatch(/default names are illustrative/i);
  expect(detail).not.toMatch(/partner and customer wordmarks|high volume of customer adopters/i);
  expect(embeddedContent).toMatch(/sample partner/i);
  expect(embeddedContent).toContain('Scroll horizontally to view all labels.');
  expect(embeddedContent).not.toMatch(/\bVercel\b|\bStripe\b|\bLinear\b|\bRaycast\b|\bOpenAI\b|\bAnthropic\b|\bSupabase\b|\bCloudflare\b/);
  expect(geometry.firstClipped).toBe(false);
  await scrollRegion.focus();
  await expect(scrollRegion).toBeFocused();
  for (let index = 0; index < 10; index++) await scrollRegion.press('ArrowRight');
  const keyboardScroll = await scrollRegion.evaluate((track) => {
    return {
      scrollLeft: track.scrollLeft,
    };
  });
  expect(geometry.hasHorizontalScroll).toBe(true);
  expect(keyboardScroll.scrollLeft).toBeGreaterThan(0);
  const lastLabelVisible = await scrollRegion.evaluate((track) => {
    track.scrollLeft = track.scrollWidth;
    const last = track.querySelector('span:last-child');
    const trackRect = track.getBoundingClientRect();
    const lastRect = last?.getBoundingClientRect();
    return lastRect ? lastRect.right <= trackRect.right + 1 : false;
  });
  expect(lastLabelVisible).toBe(true);
  await scrollRegion.evaluate((track) => {
    track.scrollLeft = 0;
  });
  await writeFile(
    path.join(evidenceDirectory, `logo-cloud-marquee-${viewportName}.json`),
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        route: page.url(),
        viewport: page.viewportSize(),
        status: response?.status(),
        detailCopy: detail,
        previewCopy: embeddedContent,
        geometry,
        keyboardScroll,
        lastLabelVisible,
        runtime,
        screenshot,
      },
      null,
      2
    )}\n`
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('performance metrics resource describes a template instead of measured evidence', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/r/feature-metrics');
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  expect(detail).toContain('Illustrative performance-proof section');
  expect(detail).not.toMatch(/empirical benchmark graphs|performance comparison stats/i);
  const screen = page.frameLocator('iframe[title="Feature Metrics live preview"]').locator('.tess-screen');
  await expect(screen).toBeVisible({ timeout: 15_000 });
  const preview = await screen.innerText();
  expect(preview).toContain('Example target');
  expect(preview).toContain('Add dated desktop and mobile reports.');
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('social proof hero metadata matches its evidence-labeled sample defaults', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/r/social-proof-hero');
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  expect(detail).toContain('Illustrative social-proof hero');
  expect(detail).not.toMatch(/verified customer counts and ratings/i);
  const screen = page.frameLocator('iframe[title="Social Proof Hero live preview"]').locator('.tess-screen');
  await expect(screen).toBeVisible({ timeout: 15_000 });
  const preview = await screen.innerText();
  expect(preview).toContain('Example rating');
  expect(preview).toContain('Example: 128 teams');
  expect(preview).toContain('Evidence required');
  expect(preview).not.toMatch(/^★/);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('testimonial grid defaults are examples and do not display invented five-star ratings', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/r/testimonial-grid');
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  expect(detail).toContain('Responsive grid template for approved customer statements');
  expect(detail).not.toMatch(/customer endorsements with rating stars/i);
  const screen = page.frameLocator('iframe[title="Testimonial Grid live preview"]').locator('.tess-screen');
  await expect(screen).toBeVisible({ timeout: 15_000 });
  const preview = await screen.innerText();
  expect(preview).toContain('Illustrative quote');
  expect(preview).toContain('Example Customer A');
  expect(preview).not.toMatch(/★/);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('Footer Minimal defaults do not imply a live system-status source', async ({ page }, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/resources/footer-minimal/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const detail = await page.locator('main').innerText();
  const preview = page.frameLocator('iframe[title="Footer Minimal live preview"]');
  await expect(preview.locator('footer')).toBeVisible();
  const previewText = await preview.locator('body').innerText();
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  const directory = path.resolve(process.cwd(), 'quality/evidence/step-39/footer-minimal-live-status');
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, `footer-minimal-${viewport}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    path.join(directory, `footer-minimal-${viewport}.json`),
    `${JSON.stringify({
      route: page.url(),
      status: response?.status(),
      viewport: page.viewportSize(),
      detail,
      previewText,
      runtime,
      screenshot,
    }, null, 2)}\n`
  );

  expect(detail).not.toMatch(/status indicator|operational status indicator/i);
  expect(previewText).not.toMatch(/\b(?:system status|operational|privacy|terms)\b/i);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
