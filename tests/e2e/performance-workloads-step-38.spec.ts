import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const exactBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('real discovery, composition, handoff and recompose workload stays responsive', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'The preview iframe and runtime measurements require the ChatGPT Sites compatibility Worker.'
  );

  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    browserCancellations: [] as Array<{
      url: string;
      error: string | null;
      parentUrl: string;
      frameUrl: string | null;
      phase: string;
    }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
    previewPolicies: [] as Array<{ url: string; status: number; policy: string | null }>,
    cspViolationEvents: [] as Array<{
      frameUrl: string;
      violatedDirective: string;
      blockedURI: string;
      originalPolicy: string;
      sample: string;
      sourceFile: string;
      lineNumber: number;
      targetStyleText: string | null;
      styleTextsAtViolation: string[];
      headMarkupAtViolation: string;
      styleInsertionsAtViolation: Array<{ text: string; stack: string }>;
    }>,
    inlineStyles: [] as Array<{
      frameUrl: string;
      text: string;
      sha256: string;
      astroIslandDisplay: string | null;
    }>,
  };
  let phase = 'catalogue-search';
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const frames = page
        .frames()
        .map((frame) => frame.url())
        .join(', ');
      runtime.consoleErrors.push(
        `${message.text()} | phase=${phase} | source=${JSON.stringify(message.location())} | page=${page.url()} | frames=${frames}`
      );
    }
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = { url: request.url(), error: request.failure()?.errorText ?? null };
    if (/^(?:net::ERR_ABORTED|Load request cancelled)$/i.test(failure.error ?? '')) {
      let frameUrl: string | null = null;
      try {
        frameUrl = request.frame().url();
      } catch {
        // Detached frames can no longer expose their URL; the cancellation is still recorded.
      }
      runtime.browserCancellations.push({ ...failure, parentUrl: page.url(), frameUrl, phase });
    } else {
      runtime.failedRequests.push(failure);
    }
  });
  page.on('response', (response) => {
    if (response.url().includes('/preview-content/?resource=')) {
      runtime.previewPolicies.push({
        url: response.url(),
        status: response.status(),
        policy: response.headers()['content-security-policy'] ?? null,
      });
    }
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  await page.addInitScript(() => {
    const target = window as Window & {
      __step38CspViolations?: Array<{
        violatedDirective: string;
        blockedURI: string;
        originalPolicy: string;
        sample: string;
        sourceFile: string;
        lineNumber: number;
        targetStyleText: string | null;
        styleTextsAtViolation: string[];
        headMarkupAtViolation: string;
        styleInsertionsAtViolation: Array<{ text: string; stack: string }>;
      }>;
      __step38StyleInsertions?: Array<{ text: string; stack: string }>;
    };
    target.__step38CspViolations = [];
    target.__step38StyleInsertions = [];
    const textContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    const createElement = Document.prototype.createElement;
    Document.prototype.createElement = function (tagName, options) {
      const element = createElement.call(this, tagName, options);
      if (tagName.toLowerCase() === 'style' && textContent?.get && textContent.set) {
        Object.defineProperty(element, 'textContent', {
          configurable: true,
          get: () => textContent.get?.call(element) ?? null,
          set: (value) => {
            target.__step38StyleInsertions?.push({
              text: String(value),
              stack: new Error().stack ?? '',
            });
            textContent.set?.call(element, value);
          },
        });
      }
      return element;
    };
    const appendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function <T extends Node>(node: T): T {
      if (this instanceof HTMLStyleElement) {
        target.__step38StyleInsertions?.push({
          text: `${this.textContent ?? ''}${node.textContent ?? ''}`,
          stack: new Error().stack ?? '',
        });
      }
      return appendChild.call(this, node) as T;
    };
    window.addEventListener('securitypolicyviolation', (event) => {
      target.__step38CspViolations?.push({
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        originalPolicy: event.originalPolicy,
        sample: event.sample,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        targetStyleText: event.target instanceof HTMLStyleElement ? event.target.textContent : null,
        styleTextsAtViolation: [...document.querySelectorAll('style')].map(
          (style) => style.textContent ?? ''
        ),
        headMarkupAtViolation: document.head.innerHTML.slice(0, 2_000),
        styleInsertionsAtViolation: target.__step38StyleInsertions ?? [],
      });
    });
  });
  const interactions: Record<string, number> = {};
  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const searchStartedAt = Date.now();
  await page.getByLabel('Search catalogue').fill('onboarding');
  await expect(
    page.getByRole('link', { name: 'Onboarding Role Select', exact: true })
  ).toBeVisible();
  const firstPreview = page.frameLocator('iframe[title="Onboarding Role Select actual preview"]');
  await expect(firstPreview.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
  interactions.catalogueSearchAndFirstPreviewMs = Date.now() - searchStartedAt;
  expect(interactions.catalogueSearchAndFirstPreviewMs).toBeLessThan(5_000);
  if ((page.viewportSize()?.width ?? 1440) < 640) {
    const mobileActions = page
      .locator('iframe[title="Onboarding Role Select actual preview"]')
      .locator('xpath=..')
      .locator('div.absolute.inset-x-0.bottom-0');
    const previewObscuringFilter = await mobileActions.evaluate(
      (element) => getComputedStyle(element).backdropFilter
    );
    expect(previewObscuringFilter).toBe('none');
    const actionBarBounds = await mobileActions.boundingBox();
    expect(actionBarBounds?.height).toBeLessThan(80);
  }
  await page.screenshot({
    path: path.resolve(
      process.cwd(),
      `quality/evidence/step-38/after/workload-explore-${testInfo.project.name}.png`
    ),
    fullPage: false,
  });
  for (const frame of page.frames()) {
    const frameUrl = frame.url();
    if (!frameUrl.includes('/preview/')) continue;
    const diagnostics = await frame
      .evaluate(() => ({
        violations:
          (
            window as Window & {
              __step38CspViolations?: Array<{
                violatedDirective: string;
                blockedURI: string;
                originalPolicy: string;
                sample: string;
                sourceFile: string;
                lineNumber: number;
                targetStyleText: string | null;
                styleTextsAtViolation: string[];
                headMarkupAtViolation: string;
                styleInsertionsAtViolation: Array<{ text: string; stack: string }>;
              }>;
              __step38StyleInsertions?: Array<{ text: string; stack: string }>;
            }
          ).__step38CspViolations ?? [],
        inlineStyles: [...document.querySelectorAll('style')].map(
          (style) => style.textContent ?? ''
        ),
        astroIslandDisplay: document.querySelector('astro-island')
          ? getComputedStyle(document.querySelector('astro-island') as HTMLElement).display
          : null,
      }))
      .catch(() => ({ violations: [], inlineStyles: [] }));
    runtime.cspViolationEvents.push(
      ...diagnostics.violations.map((violation) => ({ frameUrl, ...violation }))
    );
    runtime.inlineStyles.push(
      ...diagnostics.inlineStyles.map((text) => ({
        frameUrl,
        text,
        sha256: `'sha256-${createHash('sha256').update(text).digest('base64')}'`,
        astroIslandDisplay: diagnostics.astroIslandDisplay,
      }))
    );
  }

  phase = 'compose-route';
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  phase = 'composition';
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined' }).click();
  await page.getByRole('button', { name: 'Radical' }).click();
  const compositionStartedAt = Date.now();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3, {
    timeout: 30_000,
  });
  for (const number of ['01', '02', '03']) {
    await expect(page.locator(`[data-testid="direction-preview-${number}"]`)).toBeVisible();
  }
  interactions.threeDirectionCompositionMs = Date.now() - compositionStartedAt;
  expect(interactions.threeDirectionCompositionMs).toBeLessThan(8_000);
  await page.screenshot({
    path: path.resolve(
      process.cwd(),
      `quality/evidence/step-38/after/workload-compose-${testInfo.project.name}.png`
    ),
    fullPage: false,
  });

  phase = 'workbench-handoff';
  await page.getByTestId('open-workbench-dir-03').click();
  const workbenchStartedAt = Date.now();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.locator('.tess-screen').first()).toBeVisible();
  phase = 'workbench-recompose';
  interactions.directionCWorkbenchReadyMs = Date.now() - workbenchStartedAt;
  expect(interactions.directionCWorkbenchReadyMs).toBeLessThan(5_000);

  const recomposeStartedAt = Date.now();
  await page.getByTestId('recompose-button').click();
  await expect(page.getByRole('status').filter({ hasText: /Recomposed/ })).toBeVisible({
    timeout: 15_000,
  });
  interactions.recomposeVisibleResultMs = Date.now() - recomposeStartedAt;
  expect(interactions.recomposeVisibleResultMs).toBeLessThan(5_000);
  // Let the canvas finish its short visual transition before capturing the settled UI.
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.resolve(
      process.cwd(),
      `quality/evidence/step-38/after/workload-workbench-${testInfo.project.name}.png`
    ),
    fullPage: false,
  });

  const exportStartedAt = Date.now();
  phase = 'standalone-export';
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-menu')).toBeVisible();
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByTestId('export-zip-btn').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (!downloadPath)
    throw new Error('The standalone ZIP download did not produce a local artifact.');
  interactions.standaloneZipReadyMs = Date.now() - exportStartedAt;
  expect(download.suggestedFilename()).toMatch(/\.zip$/i);
  expect(interactions.standaloneZipReadyMs).toBeLessThan(15_000);
  interactions.standaloneZipBytes = (await stat(downloadPath)).size;

  if (runtime.consoleErrors.length > 0) {
    await testInfo.attach('preview CSP diagnostics', {
      body: Buffer.from(
        JSON.stringify(
          { previewPolicies: runtime.previewPolicies, consoleErrors: runtime.consoleErrors },
          null,
          2
        )
      ),
      contentType: 'application/json',
    });
  }

  const evidence = {
    capturedAt: new Date().toISOString(),
    method:
      'Visible Playwright UI workflow on the local ChatGPT Sites compatibility Worker preview, unthrottled laptop CPU/network. Timings run from user action to visible completion; they are lab observations, not field metrics.',
    viewport: page.viewportSize(),
    browserProject: testInfo.project.name,
    url: page.url(),
    interactions,
    runtime,
    screenshots: [
      `quality/evidence/step-38/after/workload-explore-${testInfo.project.name}.png`,
      `quality/evidence/step-38/after/workload-compose-${testInfo.project.name}.png`,
      `quality/evidence/step-38/after/workload-workbench-${testInfo.project.name}.png`,
    ],
  };
  const output = path.resolve(
    process.cwd(),
    `quality/evidence/step-38/after/workload-interactions-${testInfo.project.name}.json`
  );
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('workload interaction timings', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  // Persist the complete browser record before asserting so a failed audit still
  // leaves machine-readable evidence with its screenshots and response policies.
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
