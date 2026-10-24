import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type CatalogResource = {
  slug: string;
  name: string;
  variants: Array<{ id: string; name: string }>;
};

type Finding = {
  type: 'console-error' | 'page-error' | 'failed-request' | 'http-error' | 'preview-error' | 'overflow' | 'responsive-content' | 'shell-layout' | 'dead-link' | 'dead-control' | 'accessibility' | 'test-error';
  detail: string;
  viewport?: number;
  variant?: string;
};

const catalogPath = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
const catalogResources = (JSON.parse(readFileSync(catalogPath, 'utf8')) as { resources: CatalogResource[] }).resources;
const requestedSlugs = process.env.TESS_RESOURCE_SLUG?.split(',').map((slug) => slug.trim()).filter(Boolean);
const resources = requestedSlugs ? catalogResources.filter((resource) => requestedSlugs.includes(resource.slug)) : catalogResources;
const certifiedWidths = [360, 390, 430, 768, 1024, 1280, 1440];
if (requestedSlugs && requestedSlugs.some((slug) => !resources.some((resource) => resource.slug === slug))) {
  const missing = requestedSlugs.filter((slug) => !resources.some((resource) => resource.slug === slug));
  throw new Error(`Unknown resource slug(s): ${missing.join(', ')}.`);
}

async function waitForActualResource(frame: import('@playwright/test').FrameLocator, slug: string, variantId?: string) {
  const resourceNode = frame.locator(`[data-node-id="preview-${slug}"]`);
  await expect(resourceNode).toHaveCount(1, { timeout: 15000 });
  if (variantId) await expect(resourceNode).toHaveAttribute('data-resource-variant', variantId, { timeout: 15000 });
  await expect(frame.getByText('Loading the actual resource…', { exact: true })).toHaveCount(0, { timeout: 15000 });
}

