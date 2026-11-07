/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/resource-claims');
const resources = [
  { slug: 'accessibility-commitment-section', title: 'Accessibility Commitment Section' },
  { slug: 'compliance-proof', title: 'Compliance Proof' },
  { slug: 'trust-badges-strip', title: 'Trust Badges Strip' },
  { slug: 'security-proof', title: 'Security Proof' },
  { slug: 'editorial-display-stack', title: 'Editorial Display Stack' },
  { slug: 'success-state', title: 'Success State' },
  { slug: 'document-detail', title: 'Document Detail' },
  { slug: 'accordion-spring', title: 'Accordion Spring' },
  { slug: 'ai-command-bar', title: 'AI Command Bar' },
  { slug: 'ai-empty-state', title: 'AI Empty State' },
  { slug: 'feature-tabs', title: 'Feature Tabs' },
  { slug: 'interactive-demo-hero', title: 'Interactive Demo Hero' },
  { slug: 'feature-sticky-narrative', title: 'Feature Sticky Narrative' },
  { slug: 'how-it-works-steps', title: 'How It Works Steps' },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    for (const resource of resources) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      const runtime = {
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
        runtime.failedRequests.push({
          method: request.method(),
          url: request.url(),
          error: request.failure()?.errorText ?? null,
        })
      );
      page.on('response', (response) => {
        if (response.status() >= 400)
          runtime.httpErrors.push({ url: response.url(), status: response.status() });
      });

      const url = `${origin}/r/${resource.slug}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      await page.locator('main').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(350);
      const screenshot = path.join(directory, `${resource.slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const evidence = {
        capturedAt: new Date().toISOString(),
        route: url,
        viewport: `${viewport.width}x${viewport.height}`,
        expectedResource: resource.title,
        status: response?.status() ?? null,
        title: await page.title(),
        visibleText: await page.locator('main').innerText(),
        links: await page.locator('main a').evaluateAll((links) =>
          links.map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))
        ),
        layout: await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        })),
        accessibility: axe.violations.map(({ id, impact, help }) => ({ id, impact, help })),
        runtime,
        screenshot,
      };
      await writeFile(
        path.join(directory, `${resource.slug}.json`),
        `${JSON.stringify(evidence, null, 2)}\n`,
        'utf8'
      );
      await context.close();
      console.log(`${viewport.name} ${resource.slug} ${evidence.status}`);
    }
  }
} finally {
  await browser.close();
}
