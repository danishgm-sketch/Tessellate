import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const caseRuntime = new WeakMap<Page, {
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
  ignoreInstrumentation: boolean;
}>();

test.beforeEach(async ({ page }) => {
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
    ignoreInstrumentation: false,
  };
  caseRuntime.set(page, runtime);
  page.on('console', (message) => {
    if (!runtime.ignoreInstrumentation && message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (!runtime.ignoreInstrumentation && message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => {
    if (!runtime.ignoreInstrumentation) runtime.uncaughtExceptions.push(error.message);
  });
  page.on('requestfailed', (request) =>
    !runtime.ignoreInstrumentation && runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (!runtime.ignoreInstrumentation && response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
});

test.afterEach(async ({ page }, testInfo) => {
  const url = page.url();
  if (url === 'about:blank') return;
  const evidenceDir = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v62-copy-2026-10-31/runner/issue-evidence',
    testInfo.project.name
  );
  await mkdir(evidenceDir, { recursive: true });
  const filename = testInfo.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const screenshot = path.join(evidenceDir, `${filename}.png`);
  await page.screenshot({ path: screenshot, animations: 'disabled' }).catch(() => undefined);
  const evidence = {
    test: testInfo.title,
    status: testInfo.status,
    route: url,
    viewport: page.viewportSize(),
    screenshot,
    runtime: caseRuntime.get(page) ?? null,
  };
  await writeFile(path.join(evidenceDir, `${filename}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
});

type RuntimeEvidence = {
  successfulResponses?: Array<{ url: string; status: number }>;
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
};

test('Compose explains the product plan without internal schema vocabulary', async ({ page }, testInfo) => {
  const runtime: RuntimeEvidence = {
    successfulResponses: [],
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
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
    const pathname = new URL(response.url()).pathname;
    if (pathname === '/compose' || pathname === '/data/catalog.json') {
      runtime.successfulResponses.push({ url: response.url(), status: response.status() });
    }
  });

  const composeResponse = await page.goto('/compose');
  expect(composeResponse?.status()).toBe(200);
  const main = page.locator('main');
  const introductoryCopy = await main.innerText();

  expect(introductoryCopy).not.toMatch(/\b(ProductModel|ScreenGraph|LLM|archetype|screen classes|route slugs|section roles)\b|archetype priors|deterministically interpret/i);
  await expect(main.getByText(/Describe what your product needs/i)).toBeVisible();
  await expect(main.getByText(/Start with a short brief/i)).toBeVisible();

  await expect(page.getByText('Catalogue ready', { exact: true })).toBeVisible();
  expect(
    runtime.successfulResponses.some(
      (response) => new URL(response.url).pathname === '/data/catalog.json' && response.status === 200
    )
  ).toBe(true);
  await page.getByRole('textbox', { name: 'Product Description & Objectives' }).fill(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.'
  );
  await page.getByRole('button', { name: 'Compose Interface System' }).click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByTestId('direction-card-01')).toBeVisible();
  await expect(page.getByTestId('direction-card-02')).toBeVisible();
  await expect(page.getByTestId('direction-card-03')).toBeVisible();
  await expect(page.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });

  const composedCopy = await main.innerText();
  expect(composedCopy).not.toMatch(
    /\b(ProductModel|ScreenGraph|LLM|archetype|screen classes|route slugs|section roles|sophistication|deterministic|criticality)\b|archetype priors|information complexity|spatial topology|mathematical DNA|functional workflow jobs|motion personalities|navigation topology|inferred product priors|required roles/i
  );
  expect(composedCopy).not.toMatch(/trading|portfolio|order book|telemetry|order execution|financial terminal/i);
  await expect(main.getByText('Your brief points to: Employee Experience.', { exact: true })).toBeVisible();
  await expect(
    main.getByText('Suggested screens and navigation, organized around the work each page supports.', { exact: true })
  ).toBeVisible();
  await expect(main.getByText('Product type', { exact: true })).toBeVisible();
  await expect(main.getByText('Employee Experience', { exact: true })).toBeVisible();
  await expect(main.getByText('Includes:', { exact: true }).first()).toBeVisible();
  await expect(main.getByText('Required Roles:', { exact: true })).toHaveCount(0);
  await expect(main.getByText(/overview-header|metric-cards|activity-feed/)).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  const evidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v62-copy-2026-10-31/public-v45/interaction-readiness/after-local'
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  const geometry = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  await page.screenshot({ path: path.join(evidenceDirectory, `compose-${viewport}.png`), fullPage: true });
  await writeFile(
    path.join(evidenceDirectory, `compose-${viewport}.json`),
    `${JSON.stringify({ url: page.url(), viewport, geometry, axeViolations: accessibility.violations.length, runtime }, null, 2)}\n`
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

function watchRuntime(page: Page): RuntimeEvidence {
  const runtime: RuntimeEvidence = {
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

async function captureToolEvidence(
  page: Page,
  testInfo: { project: { name: string } },
  slug: string,
  responseStatus: number | null,
  runtime: RuntimeEvidence
) {
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}`
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, `${slug}.png`);
  await page.screenshot({ path: screenshot, fullPage: viewport === 'desktop' });

  page.removeAllListeners('console');
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const seriousAccessibilityViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? '')
  );
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    status: responseStatus,
    layout,
    visibleText: await page.locator('main').innerText(),
    accessibility: {
      totalViolations: accessibility.violations.length,
      seriousOrCritical: seriousAccessibilityViolations.map(({ id, impact, description }) => ({
        id,
        impact,
        description,
      })),
    },
    runtime,
    screenshot,
  };
  await writeFile(
    path.join(evidenceDirectory, `${slug}.json`),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8'
  );
  expect(seriousAccessibilityViolations).toEqual([]);
  expect(layout.horizontalOverflow).toBe(false);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  return evidence;
}

async function waitForHydration(page: Page) {
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

test('AI prompt resource describes and exposes only the behavior that works', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/ai-prompt-hero');
  await expect(page.getByRole('heading', { name: 'AI Prompt Hero' })).toBeVisible();
  await page.waitForTimeout(1200);
  const preview = page.frameLocator('iframe[title="AI Prompt Hero live preview"]');
  const promptInput = preview.getByRole('textbox', { name: 'Describe the product or workflow' });
  if (!(await promptInput.isVisible().catch(() => false))) {
    const frameDetails = await Promise.all(
      page.frames().map(async (frame) => ({
        url: frame.url(),
        bodyText: await frame
          .locator('body')
          .innerText()
          .catch(() => ''),
        bodyHtml: (
          await frame
            .locator('body')
            .innerHTML()
            .catch(() => '')
        ).slice(0, 1800),
      }))
    );
    const directory = path.resolve(
      process.cwd(),
      `quality/evidence/step-39/public-v62-copy-2026-10-31/astro-failure/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}`
    );
    await mkdir(directory, { recursive: true });
    await page.screenshot({ path: path.join(directory, 'ai-prompt-hero.png'), fullPage: true });
    await writeFile(
      path.join(directory, 'ai-prompt-hero.json'),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), frameDetails, runtime }, null, 2)}\n`,
      'utf8'
    );
  }
  await expect(promptInput).toBeVisible();
  const visibleText = await preview.locator('body').innerText();
  const submitButton = preview.getByRole('button', {
    name: /Synthesize Blueprint|Generate Blueprint/,
  });
  const buttonCount = await submitButton.count();
  const buttonLabel = buttonCount ? (await submitButton.first().innerText()).trim() : null;
  const buttonDisabled = buttonCount ? await submitButton.first().isDisabled() : null;
  const screenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}/ai-prompt-hero.png`
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });

  const preset = preview.getByRole('button', {
    name: 'An employee onboarding workspace for a growing team',
  });
  await preset.focus();
  await preset.press('Enter');
  await expect(promptInput).toHaveValue('An employee onboarding workspace for a growing team');
  await expect(submitButton).toBeDisabled();

  await promptInput.fill('A private team directory with onboarding tasks');
  await expect(promptInput).toHaveValue('A private team directory with onboarding tasks');
  await expect(submitButton).toBeDisabled();
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);

  // Axe injects a transient inline style that the Sites CSP correctly blocks.
  // Snapshot application runtime first so test instrumentation is not misreported as a product error.
  page.removeAllListeners('console');
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const seriousAccessibilityViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? '')
  );
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    visibleText,
    submitButton: { count: buttonCount, label: buttonLabel, disabled: buttonDisabled },
    typedPromptValue: await promptInput.inputValue(),
    accessibility: {
      totalViolations: accessibility.violations.length,
      seriousOrCritical: seriousAccessibilityViolations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
      })),
    },
    runtime,
    screenshot: path.relative(process.cwd(), screenshot),
  };
  const reportPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}/ai-prompt-hero.json`
  );
  await writeFile(reportPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('visible copy and runtime evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(visibleText).toContain(
    'Preview only. This example keeps your prompt on this page and does not generate a blueprint.'
  );
  expect(visibleText).not.toMatch(
    /Gemini|trading terminal|generate the entire interface system|model picker pill/i
  );
  expect(buttonCount).toBe(1);
  expect(buttonLabel).toBe('Generate Blueprint');
  expect(buttonDisabled).toBe(true);
  expect(seriousAccessibilityViolations).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('AI rewrite preview separates fixed examples from an actual model action', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/inline-ai-rewrite');
  await expect(page.getByRole('heading', { name: 'Inline AI Rewrite' })).toBeVisible();
  const preview = page.frameLocator('iframe[title="Inline AI Rewrite live preview"]');
  await expect(preview.getByText('Inline AI Rewrite', { exact: true })).toBeVisible();
  const visibleText = await preview.locator('body').innerText();
  const acceptButton = preview.getByRole('button', { name: /Apply in preview|Applied in preview/ });
  const initialDirectory = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}`
  );
  await mkdir(initialDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(initialDirectory, 'inline-ai-rewrite-initial.png'),
    fullPage: true,
  });
  await writeFile(
    path.join(initialDirectory, 'inline-ai-rewrite-initial.json'),
    `${JSON.stringify(
      {
        route: page.url(),
        viewport: page.viewportSize(),
        visibleText,
        initialAcceptLabel: await acceptButton.innerText().catch(() => null),
        runtime,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  expect(visibleText).toContain(
    'Preview only. These fixed examples do not send an AI request or change content outside this preview.'
  );
  expect(visibleText).not.toMatch(/Ship stunning|production-ready|instantly/i);
  await expect(acceptButton).toHaveText('Apply in preview');
  await expect(acceptButton).toBeEnabled();

  await preview.getByRole('button', { name: 'energetic' }).click();
  await expect(
    preview.getByText('Bring your product interface together from reusable resources.')
  ).toBeVisible();
  await acceptButton.click();
  await expect(preview.getByRole('button', { name: 'Applied in preview' })).toBeDisabled();
  await preview.getByRole('button', { name: 'Reset sample' }).click();
  await expect(preview.getByRole('button', { name: 'Apply in preview' })).toBeEnabled();
  await expect(
    preview.getByText('Tessellate helps teams compose interfaces from reusable resources.')
  ).toBeVisible();

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  const afterPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}/inline-ai-rewrite.png`
  );
  await mkdir(path.dirname(afterPath), { recursive: true });
  await page.screenshot({ path: afterPath, fullPage: true });
  const afterVisibleText = await preview.locator('body').innerText();
  await writeFile(
    afterPath.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText: afterVisibleText, runtime }, null, 2)}\n`,
    'utf8'
  );
});

test('AI tool timeline labels timings and results as illustrative sample data', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/ai-tool-execution-timeline');
  await expect(page.getByRole('heading', { name: 'AI Tool Execution Timeline' })).toBeVisible();
  const preview = page.frameLocator('iframe[title="AI Tool Execution Timeline live preview"]');
  await expect(preview.getByText('Example agent tool trace')).toBeVisible();
  const visibleText = await preview.locator('body').innerText();
  const initialDirectory = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}`
  );
  await mkdir(initialDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(initialDirectory, 'ai-tool-execution-timeline-initial.png'),
    fullPage: true,
  });
  await writeFile(
    path.join(initialDirectory, 'ai-tool-execution-timeline-initial.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText, runtime }, null, 2)}\n`,
    'utf8'
  );

  expect(visibleText).toContain(
    'Example trace. Sample calls and timings only; this preview does not run tools or create files.'
  );
  expect(visibleText).not.toMatch(
    /Found 1 verified resource|Successfully exported|Total runtime:/i
  );
  expect(visibleText).not.toMatch(/financial-candlestick|candlestick/i);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  const afterPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}/ai-tool-execution-timeline.png`
  );
  await mkdir(path.dirname(afterPath), { recursive: true });
  await page.screenshot({ path: afterPath, fullPage: true });
  const afterVisibleText = await preview.locator('body').innerText();
  await writeFile(
    afterPath.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText: afterVisibleText, runtime }, null, 2)}\n`,
    'utf8'
  );
});