test('AI agent activity preview labels sample content and follows heading hierarchy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This preview runs against the Sites Worker isolation boundary.');

  const browserErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/r/ai-agent-activity-feed/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'AI Agent Activity Feed', exact: true })).toBeVisible();
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  await expect(preview.getByRole('heading', { level: 2, name: 'Example agent activity', exact: true })).toBeVisible();
  await expect(preview.getByText('Static sample data', { exact: true })).toBeVisible();
  await expect(preview.getByText(/real-time telemetry/i)).toHaveCount(0);
  const headingOrderResults: Array<{ tab: string; violations: string[] }> = [];
  for (const tab of ['Intent', 'Code', 'Variants', 'Anatomy', 'Accessibility', 'Performance', 'Dependencies', 'Versions']) {
    if (tab !== 'Intent') await page.getByRole('button', { name: tab, exact: true }).click();
    const axe = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
    headingOrderResults.push({ tab, violations: axe.violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`) });
  }

  expect(headingOrderResults.filter((result) => result.violations.length > 0)).toEqual([]);
  expect(browserErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/catalog-search-local');
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'ai-agent-activity-feed-after-1440x900.png'), animations: 'disabled' });
});

test('all catalogue resources render at every certified width in the Sites Worker', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This matrix runs against the Sites Worker preview boundary.');
  test.setTimeout(30 * 60 * 1000);

  const outputDir = path.resolve(process.cwd(), 'test-results/resource-certification/catalog-324');
  mkdirSync(outputDir, { recursive: true });
  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/resource-layout');
  mkdirSync(evidenceDir, { recursive: true });
  const responsiveFixes = new Set(['documentation-shell', 'floating-nav', 'webhook-management']);
  const navigationFixes = new Set(['app-sidebar-expanded', 'breadcrumb-header', 'centered-top-nav', 'collapsible-sidebar', 'floating-nav', 'footer-minimal', 'footer-sitemap', 'marketing-nav-cta', 'mega-nav', 'minimal-top-nav', 'mobile-drawer-nav', 'responsive-app-shell', 'transparent-solid-nav']);
  const responsiveEvidenceSlugs = new Set(['ai-agent-activity-feed', 'ai-prompt-hero', 'ai-source-citations', 'breadcrumb-header', 'command-first-nav', 'counter-typography', 'feature-tabs', 'floating-ai-assistant', 'gradient-accent-text', 'inline-ai-rewrite', 'integration-directory-preview', 'interactive-demo-hero', 'mega-nav', 'multi-series-line-chart']);
  const records: Array<{ slug: string; url?: string; variants: string[]; testedVariants: string[]; findings: Finding[]; screenshots: string[]; cancelledRequests: Array<{ method: string; url: string; reason: string }> }> = [];
  let activeRecord: (typeof records)[number] | undefined;
  let operationGeneration = 0;
  const operationReasons = new Map<number, string>();
  const requestOwners = new WeakMap<import('@playwright/test').Request, (typeof records)[number] | undefined>();
  const requestGenerations = new WeakMap<import('@playwright/test').Request, number>();
  const pendingByRecord = new WeakMap<(typeof records)[number], Set<import('@playwright/test').Request>>();
  const advanceOperation = (reason: string) => {
    operationGeneration += 1;
    operationReasons.set(operationGeneration, reason);
  };
  console.info(`[resource-certification] checking ${resources.length} resource(s)`);

  page.on('console', (message) => {
    if (message.type() === 'error') activeRecord?.findings.push({ type: 'console-error', detail: message.text() });
  });
  page.on('pageerror', (error) => activeRecord?.findings.push({ type: 'page-error', detail: error.message }));
  page.on('request', (request) => {
    const owner = activeRecord;
    requestOwners.set(request, owner);
    requestGenerations.set(request, operationGeneration);
    if (owner) pendingByRecord.get(owner)?.add(request);
  });
  page.on('requestfinished', (request) => {
    const owner = requestOwners.get(request);
    if (owner) pendingByRecord.get(owner)?.delete(request);
  });
  page.on('requestfailed', (request) => {
    const owner = requestOwners.get(request);
    if (owner) pendingByRecord.get(owner)?.delete(request);
    const failure = request.failure()?.errorText ?? 'unknown failure';
    const requestGeneration = requestGenerations.get(request);
    const abortedPreviewNavigation = failure === 'net::ERR_ABORTED'
      && request.isNavigationRequest()
      && (() => {
        try {
          const frame = request.frame();
          const url = new URL(request.url());
          return frame.parentFrame() === page.mainFrame()
            && ['/preview', '/preview/', '/preview-content', '/preview-content/'].includes(url.pathname);
        } catch {
          return false;
        }
      })();
    if (failure === 'net::ERR_ABORTED' && requestGeneration !== undefined && requestGeneration < operationGeneration && abortedPreviewNavigation) {
      owner?.cancelledRequests.push({
        method: request.method(),
        url: request.url(),
        reason: operationReasons.get(requestGeneration + 1) ?? 'The next resource route replaced the isolated preview document.',
      });
      return;
    }
    owner?.findings.push({
      type: 'failed-request',
      detail: `${request.method()} ${request.url()}: ${failure}`,
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) activeRecord?.findings.push({ type: 'http-error', detail: `${response.status()} ${response.url()}` });
  });

  for (const [resourceIndex, resource] of resources.entries()) {
    if (resourceIndex > 0 && resourceIndex % 25 === 0) console.info(`[resource-certification] checked ${resourceIndex}/${resources.length}`);
    const record = { slug: resource.slug, variants: resource.variants.map((variant) => variant.id), testedVariants: [] as string[], findings: [] as Finding[], screenshots: [] as string[], cancelledRequests: [] as Array<{ method: string; url: string; reason: string }> };
    pendingByRecord.set(record, new Set());
    activeRecord = record;
    try {
      advanceOperation(`Certification test navigated to /resources/${resource.slug}/.`);
      const response = await page.goto(`/resources/${resource.slug}/`, { waitUntil: 'domcontentloaded' });
      record.url = page.url();
      await page.evaluate(() => window.scrollTo(0, 0));
      if (!response?.ok()) {
        record.findings.push({ type: 'http-error', detail: `Resource page returned ${response?.status() ?? 'no response'}.` });
      } else {
        const expectedTitle = `${resource.name} (@tess/${resource.slug}) — Tessellate Resource`;
        if ((await page.title()) !== expectedTitle) {
          record.findings.push({ type: 'shell-layout', detail: `Resource page title was ${(await page.title()).trim()}, expected ${expectedTitle}.` });
        }
        await expect(page.getByRole('heading', { level: 1, name: resource.name, exact: true })).toBeVisible();
        const preview = page.locator('iframe[title$=" live preview"]');
        await expect(preview).toHaveCount(1);
        const sandbox = (await preview.getAttribute('sandbox'))?.split(/\s+/) ?? [];
        if (!sandbox.includes('allow-scripts') || sandbox.includes('allow-same-origin')) {
          record.findings.push({ type: 'preview-error', detail: `Unexpected preview sandbox: ${sandbox.join(' ')}.` });
        }
        const frame = page.frameLocator('iframe[title$=" live preview"]');
        await expect(frame.locator('.tess-screen')).toHaveCount(1, { timeout: 15000 });
        await waitForActualResource(frame, resource.slug);
        if (resource.variants.length === 0) record.findings.push({ type: 'preview-error', detail: 'Resource has no declared variant.' });
        for (const variant of resource.variants) {
          const variantButton = page.getByRole('button', { name: variant.name, exact: true });
          await expect(variantButton).toBeVisible();
          advanceOperation(`Certification test selected the ${variant.name} preview variant.`);
          await variantButton.click();
          const src = await preview.getAttribute('src');
          const selectedVariant = src ? new URL(src, page.url()).searchParams.get('variant') : null;
          if (selectedVariant !== variant.id) {
            record.findings.push({ type: 'preview-error', detail: `Selecting ${variant.name} produced preview variant ${selectedVariant ?? 'none'} instead of ${variant.id}.`, variant: variant.id });
          }
          const iframeHandle = await preview.elementHandle();
          const previewFrame = await iframeHandle?.contentFrame();
          await previewFrame?.waitForLoadState('load', { timeout: 15000 });
          await expect(frame.locator('.tess-screen')).toHaveCount(1, { timeout: 15000 });
          await waitForActualResource(frame, resource.slug, variant.id);
          const variantText = await frame.locator('body').innerText();
          if (/Preview failed:|missing-resource-recovery|No component registered|Loading the actual resource/i.test(variantText)) {
            record.findings.push({ type: 'preview-error', detail: variantText.slice(0, 400), variant: variant.id });
            const screenshotPath = path.join(outputDir, `${resource.slug}-${variant.id}-preview-error.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          const variantDimensions = await frame.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
          if (variantDimensions.scrollWidth > variantDimensions.clientWidth + 2) {
            record.findings.push({ type: 'overflow', detail: `Variant ${variant.id} content width ${variantDimensions.scrollWidth}px exceeds ${variantDimensions.clientWidth}px at the 1440px desktop viewport.`, viewport: 1440, variant: variant.id });
          }
          record.testedVariants.push(variant.id);
        }
        const firstVariant = resource.variants[0];
        if (firstVariant) {
          advanceOperation(`Certification test restored the first ${firstVariant.name} variant before responsive checks.`);
          await page.getByRole('button', { name: firstVariant.name, exact: true }).click();
          const iframeHandle = await preview.elementHandle();
          const previewFrame = await iframeHandle?.contentFrame();
          await previewFrame?.waitForLoadState('load', { timeout: 15000 });
          await waitForActualResource(frame, resource.slug, firstVariant.id);
        }
        if (navigationFixes.has(resource.slug)) {
          const screenshotPath = path.join(outputDir, `${resource.slug}-1440-after.png`);
          await page.screenshot({ path: screenshotPath, animations: 'disabled' });
          record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
        }
        if (resource.slug === 'mobile-drawer-nav') {
          await page.setViewportSize({ width: 390, height: 844 });
          await frame.getByRole('button', { name: /menu/i }).click();
          await expect(frame.getByRole('navigation')).toBeVisible();
          const screenshotPath = path.join(outputDir, `${resource.slug}-menu-390-after.png`);
          await page.screenshot({ path: screenshotPath, animations: 'disabled' });
          record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
        }
        const unresolvedLinks = await frame.locator('a[href]').evaluateAll((anchors) => anchors.flatMap((anchor) => {
          const link = anchor as HTMLAnchorElement;
          const target = (link.getAttribute('href') ?? '').trim();
          let missingHashTarget = false;
          if (target.startsWith('#') && target !== '#') {
            try {
              missingHashTarget = !document.getElementById(decodeURIComponent(target.slice(1)));
            } catch {
              missingHashTarget = true;
            }
          }
          const invalidDestination = !target || target === '#' || missingHashTarget;
          return invalidDestination ? [`${link.innerText.trim() || link.getAttribute('aria-label') || 'unnamed link'} (${target || 'empty href'})`] : [];
        }));
        if (unresolvedLinks.length > 0) {
          const screenshotPath = path.join(outputDir, `${resource.slug}-dead-links-before.png`);
          await page.screenshot({ path: screenshotPath, animations: 'disabled' });
          record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
        }
        for (const link of unresolvedLinks) record.findings.push({ type: 'dead-link', detail: `Link has no destination in the preview: ${link}` });
        const actionChecks: Record<string, Array<{ label: string; feedback: string }>> = {
          'breadcrumb-header': [
            { label: 'Export', feedback: 'Export action previewed.' },
            { label: 'Save', feedback: 'Save action previewed.' },
          ],
          'floating-nav': [{ label: 'Open', feedback: 'Open action previewed.' }],
          'mega-nav': [{ label: 'Launch', feedback: 'Launch action previewed.' }],
          'transparent-solid-nav': [{ label: 'Docs', feedback: 'Documentation action previewed.' }],
          'centered-top-nav': [{ label: 'Get Started', feedback: 'Start action previewed.' }],
        };
        for (const action of actionChecks[resource.slug] ?? []) {
          const button = frame.getByRole('button', { name: action.label });
          if (await button.count() === 0) continue;
          if (await button.isDisabled()) {
            record.findings.push({ type: 'dead-control', detail: `${action.label} is disabled in the preview despite the host action being available.` });
            continue;
          }
          try {
            await button.click({ timeout: 2500 });
          } catch (cause) {
            await page.screenshot({ path: path.join(outputDir, `${resource.slug}-${action.label.toLowerCase().replaceAll(' ', '-')}-unreachable.png`), animations: 'disabled' });
            record.findings.push({ type: 'dead-control', detail: `${action.label} could not be activated in the visible preview: ${cause instanceof Error ? cause.message : String(cause)}` });
            continue;
          }
          const statuses = await frame.getByRole('status').allTextContents();
          if (!statuses.some((status) => status.includes(action.feedback))) {
            const screenshotPath = path.join(outputDir, `${resource.slug}-dead-control-before.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
            record.findings.push({ type: 'dead-control', detail: `${action.label} accepted activation but gave no visible response.` });
          }
        }
        if (resource.slug === 'mega-nav') {
          const products = frame.getByRole('button', { name: /products/i });
          await products.click();
          if (!(await frame.getByText('Deterministic Zod layout mutation pipeline.').isVisible())) record.findings.push({ type: 'dead-control', detail: 'Products menu did not open.' });
          if (await frame.locator('#mega-nav-menu').isVisible()) {
            const screenshotPath = path.join(outputDir, `${resource.slug}-disclosure-after.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          if ((await products.getAttribute('aria-expanded')) !== 'true') {
            const screenshotPath = path.join(outputDir, `${resource.slug}-disclosure-before.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
            record.findings.push({ type: 'accessibility', detail: 'Products disclosure does not expose its expanded state.' });
          }
          await products.click();
          if (await frame.getByText('Deterministic Zod layout mutation pipeline.').isVisible()) record.findings.push({ type: 'dead-control', detail: 'Products menu did not close when activated again.' });
        }
        if (resource.slug === 'mobile-drawer-nav') {
          const dialog = frame.getByRole('dialog', { name: 'Navigation' });
          const closeButton = dialog.getByRole('button', { name: 'Close navigation' });
          await closeButton.press('Tab');
          await expect(closeButton).toBeFocused();
          await closeButton.press('Escape');
          await expect(dialog).toBeHidden();
          await expect(frame.getByRole('button', { name: /menu/i })).toBeFocused();
        }

        for (const width of certifiedWidths) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          const currentPreviewHandle = await preview.elementHandle();
          const currentPreviewFrame = await currentPreviewHandle?.contentFrame();
          await currentPreviewFrame?.waitForLoadState('load', { timeout: 15000 });
          await expect(frame.locator('.tess-screen')).toHaveCount(1, { timeout: 15000 });
          await waitForActualResource(frame, resource.slug, firstVariant?.id);
          if (resource.slug === 'ai-prompt-hero' && [360, 390, 1280, 1440].includes(width)) {
            const screenshotPath = path.join(evidenceDir, `resources-ai-prompt-hero-${width}.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          if (responsiveEvidenceSlugs.has(resource.slug) && [360, 1440].includes(width)) {
            const screenshotPath = path.join(evidenceDir, `resources-${resource.slug}-${width}.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          const pageDimensions = await page.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
          if (pageDimensions.scrollWidth > pageDimensions.clientWidth + 2) {
            const offenders = await page.locator('html').evaluate(() => [...document.body.querySelectorAll<HTMLElement>('*')]
              .map((element) => ({ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 80), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) }))
              .filter((element) => element.right > window.innerWidth + 2)
              .sort((left, right) => right.right - left.right)
              .slice(0, 4));
            record.findings.push({ type: 'overflow', detail: `Resource detail page width ${pageDimensions.scrollWidth}px exceeds viewport ${pageDimensions.clientWidth}px. Offending elements: ${JSON.stringify(offenders)}`, viewport: width });
            const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-page-overflow.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          if (resource.slug === 'ai-agent-activity-feed' && width === 360) {
            const action = frame.getByText('Checked sample UI resources for duplicate patterns', { exact: true });
            const actionBounds = await action.boundingBox();
            const frameWidth = await frame.locator('html').evaluate((html) => html.clientWidth);
            if (!actionBounds || actionBounds.width < frameWidth * 0.6) {
              record.findings.push({ type: 'responsive-content', detail: `Activity-feed text occupies ${Math.round(actionBounds?.width ?? 0)}px of a ${frameWidth}px preview at 360px; the description becomes difficult to read.`, viewport: width });
            }
          }
          const bodyText = await frame.locator('body').innerText();
          if (/Preview failed:|missing-resource-recovery|No component registered|Loading the actual resource/i.test(bodyText)) {
            record.findings.push({ type: 'preview-error', detail: bodyText.slice(0, 400), viewport: width });
          }
          const readVisibleCount = () => frame.locator('body').evaluate((body) => [...body.querySelectorAll('*')].filter((element) => {
            const style = getComputedStyle(element);
            const bounds = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
          }).length);
          if ((await readVisibleCount()) === 0) {
            try {
              await expect.poll(readVisibleCount, { timeout: 5000, message: `Preview for ${resource.slug} should settle with visible content at ${width}px.` }).toBeGreaterThan(0);
            } catch {
              const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-empty-preview.png`);
              await page.screenshot({ path: screenshotPath, animations: 'disabled' });
              record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
              record.findings.push({ type: 'preview-error', detail: `Preview remained without visible content after 5 seconds. Frame text: ${bodyText.slice(0, 200) || '(empty)'}.`, viewport: width });
            }
          }
          const dimensions = await frame.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
          if (width >= 1280) {
            const previewWidth = await preview.evaluate((iframe) => Math.round(iframe.getBoundingClientRect().width));
            if (previewWidth < 500) {
              record.findings.push({ type: 'shell-layout', detail: `Desktop resource preview width ${previewWidth}px is too narrow at a ${width}px viewport.`, viewport: width });
            }
          }
          if (dimensions.scrollWidth > dimensions.clientWidth + 2) {
            const frameContext = await preview.evaluate((iframe) => ({
              outerViewport: window.innerWidth,
              outerScrollX: window.scrollX,
              iframe: (() => { const rect = iframe.getBoundingClientRect(); return { left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right) }; })(),
              host: (() => { const rect = iframe.parentElement?.getBoundingClientRect(); return rect ? { width: Math.round(rect.width), right: Math.round(rect.right) } : null; })(),
              ancestors: (() => { const values = []; let element: HTMLElement | null = iframe as HTMLElement; for (let depth = 0; element && depth < 9; depth += 1, element = element.parentElement) { const rect = element.getBoundingClientRect(); values.push({ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 70), left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right), columns: getComputedStyle(element).display === 'grid' ? getComputedStyle(element).gridTemplateColumns : undefined }); } return values; })(),
            }));
            record.findings.push({ type: 'overflow', detail: `Preview width ${dimensions.scrollWidth}px exceeds viewport ${dimensions.clientWidth}px. Host geometry: ${JSON.stringify(frameContext)}`, viewport: width });
            const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-overflow.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          if (width === 390 && responsiveFixes.has(resource.slug)) {
            const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-after.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
          if (width === 390 && navigationFixes.has(resource.slug)) {
            const screenshotPath = path.join(outputDir, `${resource.slug}-390-after.png`);
            await page.screenshot({ path: screenshotPath, animations: 'disabled' });
            record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
          }
        }
      }
    } catch (cause) {
      record.findings.push({ type: 'test-error', detail: cause instanceof Error ? cause.message : String(cause) });
      try {
        await page.screenshot({ path: path.join(outputDir, `${resource.slug}-failure.png`), animations: 'disabled' });
      } catch {
        // A failed navigation may leave no document available to capture.
      }
    }
    const pending = pendingByRecord.get(record);
    if (pending?.size) {
      try {
        await expect.poll(() => pending.size, { timeout: 5000, message: `Requests for ${resource.slug} should finish before navigating away.` }).toBe(0);
      } catch {
        record.findings.push({
          type: 'failed-request',
          detail: `Resource page left ${pending.size} request(s) unsettled: ${[...pending].map((request) => `${request.method()} ${request.url()}`).join('; ')}`,
        });
      }
    }
    records.push(record);
  }

  activeRecord = undefined;
  const reportPath = path.resolve(process.cwd(), 'audit/evidence/step-07/after/catalog-324-worker-pass.json');
  mkdirSync(path.dirname(reportPath), { recursive: true });
  await import('node:fs/promises').then(({ writeFile }) => writeFile(reportPath, JSON.stringify({
    schemaVersion: '1.0.0',
    browserProject: testInfo.project.name,
    widths: certifiedWidths,
    resourceCount: records.length,
    variantCount: records.reduce((sum, record) => sum + record.testedVariants.length, 0),
    findings: records.reduce((sum, record) => sum + record.findings.length, 0),
    cancelledRequestCount: records.reduce((sum, record) => sum + record.cancelledRequests.length, 0),
    resources: records,
  }, null, 2)));

  const failures = records.flatMap((record) => record.findings.map((finding) => `${record.slug}: ${finding.type}: ${finding.detail}`));
  expect(failures, `Catalogue browser smoke findings:\n${failures.join('\n')}`).toEqual([]);
});

