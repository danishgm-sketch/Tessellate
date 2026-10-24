import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { GOLD_40_SLUGS } from '../../packages/catalog/src/gold';

type CatalogResource = {
  slug: string;
  name: string;
  variants: Array<{ id: string; name: string }>;
  interactionDNA: { keyboardComplexity: 'low' | 'medium' | 'high'; directManipulation: boolean };
};

type BrowserFinding = {
  type: 'console-error' | 'page-error' | 'failed-request' | 'http-error' | 'overflow' | 'preview-error' | 'test-error';
  detail: string;
  viewport?: number;
  variant?: string;
};

const catalogPath = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
const catalogResources = (JSON.parse(readFileSync(catalogPath, 'utf8')) as { resources: CatalogResource[] }).resources;
const requestedSlugs = process.env.TESS_RESOURCE_SLUG?.split(',').map((slug) => slug.trim()).filter(Boolean);
const selectedGoldSlugs = requestedSlugs ? GOLD_40_SLUGS.filter((slug) => requestedSlugs.includes(slug)) : GOLD_40_SLUGS;
const unknownRequestedSlugs = requestedSlugs?.filter((slug) => !catalogResources.some((resource) => resource.slug === slug)) ?? [];
if (unknownRequestedSlugs.length > 0) {
  throw new Error(`Unknown catalogue resource slug(s): ${unknownRequestedSlugs.join(', ')}.`);
}
const goldResources = selectedGoldSlugs.map((slug) => {
  const resource = catalogResources.find((entry) => entry.slug === slug);
  if (!resource) throw new Error(`Gold resource "${slug}" is missing from the canonical catalogue.`);
  return resource;
});
const viewportWidths = [360, 390, 430, 768, 1024, 1280, 1440];

async function waitForActualResource(
  frame: import('@playwright/test').FrameLocator,
  slug: string,
  variantId?: string,
) {
  const resourceNode = frame.locator(`[data-node-id="preview-${slug}"]`);
  await expect(resourceNode).toHaveCount(1, { timeout: 15000 });
  if (variantId) await expect(resourceNode).toHaveAttribute('data-resource-variant', variantId, { timeout: 15000 });
  // The preview host intentionally shows a loading status while the actual
  // resource's split chunk is loading. Wait for that status to leave the DOM
  // before classifying the preview body; a slow CI runner can expose the
  // transient state after the screen wrapper has appeared.
  await expect(frame.getByText('Loading the actual resource…', { exact: true })).toHaveCount(0, { timeout: 15000 });
}