const aiResourceCopyAudits = [
  {
    slug: 'ai-chat-panel',
    title: 'AI Chat Panel',
    disclosure:
      'Example conversation. This preview does not connect to a model; sending adds a fixed local example reply.',
    misleading: /Claude 3\.7 Sonnet/i,
  },
  {
    slug: 'ai-model-mode-switcher',
    title: 'AI Model Mode Switcher',
    disclosure:
      'Example selector. Options change this preview only; no provider or local model is connected.',
    misleading: /BYO Key Active|Claude 3\.7 Sonnet|GPT-4o|Gemini 2\.5 Pro/i,
  },
  {
    slug: 'ai-source-citations',
    title: 'AI Source Citations',
    disclosure: 'Example citations. These sample sources were not retrieved or verified.',
    misleading: /100% Verified|Grounded Sources/i,
  },
  {
    slug: 'ai-research-answer',
    title: 'AI Research Answer',
    disclosure:
      'Example research answer. No sources were retrieved and no confidence score was calculated.',
    misleading: /Confidence: 98%|Synthesized from 12|under 150ms/i,
  },
] as const;

test('resource detail labels status as manifest-provided metadata', async ({ page }, testInfo) => {
  await page.goto('/r/ai-chat-panel');
  await expect(page.getByRole('heading', { name: 'AI Chat Panel' })).toBeVisible();
  const declaredStatus = page
    .locator('main > header')
    .getByText('Manifest status: verified', { exact: true });
  await expect(declaredStatus).toBeVisible();
  const preview = page.frameLocator('iframe[title="AI Chat Panel live preview"]');
  await expect(preview.getByText('Example assistant conversation')).toBeVisible();

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const screenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/ai-chat-panel-status-label.png`
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
});

for (const audit of aiResourceCopyAudits) {
  test(`${audit.title} identifies its local example behavior`, async ({ page }, testInfo) => {
    const runtime = {
      consoleErrors: [] as string[],
      uncaughtExceptions: [] as string[],
      failedRequests: [] as Array<{ url: string; error: string | null }>,
      httpErrors: [] as Array<{ url: string; status: number }>,
    };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) =>
      runtime.failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? null,
      })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    await page.goto(`/r/${audit.slug}`);
    await expect(page.getByRole('heading', { name: audit.title })).toBeVisible();
    const preview = page.frameLocator(`iframe[title="${audit.title} live preview"]`);
    await expect(preview.locator('body')).toHaveText(/\S/);
    await page.waitForTimeout(1200);
    const visibleText = await preview.locator('body').innerText();
    const initialDirectory = path.resolve(
      process.cwd(),
      `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}`
    );
    await mkdir(initialDirectory, { recursive: true });
    await page.screenshot({
      path: path.join(initialDirectory, `${audit.slug}-initial.png`),
      fullPage: true,
    });
    await writeFile(
      path.join(initialDirectory, `${audit.slug}-initial.json`),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText, runtime }, null, 2)}\n`,
      'utf8'
    );

    expect(visibleText).toContain(audit.disclosure);
    expect(visibleText).not.toMatch(audit.misleading);

    if (audit.slug === 'ai-chat-panel') {
      const input = preview.getByRole('textbox', { name: 'Message to the example assistant' });
      await input.fill('Make onboarding clearer');
      await expect(input).toHaveValue('Make onboarding clearer');
      await preview.getByRole('button', { name: 'Send example' }).click();
      const response = preview.getByText(
        'Example response: This preview does not connect to a model.'
      );
      await expect(response).toBeVisible();
      await expect(response).toBeInViewport();
      await expect(input).toHaveValue('');
      const inputViewport = await input.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { bottom: bounds.bottom, viewportHeight: window.innerHeight };
      });
      expect(inputViewport.bottom).toBeLessThanOrEqual(inputViewport.viewportHeight);

      await input.fill('A second example');
      await input.press('Enter');
      await expect(preview.getByText('A second example')).toBeVisible();
      await expect(response).toHaveCount(2);
      await expect(response.last()).toBeInViewport();
    }

    if (audit.slug === 'ai-model-mode-switcher') {
      const mode = preview.getByRole('button', { name: 'Long context' });
      await mode.focus();
      await mode.press('Enter');
      await expect(mode).toHaveAttribute('aria-pressed', 'true');
    }

    if (audit.slug === 'ai-source-citations') {
      const source = preview.getByRole('button', { name: /Example source 1/ });
      await source.focus();
      await source.press('Enter');
      await expect(source).toHaveAttribute('aria-pressed', 'true');
      await source.press('Space');
      await expect(source).toHaveAttribute('aria-pressed', 'false');
    }

    expect(runtime.consoleErrors).toEqual([]);
    expect(runtime.uncaughtExceptions).toEqual([]);
    expect(runtime.failedRequests).toEqual([]);
    expect(runtime.httpErrors).toEqual([]);
    const afterPath = path.resolve(
      process.cwd(),
      `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop'}/${audit.slug}.png`
    );
    await mkdir(path.dirname(afterPath), { recursive: true });
    await page.screenshot({ path: afterPath, fullPage: true });
    const afterVisibleText = await preview.locator('body').innerText();
    await writeFile(
      afterPath.replace(/\.png$/, '.json'),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText: afterVisibleText, runtime }, null, 2)}\n`,
      'utf8'
    );
  });
}

test('community CTA uses real destinations and makes no unsupported member-count claim', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/cta-community');
  await expect(page.getByRole('heading', { name: 'CTA Community' })).toBeVisible();
  const preview = page.frameLocator('iframe[title="CTA Community live preview"]');
  await expect(preview.locator('body')).toHaveText(/\S/);

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const beforeScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/before/${viewport}/cta-community-inert-actions.png`
  );
  await mkdir(path.dirname(beforeScreenshot), { recursive: true });
  await page.screenshot({ path: beforeScreenshot, fullPage: true });

  const guideLink = preview.getByRole('link', { name: 'Read contributor guide' });
  const repositoryLink = preview.getByRole('link', { name: 'View repository' });
  await expect(guideLink).toHaveAttribute('href', '/creators');
  await expect(repositoryLink).toHaveAttribute(
    'href',
    'https://github.com/danishgm-sketch/Tessellate'
  );
  await expect(preview.getByRole('button', { name: /Join Discord|Star on GitHub/ })).toHaveCount(0);
  const visibleText = await preview.locator('body').innerText();
  expect(visibleText).not.toMatch(/12,000\+|members/i);
  expect(visibleText).toContain('Read contributor guide');
  expect(visibleText).toContain('View repository');
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);

  const afterScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/cta-community.png`
  );
  await mkdir(path.dirname(afterScreenshot), { recursive: true });
  await page.screenshot({ path: afterScreenshot, fullPage: true });
  await writeFile(
    afterScreenshot.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText, runtime }, null, 2)}\n`,
    'utf8'
  );
});