test('canonical /r resource detail route preserves title, preview, and responsive layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This route smoke runs against the Sites Worker preview boundary.');

  const slug = 'ai-prompt-hero';
  const title = 'AI Prompt Hero (@tess/ai-prompt-hero) — Tessellate Resource';
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/resource-layout');
  mkdirSync(evidenceDir, { recursive: true });
  const results: Array<{ viewport: string; status: number | null; title: string; heading: string; pageWidth: number; previewWidth: number }> = [];

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    const response = await page.goto(`/r/${slug}/`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(title);
    const heading = page.getByRole('heading', { level: 1, name: 'AI Prompt Hero', exact: true });
    await expect(heading).toBeVisible();
    const preview = page.locator('iframe[title$=" live preview"]');
    await expect(preview).toHaveCount(1);
    await expect(page.frameLocator('iframe[title$=" live preview"]').locator('.tess-screen')).toHaveCount(1);
    const dimensions = await page.locator('html').evaluate((html) => ({ pageWidth: html.scrollWidth, clientWidth: html.clientWidth }));
    const previewWidth = await preview.evaluate((iframe) => Math.round(iframe.getBoundingClientRect().width));
    expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
    if (viewport.width >= 1280) expect(previewWidth).toBeGreaterThanOrEqual(500);
    await page.screenshot({ path: path.join(evidenceDir, `r-ai-prompt-hero-${viewport.width}.png`), animations: 'disabled' });
    results.push({ viewport: `${viewport.width}x${viewport.height}`, status: response?.status() ?? null, title: await page.title(), heading: (await heading.innerText()).trim(), pageWidth: dimensions.pageWidth, previewWidth });
  }

  expect(errors, `Canonical resource route browser errors: ${errors.join('\n')}`).toEqual([]);
  await import('node:fs/promises').then(({ writeFile }) => writeFile(
    path.resolve(process.cwd(), 'audit/evidence/step-06/results/canonical-resource-route.json'),
    JSON.stringify({ route: `/r/${slug}/`, errors, results }, null, 2),
  ));
});