test('Gold resources render at every certified width and each declared variant', async ({ page }, testInfo) => {
  test.skip(Boolean(requestedSlugs) && selectedGoldSlugs.length === 0, 'TESS_RESOURCE_SLUG selected no Gold resources.');
  // This one Chromium run explicitly drives every required width. The separate
  // mobile project covers touch/mobile-shell behavior in the regular E2E suite.
  test.skip(testInfo.project.name !== 'sites-chromium', 'This matrix runs against the Sites Worker preview boundary.');
  test.setTimeout(15 * 60 * 1000);

  const outputDir = path.resolve(process.cwd(), 'test-results/resource-certification/gold-40');
  mkdirSync(outputDir, { recursive: true });

  const records: Array<{
    slug: string;
    url?: string;
    widths: number[];
    variants: string[];
    keyboard: {
      enabledButtons: number;
      disabledButtons: number;
      tabNavigation: boolean;
      visibleFocus: boolean;
      enterActivated: boolean;
      visibleResponse: boolean;
      nativeControls: number;
      nativeControlTabNavigation: boolean;
      nativeControlFocusVisible: boolean;
    };
    findings: BrowserFinding[];
    screenshots: string[];
  }> = [];
  let activeRecord: (typeof records)[number] | undefined;

  page.on('console', (message) => {
    if (message.type() === 'error' && activeRecord) {
      activeRecord.findings.push({ type: 'console-error', detail: message.text() });
    }
  });
  page.on('pageerror', (error) => {
    activeRecord?.findings.push({ type: 'page-error', detail: error.message });
  });
  page.on('requestfailed', (request) => {
    activeRecord?.findings.push({
      type: 'failed-request',
      detail: `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`,
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      activeRecord?.findings.push({
        type: 'http-error',
        detail: `${response.status()} ${response.url()}`,
      });
    }
  });

  for (const resource of goldResources) {
    const record = {
      slug: resource.slug,
      widths: viewportWidths,
      variants: resource.variants.map((variant) => variant.id),
      keyboard: {
        enabledButtons: 0,
        disabledButtons: 0,
        tabNavigation: false,
        visibleFocus: false,
        enterActivated: false,
        visibleResponse: false,
        nativeControls: 0,
        nativeControlTabNavigation: false,
        nativeControlFocusVisible: false,
      },
      findings: [] as BrowserFinding[],
      screenshots: [] as string[],
    };
    activeRecord = record;

    try {
      const response = await page.goto(`/resources/${resource.slug}/`, { waitUntil: 'domcontentloaded' });
      record.url = page.url();
      if (!response?.ok()) {
        record.findings.push({ type: 'http-error', detail: `Resource page returned ${response?.status() ?? 'no response'}.` });
        records.push(record);
        continue;
      }

      await expect(page.getByRole('heading', { level: 1, name: resource.name })).toBeVisible();
      const preview = page.locator('iframe[title$=" live preview"]');
      await expect(preview).toHaveCount(1);
      const sandbox = await preview.getAttribute('sandbox');
      if (!sandbox?.split(/\s+/).includes('allow-scripts') || sandbox.split(/\s+/).includes('allow-same-origin')) {
        record.findings.push({ type: 'preview-error', detail: `Preview iframe sandbox is not the expected isolated script-only mode: ${sandbox}.` });
      }

      const frame = page.frameLocator('iframe[title$=" live preview"]');
      await waitForActualResource(frame, resource.slug, resource.variants[0]?.id);
      const initialBody = await frame.locator('body').innerText();
      if (/Preview failed:|missing-resource-recovery|No component registered|Loading the actual resource/i.test(initialBody)) {
        record.findings.push({ type: 'preview-error', detail: initialBody.slice(0, 400) });
      }
      const initialVisibleCount = await frame.locator('body').evaluate((body) =>
        [...body.querySelectorAll('*')].filter((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
        }).length
      );
      if (initialVisibleCount === 0) record.findings.push({ type: 'preview-error', detail: 'Preview rendered no visible content.' });

      if (resource.variants.length === 0) {
        record.findings.push({ type: 'preview-error', detail: 'Gold resource has no declared variants.' });
      }

      for (const [variantIndex, variant] of resource.variants.entries()) {
        const variantButton = page.getByRole('button', { name: variant.name, exact: true });
        await expect(variantButton).toBeVisible();
        await variantButton.click();
        const src = await preview.getAttribute('src');
        if (!src || new URL(src, page.url()).searchParams.get('variant') !== variant.id) {
          record.findings.push({
            type: 'preview-error',
            detail: `Selecting "${variant.name}" did not update the preview to variant "${variant.id}".`,
            variant: variant.id,
          });
        }
        await waitForActualResource(frame, resource.slug, variant.id);
        const bodyText = await frame.locator('body').innerText();
        if (/Preview failed:|missing-resource-recovery|No component registered|Loading the actual resource/i.test(bodyText)) {
          record.findings.push({ type: 'preview-error', detail: bodyText.slice(0, 400), variant: variant.id });
        }

        for (const width of viewportWidths) {
          await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
          await page.waitForTimeout(60);
          const dimensions = await frame.locator('html').evaluate((html) => ({
            innerWidth: window.innerWidth,
            clientWidth: html.clientWidth,
            scrollWidth: html.scrollWidth,
          }));
          if (dimensions.scrollWidth > dimensions.clientWidth + 2) {
            record.findings.push({
              type: 'overflow',
              detail: `Preview document scroll width ${dimensions.scrollWidth}px exceeds viewport ${dimensions.clientWidth}px.`,
              viewport: width,
              variant: variant.id,
            });
          }

          if (variantIndex === 0 && (width === 360 || width === 390 || width === 1440)) {
            const screenshotPath = path.join(outputDir, `${resource.slug}-${width}.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }

          if (variantIndex === 0 && width === 1440) {
            record.keyboard.enabledButtons = await frame.locator('button:visible:not([disabled])').count();
            record.keyboard.disabledButtons = await frame.locator('button:visible:disabled').count();
            const nativeControlSelector = 'input:visible:not([disabled]), select:visible:not([disabled]), textarea:visible:not([disabled])';
            const nativeControls = frame.locator(nativeControlSelector);
            record.keyboard.nativeControls = await nativeControls.count();
            if (record.keyboard.nativeControls > 0) {
              const firstNativeControl = nativeControls.first();
              await page.getByRole('button', { name: variant.name, exact: true }).first().focus();
              let nativeControlFocused = false;
              for (let tab = 0; tab < 24 && !nativeControlFocused; tab += 1) {
                await page.keyboard.press('Tab');
                nativeControlFocused = await firstNativeControl.evaluate((element) => element === document.activeElement);
              }
              record.keyboard.nativeControlTabNavigation = nativeControlFocused;
              if (!nativeControlFocused) {
                record.findings.push({ type: 'preview-error', detail: 'Tab navigation could not reach the first enabled native form control.', viewport: width, variant: variant.id });
              } else {
                const focusState = await firstNativeControl.evaluate((element) => {
                  const style = getComputedStyle(element);
                  const hasOutline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0;
                  return {
                    keyboardFocus: element.matches(':focus-visible'),
                    visibleIndicator: hasOutline || style.boxShadow !== 'none',
                  };
                });
                record.keyboard.nativeControlFocusVisible = focusState.keyboardFocus && focusState.visibleIndicator;
                if (!record.keyboard.nativeControlFocusVisible) {
                  record.findings.push({ type: 'preview-error', detail: 'Keyboard-focused native form control has no visible focus indicator.', viewport: width, variant: variant.id });
                }

              }
            }
            const buttonIndex = resource.slug === 'two-pane-master-detail-shell' || resource.slug === 'split-product-hero' ? 1 : 0;
            const firstButton = frame.locator('button:visible:not([disabled])').nth(buttonIndex);
            if (record.keyboard.enabledButtons > 0) {
              await firstButton.evaluate((element) => {
                element.addEventListener('click', () => {
                  const count = Number(document.documentElement.dataset.keyboardClickCount ?? '0');
                  document.documentElement.dataset.keyboardClickCount = String(count + 1);
                }, { once: true });
              });
              const beforeInteraction = await frame.locator('body').innerHTML();
              await page.getByRole('button', { name: variant.name, exact: true }).first().focus();
              let focused = false;
              for (let tab = 0; tab < 20 && !focused; tab += 1) {
                await page.keyboard.press('Tab');
                focused = await firstButton.evaluate((element) => element === document.activeElement);
              }
              record.keyboard.tabNavigation = focused;
              if (!focused) {
                record.findings.push({ type: 'preview-error', detail: 'Tab navigation could not reach the tested preview button.', viewport: width, variant: variant.id });
              } else {
                record.keyboard.visibleFocus = await firstButton.evaluate((element) => element.matches(':focus-visible'));
                if (!record.keyboard.visibleFocus) {
                  record.findings.push({ type: 'preview-error', detail: 'Keyboard-focused preview button has no visible focus indicator.', viewport: width, variant: variant.id });
                }
                const fadeRevealCard = resource.slug === 'fade-up-reveal'
                  ? frame.getByRole('heading', { name: 'Deterministic Fade-Up Reveal' }).locator('xpath=../..')
                  : null;
                await firstButton.press('Enter');
                await expect.poll(() => frame.locator('html').getAttribute('data-keyboard-click-count')).toBe('1');
                record.keyboard.enterActivated = true;
                if (resource.slug === 'two-pane-master-detail-shell') {
                  await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
                  await expect(frame.getByRole('heading', { name: 'Incident Details (ID: 2)' })).toBeVisible();
                  record.keyboard.visibleResponse = true;
                } else if (resource.slug === 'split-product-hero') {
                  await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
                  await expect(frame.getByText('Validated resource references and editable content.', { exact: true })).toBeVisible();
                  record.keyboard.visibleResponse = true;
                } else if (resource.slug === 'fade-up-reveal') {
                  await expect(fadeRevealCard).not.toBeNull();
                  await expect.poll(() => fadeRevealCard!.evaluate((element) => element.classList.contains('opacity-0'))).toBe(true);
                  await frame.locator('body').evaluate(() => new Promise((resolve) => window.setTimeout(resolve, 350)));
                  await expect.poll(() => fadeRevealCard!.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.05);
                  await expect.poll(() => fadeRevealCard!.evaluate((element) => element.classList.contains('opacity-100'))).toBe(true);
                  await expect.poll(() => fadeRevealCard!.evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1);
                  await page.emulateMedia({ reducedMotion: 'reduce' });
                  await firstButton.press('Enter');
                  await expect(frame.getByRole('status')).toHaveText('Entrance animation skipped because reduced motion is enabled.');
                  await expect.poll(() => fadeRevealCard!.evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1);
                  await page.emulateMedia({ reducedMotion: 'no-preference' });
                  record.keyboard.visibleResponse = true;
                } else {
                  const expectedResponse: Record<string, string> = {
                    'marketing-nav-cta': 'Start action previewed.',
                    'pricing-three-tier': 'Free Core plan selected.',
                    'empty-workspace': 'Project creation previewed.',
                    'magnetic-button': 'Example action activated.',
                    'error-state': 'Retry action previewed.',
                  };
                  const expectedText = expectedResponse[resource.slug];
                  if (expectedText) {
                    await expect(frame.getByRole('status')).toHaveText(expectedText);
                    record.keyboard.visibleResponse = true;
                  } else {
                    await page.waitForTimeout(60);
                    record.keyboard.visibleResponse = beforeInteraction !== await frame.locator('body').innerHTML();
                  }
                }
                if (!record.keyboard.visibleResponse) {
                  record.findings.push({ type: 'preview-error', detail: 'Keyboard activation of the first enabled preview button produced no visible state change or feedback.', viewport: width, variant: variant.id });
                }
              }
            } else if (resource.interactionDNA.keyboardComplexity === 'high') {
              record.findings.push({ type: 'preview-error', detail: 'Resource declares high keyboard complexity but has no enabled preview button.', viewport: width, variant: variant.id });
            }
          }

        }
      }

      const motionToggle = page.getByTitle('Reduced Motion: OFF');
      await motionToggle.click();
      await expect(page.getByTitle('Reduced Motion: ON')).toBeVisible();
      await expect.poll(() => preview.getAttribute('src')).toMatch(/reducedMotion=true/);
      await expect.poll(() => frame.locator('[data-node-id]').first().getAttribute('class')).toContain('transition-none');
    } catch (cause) {
      record.findings.push({ type: 'test-error', detail: cause instanceof Error ? cause.message : String(cause) });
      console.error(`Gold browser certification failed for ${resource.slug}:`, record.findings);
      try {
        const screenshotPath = path.join(outputDir, `${resource.slug}-failure.png`);
        await page.screenshot({ path: screenshotPath, animations: 'disabled' });
        record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
      } catch {
        // A failed navigation may leave no document available to capture.
      }
    }

    records.push(record);
  }

  activeRecord = undefined;
  const reportPath = path.resolve(process.cwd(), 'test-results/resource-certification/gold-40.json');
  await import('node:fs/promises').then(({ writeFile }) => writeFile(reportPath, JSON.stringify({
    schemaVersion: '1.0.0',
    browserProject: testInfo.project.name,
    widths: viewportWidths,
    resourceCount: records.length,
    findings: records.reduce((sum, record) => sum + record.findings.length, 0),
    resources: records,
  }, null, 2)));

  const failures = records.flatMap((record) => record.findings.map((finding) => `${record.slug}: ${finding.type}: ${finding.detail}`));
  expect(failures, `Gold resource browser certification findings:\n${failures.join('\n')}`).toEqual([]);
});