test('product preview CTA links to Compose and labels its disconnected sample', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/cta-product-preview');
  await expect(page.getByRole('heading', { name: 'CTA Product Preview' })).toBeVisible();
  const preview = page.frameLocator('iframe[title="CTA Product Preview live preview"]');
  await expect(preview.locator('body')).toHaveText(/\S/);

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const beforeScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/before/${viewport}/cta-product-preview-inert-action.png`
  );
  await mkdir(path.dirname(beforeScreenshot), { recursive: true });
  await page.screenshot({ path: beforeScreenshot, fullPage: true });

  const composeLink = preview.getByRole('link', { name: 'Start composing' });
  await expect(composeLink).toHaveAttribute('href', '/compose');
  await expect(preview.getByRole('button', { name: 'Open Canvas Now' })).toHaveCount(0);
  const visibleText = await preview.locator('body').innerText();
  expect(visibleText).not.toMatch(/Join thousands|324 Verified Manifests Ready|Canvas Active/i);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);

  const afterScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/cta-product-preview.png`
  );
  await mkdir(path.dirname(afterScreenshot), { recursive: true });
  await page.screenshot({ path: afterScreenshot, fullPage: true });
  await writeFile(
    afterScreenshot.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText, runtime }, null, 2)}\n`,
    'utf8'
  );
});

test('homepage examples disclose sample data and avoid unsupported product metrics', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/');
  const pageText = await page.locator('main').innerText();
  expect(pageText).not.toMatch(
    /£14,250\.00|£3,890\.50|£142,500|£4\.28M|18,400|99\.98%|1,492|TPS Telemetry|Gross Volume|Settlement|Join thousands of developers|Workbench Canvas Active|100% Keyboard Navigable|initial paint instantaneous/i
  );
  expect(pageText).not.toMatch(
    /zero-debt|fully accessible|complete design cohesion|zero hallucinations|compatible with every system|instantly integrate|without CSS conflicts|automatically substitutes|WCAG AA\/AAA|Every combination is scored|Start composing in seconds|full deterministic operating environment|mix adjective feels|AGENT_HANDOFF\.md|all components dynamically inherit/i
  );
  expect(pageText).toContain('Example preview · sample data');
  expect(pageText).toContain('No project is connected');
  expect(pageText).toContain('WCAG 2.2 AA target');
  expect(pageText).toContain(
    'A 100-point rubric scores declared structure and resource metadata; it does not certify the rendered interface.'
  );
  expect(pageText).toContain('layout is not automatically substituted for you.');
  expect(pageText).toContain('Agent handoff');
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const screenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-copy-truth.png`
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    screenshot.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), mainText: pageText, runtime }, null, 2)}\n`,
    'utf8'
  );

  for (const capture of [
    { heading: 'Open resources. Clear sample data.', name: 'homepage-resource-mosaic' },
    { heading: 'Essential → Experimental.', name: 'homepage-design-spectrum' },
    { heading: /Step inside the engine/, name: 'homepage-workbench-example' },
  ]) {
    await page.getByRole('heading', { name: capture.heading }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.resolve(
        process.cwd(),
        `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/${capture.name}.png`
      ),
    });
  }

  await page.getByRole('heading', { name: /Step inside the engine/ }).scrollIntoViewIfNeeded();
  const chrome = page.getByTestId('home-workbench-chrome');
  const title = chrome.getByText('Tessellate Workbench', { exact: true });
  const status = chrome.getByText('Example interface · No project is connected', { exact: true });
  await expect(title).toBeVisible();
  await expect(status).toBeVisible();
  const chromeScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-workbench-example.png`
  );
  await page.screenshot({ path: chromeScreenshot });
  const geometry = await Promise.all(
    [title, status].map(async (locator) => {
      const box = await locator.boundingBox();
      return box && { x: box.x, y: box.y, width: box.width, height: box.height };
    })
  );
  const overlap = Boolean(
    geometry[0] &&
    geometry[1] &&
    geometry[0].x < geometry[1].x + geometry[1].width &&
    geometry[0].x + geometry[0].width > geometry[1].x &&
    geometry[0].y < geometry[1].y + geometry[1].height &&
    geometry[0].y + geometry[0].height > geometry[1].y
  );
  await writeFile(
    chromeScreenshot.replace(/\.png$/, '.json'),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), title: geometry[0], status: geometry[1], overlap, runtime }, null, 2)}\n`,
    'utf8'
  );
  expect(overlap).toBe(false);
});

test('homepage spectrum controls explain their pre-hydration state', async ({ browser }) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const runtime = watchRuntime(page);
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await page.getByRole('heading', { name: 'Essential → Experimental.' }).scrollIntoViewIfNeeded();
  const essentialButton = page.getByRole('button', { name: /01 · Essential/ });
  const evidencePhase = (await essentialButton.isDisabled()) ? 'after' : 'before';
  const evidenceDirectory = path.resolve(process.cwd(), `quality/evidence/step-39/public-v62-copy-2026-10-31/${evidencePhase}`);
  const screenshot = path.resolve(
    evidenceDirectory,
    'desktop/homepage-spectrum-controls-before-hydration.png'
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
  const beforeHydration = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    status: response?.status(),
    buttonDisabled: await essentialButton.isDisabled(),
    statusText: await page.getByRole('status').allTextContents(),
    runtime,
    screenshot,
  };
  await writeFile(
    path.resolve(evidenceDirectory, 'desktop/homepage-spectrum-controls-before-hydration.json'),
    `${JSON.stringify(beforeHydration, null, 2)}\n`
  );
  await expect(essentialButton).toBeDisabled();
  await expect(page.locator('#visual-spectrum-controls-status')).toContainText(
    'Preparing comparison controls'
  );
  await page.close();
});

test('mobile homepage spectrum preview keeps its title readable beside its status badges', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-mobile-chromium', 'This check targets the narrow mobile layout.');
  const runtime = watchRuntime(page);
  await page.goto('/');
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Essential → Experimental.' }) })
    .first();
  await section.scrollIntoViewIfNeeded();

  const previewTitle = section.getByRole('heading', { name: 'Tessellate Design Preview' });
  await expect(previewTitle).toBeVisible();
  const titleBox = await previewTitle.boundingBox();
  expect(titleBox).not.toBeNull();
  expect(titleBox!.height).toBeLessThanOrEqual(40);

  const screenshot = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v62-copy-2026-10-31/after/mobile/homepage-spectrum-preview-header.png',
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: false });
  await writeFile(
    path.resolve(
      process.cwd(),
      'quality/evidence/step-39/public-v62-copy-2026-10-31/after/mobile/homepage-spectrum-preview-header.json',
    ),
    `${JSON.stringify(
      {
        route: page.url(),
        viewport: page.viewportSize(),
        previewTitle: await previewTitle.innerText(),
        previewTitleHeight: titleBox!.height,
        runtime,
        screenshot,
      },
      null,
      2,
    )}\n`,
  );
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('homepage resource examples use catalogue identities and demo controls have truthful behavior', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  await page.goto('/');
  await page
    .getByRole('heading', { name: 'Open resources. Clear sample data.' })
    .scrollIntoViewIfNeeded();

  const resourceSection = page
    .locator('section')
    .filter({ hasText: 'The Resource Vocabulary' })
    .first();
  await expect(
    resourceSection.getByRole('heading', { name: 'Area Chart', exact: true })
  ).toBeVisible();
  await expect(
    resourceSection.getByRole('heading', { name: 'Advanced Data Table', exact: true })
  ).toBeVisible();
  await expect(resourceSection.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
  await expect(
    resourceSection.getByRole('heading', { name: 'AI Prompt Composer', exact: true })
  ).toBeVisible();
  await expect(resourceSection.getByRole('button', { name: 'Primary Action' })).toHaveCount(0);
  await expect(resourceSection.getByRole('button', { name: 'Secondary' })).toHaveCount(0);

  const chartCard = resourceSection.getByTestId('home-resource-card').first();
  const chartLabel = chartCard.getByText('Sample values', { exact: true });
  const chartBadge = chartCard.getByTestId('home-resource-type-badge');
  const chartLabelBox = await chartLabel.boundingBox();
  const chartBadgeBox = await chartBadge.boundingBox();
  expect(chartLabelBox).not.toBeNull();
  expect(chartBadgeBox).not.toBeNull();
  expect(
    chartLabelBox!.x < chartBadgeBox!.x + chartBadgeBox!.width &&
      chartLabelBox!.x + chartLabelBox!.width > chartBadgeBox!.x &&
      chartLabelBox!.y < chartBadgeBox!.y + chartBadgeBox!.height &&
      chartLabelBox!.y + chartLabelBox!.height > chartBadgeBox!.y
  ).toBe(false);
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const geometryPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-badge-geometry.json`
  );
  await mkdir(path.dirname(geometryPath), { recursive: true });
  await writeFile(
    geometryPath,
    `${JSON.stringify(
      {
        route: page.url(),
        viewport: page.viewportSize(),
        label: chartLabelBox,
        badge: chartBadgeBox,
        overlap: false,
        runtime,
        screenshot: `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-mosaic.png`,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  const dataFilter = resourceSection.getByRole('button', { name: 'data', exact: true });
  const filterBeforeScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-filter-before.png`
  );
  const filterAfterScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-filter-selected.png`
  );
  await mkdir(path.dirname(filterBeforeScreenshot), { recursive: true });
  await dataFilter.scrollIntoViewIfNeeded();
  await expect(dataFilter).toHaveAttribute('aria-pressed', 'false');
  await page.screenshot({ path: filterBeforeScreenshot });
  await dataFilter.click();
  await expect(dataFilter).toHaveAttribute('aria-pressed', 'true');
  const allFilter = resourceSection.getByRole('button', { name: 'All', exact: true });
  await expect(allFilter).toHaveAttribute('aria-pressed', 'false');
  await expect(dataFilter).toHaveCSS('background-color', 'rgb(17, 18, 23)');
  await expect(dataFilter).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(allFilter).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const selectedFilterClass = await dataFilter.getAttribute('class');
  const unselectedFilterClass = await allFilter.getAttribute('class');
  const selectedFilterStyle = await dataFilter.evaluate((button) => {
    const style = getComputedStyle(button);
    return { backgroundColor: style.backgroundColor, color: style.color, opacity: style.opacity };
  });
  const unselectedFilterStyle = await allFilter.evaluate((button) => {
    const style = getComputedStyle(button);
    return { backgroundColor: style.backgroundColor, color: style.color, opacity: style.opacity };
  });
  expect(selectedFilterClass).toContain('bg-[#111217]');
  expect(unselectedFilterClass).not.toContain('bg-[#111217]');
  await expect(
    resourceSection.getByRole('heading', { name: 'Area Chart', exact: true })
  ).toBeVisible();
  await expect(
    resourceSection.getByRole('heading', { name: 'Advanced Data Table', exact: true })
  ).toHaveCount(0);
  await page.screenshot({ path: filterAfterScreenshot });

  await page.getByRole('heading', { name: 'Essential → Experimental.' }).scrollIntoViewIfNeeded();
  const essentialButton = page.getByRole('button', { name: /01 · Essential/ });
  await essentialButton.click();
  await expect(page.getByText('Level 01 · Ambition 20–35')).toBeVisible();
  await expect(essentialButton).toHaveAttribute('aria-pressed', 'true');
  const spectrumScreenshot = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-spectrum-essential-selected.png`
  );
  await page.screenshot({ path: spectrumScreenshot, fullPage: true });
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-spectrum-interaction.json`),
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        route: page.url(),
        viewport: page.viewportSize(),
        selectedControl: '01 · Essential',
        ariaPressed: await essentialButton.getAttribute('aria-pressed'),
        selectedSummary: await page.getByText('Level 01 · Ambition 20–35').innerText(),
        runtime,
        screenshot: spectrumScreenshot,
      },
      null,
      2
    )}\n`
  );
  await expect(page.getByRole('button', { name: 'Export Data' })).toHaveCount(0);

  await page
    .getByRole('heading', { name: 'Familiar → Experimental structure.' })
    .scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Modular Cockpit (Three-Pane)' }).click();
  await expect(page.getByText('LAYOUT GRAMMAR: THREE_PANE_COCKPIT')).toBeVisible();
  await expect(page.getByText('Illustrative layout · no connected project')).toBeVisible();
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await writeFile(
    path.resolve(
      process.cwd(),
      `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-filter.json`
    ),
    `${JSON.stringify(
      {
        route: page.url(),
        viewport: page.viewportSize(),
        interaction: 'Select the data filter in the Resource Vocabulary section',
        before: { dataFilterAriaPressed: 'false', allFilterAriaPressed: 'true' },
        after: {
          dataFilterAriaPressed: 'true',
          allFilterAriaPressed: 'false',
          dataFilterHasSelectedStyle: selectedFilterClass?.includes('bg-[#111217]') ?? false,
          allFilterHasSelectedStyle: unselectedFilterClass?.includes('bg-[#111217]') ?? false,
          dataFilterStyle: selectedFilterStyle,
          allFilterStyle: unselectedFilterStyle,
          areaChartVisible: true,
          advancedDataTableVisible: false,
        },
        runtime,
        screenshots: {
          before: `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-filter-before.png`,
          after: `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}/homepage-resource-filter-selected.png`,
        },
      },
      null,
      2
    )}\n`,
    'utf8'
  );
});

