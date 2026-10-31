/* global console, document */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputRoot = path.resolve('quality/evidence/step-39/deployed-before/docs');
const routes = [
  { slug: 'cli', route: '/docs/cli', heading: 'Tessellate CLI (`tess`)' },
  { slug: 'mcp', route: '/docs/mcp', heading: 'Model Context Protocol (MCP)' },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const directory = path.join(outputRoot, viewport.name);
    await mkdir(directory, { recursive: true });
    for (const entry of routes) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      page.on('console', (message) => {
        if (message.type() === 'error') runtime.consoleErrors.push(message.text());
        if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
      });
      page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
      page.on('requestfailed', (request) => runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
      page.on('response', (response) => {
        if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
      });

      const url = `${origin}${entry.route}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: entry.heading, level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const screenshot = path.join(directory, `${entry.slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const evidence = {
        capturedAt: new Date().toISOString(),
        route: url,
        viewport: `${viewport.width}x${viewport.height}`,
        status: response?.status() ?? null,
        title: await page.title(),
        headings: await page.getByRole('heading').allTextContents(),
        visibleText: await page.locator('main').innerText(),
        links: await page.locator('main a').evaluateAll((links) => links.map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))),
        layout: await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        })),
        accessibility: axe.violations.map(({ id, impact, help }) => ({ id, impact, help })),
        runtime,
        screenshot,
      };
      await writeFile(path.join(directory, `${entry.slug}.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
      await context.close();
      console.log(`${viewport.name} ${entry.route} ${evidence.status}`);
    }
  }
} finally {
  await browser.close();
}
