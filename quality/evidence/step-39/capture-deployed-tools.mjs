/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/tools');
const tools = [
  { slug: 'dna', route: '/tools/dna', title: 'Design DNA Lab' },
  { slug: 'backgrounds', route: '/tools/backgrounds', title: 'Background Studio' },
  { slug: 'motion', route: '/tools/motion', title: 'Motion Studio' },
  { slug: 'palette', route: '/tools/palette', title: 'Palette Studio' },
  { slug: 'typography', route: '/tools/typography', title: 'Typography Lab' },
  { slug: 'layout', route: '/tools/layout', title: 'Layout Composer' },
  { slug: 'section-planner', route: '/tools/section-planner', title: 'Section Planner' },
  { slug: 'dataviz', route: '/tools/dataviz', title: 'Data Visualisation Styler' },
  { slug: 'accessibility', route: '/tools/accessibility', title: 'Accessibility Lab' },
  { slug: 'icons', route: '/tools/icons', title: 'SVG / Icon Lab' },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    for (const tool of tools) {
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

      const url = `${origin}${tool.route}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: tool.title, level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);

      const screenshot = path.join(directory, `${tool.slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const evidence = {
        capturedAt: new Date().toISOString(),
        route: url,
        viewport: `${viewport.width}x${viewport.height}`,
        title: await page.title(),
        status: response?.status() ?? null,
        visibleText: await page.locator('main').innerText(),
        buttons: (await page.getByRole('button').allTextContents()).map((text) => text.trim()),
        layout: await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        })),
        screenshot,
      };

      page.removeAllListeners('console');
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      evidence.accessibility = axe.violations.map(({ id, impact, help }) => ({
        id,
        impact,
        help,
      }));
      evidence.runtime = runtime;
      await writeFile(
        path.join(directory, `${tool.slug}.json`),
        `${JSON.stringify(evidence, null, 2)}\n`,
        'utf8'
      );
      await context.close();
      console.log(`${viewport.name} ${tool.route} ${evidence.status}`);
    }
  }
} finally {
  await browser.close();
}