test('Section Planner exports examples without inventing proof or runtime behavior', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/tools/section-planner');
  await expect(page.getByRole('heading', { name: 'Section Planner', level: 1 })).toBeVisible();
  await expect(
    page.getByText(/planning prompts, not implementation or verified proof/i)
  ).toBeVisible();
  await expect(page.getByText('Section Mix Guide', { exact: true })).toBeVisible();
  const copyButton = page.getByRole('button', { name: 'Copy Section Graph JSON' });
  await expect(copyButton).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export Section Graph JSON' })).toHaveCount(0);

  const objectives = [
    { name: 'B2B SaaS Conversion Landing', id: 'saas-conversion' },
    { name: 'Developer Documentation Hub', id: 'developer-platform' },
    { name: 'Fintech Analytics Cockpit', id: 'fintech-analytics' },
    { name: 'Luxury Editorial Sanctuary', id: 'luxury-marketplace' },
    { name: 'Operational Triage & Admin Tool', id: 'internal-tool' },
  ];
  await expect(page.getByRole('button', { name: objectives[0]!.name, exact: true })).toBeEnabled();
  const output: Array<{ objective: string; project: string; descriptions: string[] }> = [];
  for (const objective of objectives) {
    await page.getByRole('button', { name: objective.name, exact: true }).click();
    await expect(page.locator('pre')).toContainText(`"pageObjective": "${objective.id}"`);
    const manifestText = await page.locator('pre').innerText();
    const manifest = JSON.parse(manifestText) as {
      pageObjective: string;
      grammar: Array<{ description: string }>;
    };
    const descriptions = manifest.grammar.map((item) => item.description);
    const allText = await page.locator('main').innerText();
    expect(allText).not.toMatch(
      /SOC\s*2|SOC2|ISO\s*27001|enterprise customer logos|verified audit benchmarks|100\s*ms interval|100-point deterministic security audit|signed audit PDF|free tier, Pro workspace|zero-friction|real-time output|single-command CLI launch|immutable chronological event log|every system|no CSS conflicts/i
    );
    expect(manifest.pageObjective).toBe(objective.id);
    expect(descriptions.join('\n')).not.toMatch(
      /SOC\s*2|SOC2|ISO\s*27001|verified audit benchmarks|100\s*ms interval|signed audit PDF|free tier, Pro workspace|zero-friction|real-time output|single-command CLI launch|immutable chronological event log/i
    );
    expect(allText).not.toContain('Grammar Balance Telemetry');
    expect(allText).toContain('Section Mix Guide');
    expect(allText).not.toMatch(/\b1 sections\b/);
    output.push({ objective: objective.name, project: manifest.pageObjective, descriptions });
  }

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}`
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, 'section-planner.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    disclaimer: await page
      .getByText(/planning prompts, not implementation or verified proof/i)
      .innerText(),
    actionLabel: await copyButton.innerText(),
    output,
    runtime,
    screenshot,
  };
  await writeFile(
    path.join(evidenceDirectory, 'section-planner.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('Section Planner does not expose inert controls before its client is ready', async ({
  page,
}, testInfo) => {
  let releaseScripts!: () => void;
  const scriptsMayLoad = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route(/\.js(?:\?|$)/, async (route) => {
    await scriptsMayLoad;
    await route.continue();
  });

  await page.goto('/tools/section-planner', { waitUntil: 'commit' });
  const objectiveButton = page.getByRole('button', {
    name: 'Developer Documentation Hub',
    exact: true,
  });
  await expect(objectiveButton).toBeVisible();
  const loadingStatus = page.getByRole('status');
  await expect(loadingStatus).toContainText('Loading planner controls');
  await expect(objectiveButton).toBeDisabled();
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/after');
  await mkdir(evidenceDirectory, { recursive: true });
  const evidencePrefix = `section-planner-hydration-${testInfo.project.name}`;
  const screenshots = {
    loading: path.join(evidenceDirectory, `${evidencePrefix}-loading.png`),
    ready: path.join(evidenceDirectory, `${evidencePrefix}-ready.png`),
  };
  await page.screenshot({ path: screenshots.loading });

  releaseScripts();
  await page.waitForLoadState('load');
  await expect(objectiveButton).toBeEnabled();
  await expect(loadingStatus).toHaveCount(0);
  await objectiveButton.click();
  await expect(objectiveButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('pre')).toContainText('"pageObjective": "developer-platform"');
  await page.screenshot({ path: screenshots.ready });
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    scriptLoadHeld: true,
    loading: {
      status: 'Loading planner controls…',
      objectiveControlDisabled: true,
    },
    ready: {
      objectiveControlEnabled: true,
      selectedObjective: 'developer-platform',
    },
    screenshots,
  };
  const evidencePath = path.join(evidenceDirectory, `${evidencePrefix}.json`);
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Section Planner hydration interaction evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });
});

test('Typography Lab keeps controls unavailable until its client is ready', async ({ page }, testInfo) => {
  let releaseIsland: (() => void) | undefined;
  let markIslandRequest: (() => void) | undefined;
  const islandGate = new Promise<void>((resolve) => {
    releaseIsland = resolve;
  });
  const islandRequest = new Promise<void>((resolve) => {
    markIslandRequest = resolve;
  });

  await page.route(/TypographyLab/i, async (route) => {
    markIslandRequest?.();
    await islandGate;
    await route.continue();
  });
  await page.goto('/tools/typography', { waitUntil: 'domcontentloaded' });

  const sampleTab = page.getByRole('button', { name: 'Tabular Figure Sample', exact: true });
  await expect(sampleTab).toBeVisible();
  await islandRequest;
  await expect(page.getByRole('button', { name: 'Copy Scale CSS' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
  await expect(page.getByRole('slider', { name: 'Base body size' })).toBeDisabled();
  for (const checkbox of await page.getByRole('checkbox').all()) {
    await expect(checkbox).toBeDisabled();
  }

  const evidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v62-copy-2026-10-31/public-v45/interaction-readiness/after-local'
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  await page.screenshot({ path: path.join(evidenceDirectory, `${viewport}-pre-hydration.png`) });

  try {
    await expect(sampleTab).toBeDisabled();
    await expect(page.getByText('Preparing typography controls…', { exact: true })).toBeVisible();
  } finally {
    releaseIsland?.();
  }

  await expect(sampleTab).toBeEnabled();
  await sampleTab.click();
  await expect(sampleTab).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByText(
      'Illustrative sample data for comparing numeral alignment; these values are not live metrics.',
      { exact: true }
    )
  ).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDirectory, `${viewport}-hydrated.png`) });
});

test('Typography Lab shows truthful, responsive type specimens', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied = text;
        },
        readText: async () => copied,
      },
    });
  });
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  const response = await page.goto('/tools/typography');
  await expect(page.getByRole('heading', { name: 'Typography Lab', level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /typographic scales, font-pairing previews, numeric samples, and OpenType feature settings/i
  );
  const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(
    process.cwd(),
    `quality/evidence/step-39/public-v62-copy-2026-10-31/after/${viewport}`
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshots = {
    hierarchy: path.join(evidenceDirectory, 'typography-lab.png'),
    numbers: path.join(evidenceDirectory, 'typography-specimen.png'),
    fluidScale: path.join(evidenceDirectory, 'typography-fluid-scale.png'),
  };
  await page.screenshot({ path: screenshots.hierarchy, fullPage: true });

  const main = page.locator('main');
  await expect(main.getByText(/zero cognitive strain/i)).toHaveCount(0);
  await expect(main.getByText('Status Indicator AA', { exact: false })).toHaveCount(0);
  await expect(main.getByText('MEASURED METRIC', { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tabular Figure Sample', exact: true }).click();
  await expect(main.getByText(/Illustrative sample data.*not live metrics/i)).toBeVisible();
  await expect(main.getByText(/asset id|settlement|latency|£1,420,890/i)).toHaveCount(0);
  const sampleTable = page.getByRole('table', { name: 'Illustrative numeric sample records' });
  const sampleCards = page.getByRole('list', { name: 'Illustrative numeric sample records' });
  if (viewport === 'mobile') {
    await expect(sampleCards).toBeVisible();
    await expect(sampleCards.getByRole('listitem')).toHaveCount(4);
    await expect(sampleTable).toBeHidden();
  } else {
    await expect(sampleTable).toBeVisible();
    await expect(sampleCards).toBeHidden();
  }
  await page.screenshot({ path: screenshots.numbers, fullPage: true });

  await page.getByRole('button', { name: 'Hierarchical Scale Ladder', exact: true }).click();
  await page.getByRole('button', { name: 'Golden Ratio' }).click();
  const layout = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('main h1')].find((node) =>
      node.textContent?.includes('A product, shaped by people.')
    );
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      headingFontSize: heading ? getComputedStyle(heading).fontSize : null,
    };
  });
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  await expect(main.getByText('110px max', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy Scale CSS', exact: true }).click();
  const copiedCss = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedCss).toContain('--font-size-h1: clamp(36px, 7.64vw, 110px)');
  await page.screenshot({ path: screenshots.fluidScale, fullPage: true });

  page.removeAllListeners('console');
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const seriousAccessibilityViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? '')
  );
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    status: response?.status() ?? null,
    layout,
    copiedCss,
    accessibility: {
      totalViolations: accessibility.violations.length,
      seriousOrCritical: seriousAccessibilityViolations.map(({ id, impact, description }) => ({
        id,
        impact,
        description,
      })),
    },
    runtime,
    screenshots,
  };
  await writeFile(
    path.join(evidenceDirectory, 'typography-lab.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8'
  );
  expect(seriousAccessibilityViolations).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('Accessibility Lab describes the limited checks it performs', async ({ page }, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/accessibility');
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Accessibility Lab', level: 1 })).toBeVisible();
  await expect(main.getByText('Three checks · Not a full audit', { exact: true })).toBeVisible();
  await expect(main.getByText('WCAG 2.2 AA Baseline Guaranteed', { exact: true })).toHaveCount(0);
  await expect(main.getByText(/reduced-motion fallbacks/i)).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Check colour contrast, focus-ring dimensions, and minimum touch-target size/i
  );
  await captureToolEvidence(
    page,
    testInfo,
    'accessibility-lab-copy',
    response?.status() ?? null,
    runtime
  );
});

test('Data Visualisation Styler describes sample recipes and its SVG output', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/dataviz');
  const main = page.locator('main');
  await expect(
    page.getByRole('heading', { name: 'Data Visualisation Styler', level: 1 })
  ).toBeVisible();
  await expect(main.getByText(/Tune sample chart recipes.*copy the rendered SVG/i)).toBeVisible();
  await expect(
    main.getByText(/project Design DNA|responsive curves|WCAG contrast|100ms/i)
  ).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Adjust sample chart recipes and copy the rendered SVG/i
  );
  await captureToolEvidence(page, testInfo, 'dataviz-copy', response?.status() ?? null, runtime);
});

test('Motion Studio labels its sequence as examples instead of measured results', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/motion');
  await waitForHydration(page);
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Motion Studio', level: 1 })).toBeVisible();
  await expect(main.getByText(/Example architecture review/)).toBeVisible();
  await expect(main.getByText(/Example token check/)).toBeVisible();
  await expect(main.getByText('20/20 PASS', { exact: true })).toHaveCount(0);
  await expect(
    main.getByText(/cryptographic|latency SLA|38ms OPTIMAL|telemetry sync/i)
  ).toHaveCount(0);
  await expect(main.getByText('SAMPLE', { exact: true })).toHaveCount(3);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Compare easing curves, spring settings, stagger timing, and reduced-motion examples/i
  );
  await captureToolEvidence(
    page,
    testInfo,
    'motion-studio-copy',
    response?.status() ?? null,
    runtime
  );
});

test('Background Studio labels its sample and disables unconnected preview controls', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/backgrounds');
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Background Studio', level: 1 })).toBeVisible();
  await expect(main.getByText(/static preview helps compare text and controls/i)).toBeVisible();
  await expect(main.getByText('Telemetry Node', { exact: true })).toHaveCount(0);
  await expect(main.getByText('HEALTH 99.8%', { exact: true })).toHaveCount(0);
  await expect(main.getByText(/example controls are shown for layout only/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dismiss sample' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Acknowledge sample' })).toBeDisabled();
  await captureToolEvidence(
    page,
    testInfo,
    'background-studio-copy',
    response?.status() ?? null,
    runtime
  );
});

test('Palette Studio limits claims to calculated pairs and disclosed sample data', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/palette');
  await waitForHydration(page);
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Palette Studio', level: 1 })).toBeVisible();
  await expect(
    main.getByText(/inspect calculated contrast for selected colour pairs/i)
  ).toBeVisible();
  await expect(main.getByText(/accessible palette tokens with live wcag/i)).toHaveCount(0);
  await expect(main.getByText(/real-time token rendering proof/i)).toHaveCount(0);
  await expect(main.getByText('Sample value: 1,284', { exact: true })).toBeVisible();
  await expect(main.getByText(/static sample, not a live product screen/i)).toBeVisible();
  await expect(
    main.getByText(
      /These calculations cover the listed token pairs; they do not certify a full interface/i
    )
  ).toBeVisible();
  await expect(main.getByText(/£|Institutional Ledger Card/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Try sample action' }).click();
  await expect(main.getByRole('status')).toContainText('No transaction was submitted');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Set semantic colour tokens and inspect calculated contrast/i
  );
  await captureToolEvidence(
    page,
    testInfo,
    'palette-studio-copy',
    response?.status() ?? null,
    runtime
  );
});

test('Tools directory descriptions match each tool’s current output', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools');
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Ten Interface Tools.', level: 1 })).toBeVisible();
  await expect(
    main.getByText(
      /stress-test|WCAG reduced motion|WCAG 2\.2 AA and AAA|APCA|ultra-fast latency|rapid conversion drive|dense telemetry typesetting|project Design DNA/i
    )
  ).toHaveCount(0);
  await expect(main.getByText(/adjust a responsive wireframe preview/i)).toBeVisible();
  await expect(
    main.getByText(/inspect calculated contrast for selected colour pairs/i)
  ).toBeVisible();
  await expect(main.getByText(/check selected colour contrast/i)).toBeVisible();
  await captureToolEvidence(page, testInfo, 'tools-hub-copy', response?.status() ?? null, runtime);
});

test('Design DNA Lab labels parsed values and sample code without fabricated metrics', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/dna');
  await waitForHydration(page);
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Design DNA Lab', level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /adjust 28 numeric dimensions, mix feel descriptors, and inspect inheritance examples/i
  );
  await expect(
    main.getByText(
      /zero distraction|ultra-fast latency|rapid conversion drive|rock-solid security proof|zero decorative overhead|safety-critical ergonomics/i
    )
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Feel Mixer' }).click();
  await expect(main.getByText('Feel Mapping Details', { exact: true })).toBeVisible();
  await expect(main.getByText(/Parser Telemetry/i)).toHaveCount(0);
  await page.getByRole('button', { name: 'Typography (16)' }).click();
  await expect(
    main.getByText('const feel = "professional but playful";', { exact: true })
  ).toHaveCount(16);
  await expect(main.getByText(/dnaScore|latency\s*4\.2ms/i)).toHaveCount(0);
  await captureToolEvidence(page, testInfo, 'dna-lab-copy', response?.status() ?? null, runtime);
});

test('Layout Composer describes its schematic preview and copied snippets accurately', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/tools/layout');
  await waitForHydration(page);
  const main = page.locator('main');
  await expect(page.getByRole('heading', { name: 'Layout Composer', level: 1 })).toBeVisible();
  await expect(
    main.getByText(/Adjust container and grid settings, inspect a responsive wireframe preview/i)
  ).toBeVisible();
  await expect(main.getByText('WIREFRAME PREVIEW', { exact: true })).toBeVisible();
  await expect(
    main.getByText(/Schematic preview.*does not run or test a generated page/i)
  ).toBeVisible();
  await expect(main.getByText(/stress-test|PORT SIMULATION/i)).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /responsive wireframe preview, and copy a CSS or Tailwind layout snippet/i
  );
  await page.getByRole('button', { name: 'Mobile preview (375px)' }).click();
  await expect(page.getByRole('button', { name: 'Mobile preview (375px)' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await captureToolEvidence(
    page,
    testInfo,
    'layout-composer-copy',
    response?.status() ?? null,
    runtime
  );
});

test('CLI documentation matches the private package and required command syntax', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);

  const cliResponse = await page.goto('/docs/cli');
  const cliMain = page.locator('main');
  await expect(
    page.getByRole('heading', { name: 'Tessellate CLI (`tess`)', level: 1 })
  ).toBeVisible();
  const cliText = await cliMain.innerText();
  expect(cliText).toContain('private workspace CLI');
  expect(cliText).toContain('pnpm --filter @tessellate/cli build');
  expect(cliText).toContain('node packages/cli/dist/index.cjs --help');
  expect(cliText).toContain('tess validate <file>');
  expect(cliText).not.toMatch(
    /pnpm add -g @tessellate\/cli|npx @tessellate\/cli|tess validate \[path\]/
  );
  await captureToolEvidence(
    page,
    testInfo,
    'cli-reference',
    cliResponse?.status() ?? null,
    runtime
  );
});

test('MCP documentation describes local use and heuristic limitations', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  const mcpResponse = await page.goto('/docs/mcp');
  const mcpMain = page.locator('main');
  await expect(
    page.getByRole('heading', { name: 'Model Context Protocol (MCP)', level: 1 })
  ).toBeVisible();
  const mcpText = await mcpMain.innerText();
  expect(mcpText).toContain('local MCP client');
  expect(mcpText).toContain('lexical token overlap');
  expect(mcpText).toContain('Export generation does not install or build the result.');
  await captureToolEvidence(
    page,
    testInfo,
    'mcp-reference',
    mcpResponse?.status() ?? null,
    runtime
  );
});