test('AI Chat Panel standalone preview starts with a coherent heading hierarchy', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('/r/ai-chat-panel/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const frame = page.frameLocator('iframe[title$=" live preview"]');
  await expect(frame.getByText('Example conversation. This preview does not connect to a model; sending adds a fixed local example reply.')).toBeVisible();
  const firstHeading = frame.locator('h1, h2, h3, h4, h5, h6').first();
  await expect(firstHeading).toHaveText('Example assistant conversation');
  await expect(firstHeading).toHaveJSProperty('tagName', 'H2');
  const headingLevels = await frame.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
    headings.map((heading) => Number(heading.tagName.slice(1)))
  );
  expect(headingLevels[0]).toBe(2);
  expect(errors).toEqual([]);

  const screenshot = path.resolve(process.cwd(), `quality/evidence/step-35/after/ai-chat-panel-heading-${testInfo.project.name}.png`);
  mkdirSync(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, animations: 'disabled' });
  await import('node:fs/promises').then(({ writeFile }) => writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-35/after/ai-chat-panel-heading-${testInfo.project.name}.json`),
    JSON.stringify({ route: page.url(), viewport: page.viewportSize(), status: response?.status(), headingLevels, errors, screenshot: path.relative(process.cwd(), screenshot) }, null, 2),
  ));
});

test('marketing CTA header reflows without overflow in compact resource previews', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This regression runs against the Sites Worker preview boundary.');

  const viewports = [{ width: 360, height: 844 }, { width: 390, height: 844 }];
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning') warnings.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/resource-layout');
  mkdirSync(evidenceDir, { recursive: true });
  await page.setViewportSize(viewports[0]);
  const response = await page.goto('/resources/marketing-nav-cta/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const frame = page.frameLocator('iframe[title$=" live preview"]');
  const header = frame.locator('header');
  await expect(header).toBeVisible();
  await expect(frame.getByRole('button', { name: 'Start Free' })).toBeVisible();

  const results: Array<{ viewport: string; frameWidth: number; documentWidth: number; headerWidth: number; itemsOverlap: boolean; screenshot: string }> = [];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await header.evaluate(async (element) => { await element.ownerDocument.fonts.ready; });
    const measurements = await header.evaluate((element) => {
      const frameDocument = element.ownerDocument;
      const headerBounds = element.getBoundingClientRect();
      const brandBounds = element.children[0].getBoundingClientRect();
      const navigationBounds = element.children[1].getBoundingClientRect();
      const itemsOverlap = brandBounds.left < navigationBounds.right - 1
        && navigationBounds.left < brandBounds.right - 1
        && brandBounds.top < navigationBounds.bottom - 1
        && navigationBounds.top < brandBounds.bottom - 1;
      return {
        frameWidth: frameDocument.documentElement.clientWidth,
        documentWidth: frameDocument.documentElement.scrollWidth,
        headerWidth: headerBounds.width,
        itemsOverlap,
      };
    });
    expect(measurements.documentWidth, `Header overflowed at ${viewport.width}px outer viewport`).toBeLessThanOrEqual(measurements.frameWidth + 2);
    expect(measurements.itemsOverlap, `Header items overlap at ${viewport.width}px outer viewport`).toBe(false);

    const screenshot = path.join(evidenceDir, `marketing-nav-cta-${viewport.width}-after.png`);
    await page.screenshot({ path: screenshot, animations: 'disabled' });
    results.push({ ...measurements, viewport: `${viewport.width}x${viewport.height}`, screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/') });
  }

  expect(errors, `Browser errors: ${errors.join('\n')}`).toEqual([]);
  expect(failedRequests, `Failed requests: ${failedRequests.join('\n')}`).toEqual([]);
  expect(httpErrors, `HTTP errors: ${httpErrors.join('\n')}`).toEqual([]);
  await import('node:fs/promises').then(({ writeFile }) => writeFile(
    path.resolve(process.cwd(), 'audit/evidence/step-06/results/marketing-nav-cta-responsive.json'),
    JSON.stringify({ route: '/resources/marketing-nav-cta/', status: response?.status() ?? null, errors, warnings, failedRequests, httpErrors, results }, null, 2),
  ));
});
