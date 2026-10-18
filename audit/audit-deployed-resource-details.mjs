/* global console, document, window */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import process from 'node:process';

const siteUrl = process.env.TESSELLATE_SITE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const siteVersion = Number(process.argv[2] ?? process.env.TESSELLATE_SITE_VERSION ?? 18);
const outputDirectory = `audit/evidence/catalog-search-v${siteVersion}`;
await mkdir(outputDirectory, { recursive: true });

const report = {
  siteVersion,
  route: '/r/ai-agent-activity-feed/',
  checks: [],
  viewports: [],
};
const browser = await chromium.launch({ headless: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  for (const viewport of [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const result = {
      viewport: viewport.name,
      url: `${siteUrl}/r/ai-agent-activity-feed/`,
      httpStatus: null,
      consoleErrors: [],
      consoleWarnings: [],
      uncaughtErrors: [],
      failedRequests: [],
      httpErrors: [],
      axe: [],
      headings: [],
      screenshots: {},
      overflow: null,
    };

    page.on('console', (message) => {
      if (message.type() === 'error') result.consoleErrors.push(message.text());
      if (message.type() === 'warning') result.consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => result.uncaughtErrors.push(error.message));
    page.on('requestfailed', (request) => result.failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? null,
      resourceType: request.resourceType(),
    }));
    page.on('response', (response) => {
      if (response.status() >= 400) result.httpErrors.push({ url: response.url(), status: response.status() });
    });

    try {
      const response = await page.goto(`${siteUrl}/r/ai-agent-activity-feed/`, { waitUntil: 'domcontentloaded' });
      result.httpStatus = response?.status() ?? null;
      assert(result.httpStatus === 200, `Resource route returned HTTP ${result.httpStatus}.`);
      await page.getByRole('heading', { level: 1, name: 'AI Agent Activity Feed', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
      const preview = page.frameLocator('iframe[title$=" live preview"]');
      await preview.getByRole('heading', { level: 2, name: 'Example agent activity', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
      await preview.getByText('Static sample data', { exact: true }).waitFor({ state: 'visible' });
      assert(await page.getByText(/real-time telemetry|live telemetry/i).count() === 0, 'The page still claims these sample events are live telemetry.');
      assert(await preview.getByText(/real-time telemetry|live telemetry/i).count() === 0, 'The preview still claims these sample events are live telemetry.');
      const previewHeadings = await preview.locator('h1,h2,h3,h4,h5,h6').evaluateAll((elements) => elements.map((element) => ({ tag: element.tagName, text: element.textContent?.trim() ?? '' })));
      assert(previewHeadings[0]?.tag === 'H2', `Preview begins with ${previewHeadings[0]?.tag ?? 'no heading'}, expected H2.`);
      result.headings.push({ scope: 'isolated preview', headings: previewHeadings });

      await preview.getByRole('button', { name: 'Milestones', exact: true }).click();
      assert(await preview.getByText('Reviewed keyboard flow for a sample onboarding screen', { exact: true }).count() === 1, 'Milestones filter did not retain the onboarding review example.');
      assert(await preview.getByText('Checked sample UI resources for duplicate patterns', { exact: true }).count() === 0, 'Milestones filter did not remove a non-milestone event.');
      await preview.getByRole('button', { name: 'All Events', exact: true }).click();
      assert(await preview.getByText('Checked sample UI resources for duplicate patterns', { exact: true }).count() === 1, 'All Events did not restore the sample events.');
      report.checks.push({ viewport: viewport.name, name: 'sample-content-disclosure-and-filters', status: 'PASS' });

      result.screenshots.preview = `${outputDirectory}/ai-agent-activity-after-${viewport.name}.png`;
      await page.locator('iframe[title$=" live preview"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: result.screenshots.preview, animations: 'disabled' });

      const tabContent = {
        Intent: 'Summary & Purpose',
        Code: 'Actual published source (React + Tailwind):',
        Variants: 'Declared Variants',
        Anatomy: 'Configurable Slots & Props',
        Accessibility: 'Compliance Level Target:',
        Performance: 'JS Payload',
        Dependencies: 'Declared runtime and registry dependencies',
        Versions: 'v1.0.0',
      };
      for (const [tab, expectedText] of Object.entries(tabContent)) {
        await page.getByRole('button', { name: tab, exact: true }).click();
        await page.getByText(expectedText, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
        const axe = await new AxeBuilder({ page }).analyze();
        const headingOrder = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
        const critical = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
        result.axe.push({
          tab,
          violationCount: axe.violations.length,
          seriousOrCritical: critical.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => node.target) })),
          headingOrderViolations: headingOrder.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })),
        });
      }

      result.overflow = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      }));
      assert(!result.overflow.horizontalOverflow, `Resource detail overflows at ${viewport.name}.`);
      result.screenshots.detail = `${outputDirectory}/resource-detail-after-${viewport.name}.png`;
      await page.screenshot({ path: result.screenshots.detail, animations: 'disabled' });
      assert(result.axe.every((tab) => tab.seriousOrCritical.length === 0), `Axe reported serious/critical violations on ${viewport.name}.`);
      assert(result.axe.every((tab) => tab.headingOrderViolations.length === 0), `Heading order violations remain on ${viewport.name}.`);
      assert(result.consoleErrors.length === 0, `Console errors occurred on ${viewport.name}.`);
      assert(result.uncaughtErrors.length === 0, `Uncaught errors occurred on ${viewport.name}.`);
      assert(result.failedRequests.length === 0, `Failed network requests occurred on ${viewport.name}.`);
      assert(result.httpErrors.length === 0, `HTTP errors occurred on ${viewport.name}.`);
    } catch (error) {
      result.fatal = error instanceof Error ? error.message : String(error);
      result.screenshots.failure = `${outputDirectory}/resource-detail-failure-${viewport.name}.png`;
      await page.screenshot({ path: result.screenshots.failure }).catch(() => {});
    }

    await writeFile(`${outputDirectory}/resource-detail-${viewport.name}.json`, `${JSON.stringify(result, null, 2)}\n`);
    await context.close();
    report.viewports.push(result);
  }
} finally {
  await browser.close();
}

await writeFile(`${outputDirectory}/resource-detail-audit.json`, `${JSON.stringify(report, null, 2)}\n`);
const failures = report.viewports.flatMap((viewport) => [
  ...(viewport.fatal ? [{ viewport: viewport.viewport, fatal: viewport.fatal }] : []),
  ...viewport.consoleErrors.map((error) => ({ viewport: viewport.viewport, consoleError: error })),
  ...viewport.uncaughtErrors.map((error) => ({ viewport: viewport.viewport, uncaughtError: error })),
  ...viewport.failedRequests.map((error) => ({ viewport: viewport.viewport, failedRequest: error })),
  ...viewport.httpErrors.map((error) => ({ viewport: viewport.viewport, httpError: error })),
  ...(viewport.overflow?.horizontalOverflow ? [{ viewport: viewport.viewport, overflow: viewport.overflow }] : []),
]);
console.log(JSON.stringify({ report: `${outputDirectory}/resource-detail-audit.json`, failures, viewports: report.viewports.map(({ viewport, httpStatus, consoleErrors, uncaughtErrors, failedRequests, httpErrors, axe, overflow, screenshots }) => ({ viewport, httpStatus, consoleErrors: consoleErrors.length, uncaughtErrors: uncaughtErrors.length, failedRequests: failedRequests.length, httpErrors: httpErrors.length, axe, overflow, screenshots })) }, null, 2));
if (failures.length) process.exitCode = 1;
