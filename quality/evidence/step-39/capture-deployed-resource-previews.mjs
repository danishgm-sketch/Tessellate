/* global console, document, process */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = process.env.AUDIT_ORIGIN ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve(
  process.env.AUDIT_OUTPUT ?? 'quality/evidence/step-39/deployed-before/resource-previews'
);
const resources = [
  'accessibility-commitment-section',
  'compliance-proof',
  'trust-badges-strip',
  'security-proof',
  'editorial-display-stack',
  'success-state',
  'document-detail',
  'accordion-spring',
  'ai-command-bar',
  'ai-empty-state',
  'feature-tabs',
  'interactive-demo-hero',
  'feature-sticky-narrative',
  'how-it-works-steps',
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    for (const slug of resources) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      page.on('console', (message) => {
        if (message.type() === 'error') runtime.consoleErrors.push(message.text());
        if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
      });
      page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
      page.on('requestfailed', (request) => runtime.failedRequests.push({ method: request.method(), url: request.url(), error: request.failure()?.errorText ?? null }));
      page.on('response', (response) => {
        if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
      });

      const url = `${origin}/preview/?resource=${encodeURIComponent(slug)}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      const previewFrame = page.frameLocator('iframe[data-tessellate-preview-frame]');
      const previewScreen = previewFrame.locator('.tess-screen');
      await previewScreen.waitFor({ state: 'visible', timeout: 15_000 });
      await page.evaluate(() => document.fonts.ready);
      await previewFrame.locator('body').evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      const screenshot = path.join(directory, `${slug}.png`);
      const previewScreenshot = path.join(directory, `${slug}-preview.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      await previewScreen.screenshot({ path: previewScreenshot });
      const runtimeBeforeAxe = {
        consoleErrors: [...runtime.consoleErrors],
        consoleWarnings: [...runtime.consoleWarnings],
        uncaughtExceptions: [...runtime.uncaughtExceptions],
        failedRequests: [...runtime.failedRequests],
        httpErrors: [...runtime.httpErrors],
      };
      // Axe injects styles/scripts that the preview CSP intentionally blocks.
      // Keep audit instrumentation events out of application-runtime evidence.
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      page.removeAllListeners('requestfailed');
      page.removeAllListeners('response');
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const iframe = page.locator('iframe[data-tessellate-preview-frame]').first();
      const evidence = {
        capturedAt: new Date().toISOString(),
        route: url,
        viewport: `${viewport.width}x${viewport.height}`,
        status: response?.status() ?? null,
        title: await page.title(),
        previewUrl: await iframe.getAttribute('src'),
        visibleText: await previewFrame.locator('body').innerText(),
        buttons: await previewFrame.getByRole('button').allTextContents(),
        layout: await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        })),
        previewLayout: await previewScreen.evaluate((screen) => {
          const rect = screen.getBoundingClientRect();
          return {
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: document.documentElement.scrollWidth,
            horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            screenWidth: rect.width,
            screenHeight: rect.height,
          };
        }),
        accessibilityScope: 'Host preview shell only; the isolated preview iframe is inspected separately for content and layout.',
        accessibility: axe.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, summary: node.failureSummary })),
        })),
        runtime: runtimeBeforeAxe,
        screenshot,
        previewScreenshot,
      };
      await writeFile(path.join(directory, `${slug}.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
      await context.close();
      console.log(`${viewport.name} ${slug} ${evidence.status} ${evidence.accessibility.length} axe violations`);
    }
  }
} finally {
  await browser.close();
}
