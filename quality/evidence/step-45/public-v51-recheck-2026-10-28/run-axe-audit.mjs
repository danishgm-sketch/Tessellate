/* global document, innerWidth */

import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28/axe');
const brief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const browser = await chromium.launch({ headless: true });
const results = [];

async function scan(page, route, viewport, state) {
  const axe = await new AxeBuilder({ page }).withTags(tags).analyze();
  results.push({
    route,
    url: page.url(),
    viewport,
    state,
    violationCount: axe.violations.length,
    violations: axe.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      targets: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
    incompleteCount: axe.incomplete.length,
  });
}

async function exerciseFlagship(context, viewport, isMobile) {
  const page = await context.newPage();
  await page.goto(`${site}/compose`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('catalog-status').waitFor({ state: 'visible' });
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await page.getByText('Inferred Product Architecture', { exact: true }).waitFor({ state: 'visible' });
  const direction = page.getByTestId('direction-card-03');
  await direction.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);
  await page.getByTestId('top-toolbar').waitFor({ state: 'visible' });
  await scan(page, '/workbench', viewport, 'flagship-project');

  if (isMobile) {
    const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.screenshot({ path: path.join(outputDir, 'workbench-preview-mobile-390.png'), fullPage: true });
    await scan(page, '/workbench', viewport, 'flagship-mobile-preview');
    const measurements = await page.evaluate(() => {
      const main = document.querySelector('main');
      const renderer = main?.querySelector('[data-screen-id], .tess-screen, [data-node-id]');
      const bounds = renderer?.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        mainTextLength: main?.textContent?.trim().length ?? 0,
        renderedScreen: Boolean(renderer),
        rendererBounds: bounds ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } : null,
      };
    });
    results.push({ route: '/workbench', url: page.url(), viewport, state: 'flagship-mobile-preview-layout', ...measurements });
  } else {
    await page.getByTestId('top-toolbar').getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByTestId('preview-modal').waitFor({ state: 'visible' });
    await scan(page, '/workbench', viewport, 'flagship-product-preview');
  }
  await page.close();
}

await fs.mkdir(outputDir, { recursive: true });
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const route of ['/', '/explore', '/compose', '/r/button']) {
  const page = await desktop.newPage();
  await page.goto(`${site}${route}`, { waitUntil: 'domcontentloaded' });
  await scan(page, route, '1440x900', 'route');
  await page.close();
}
await exerciseFlagship(desktop, '1440x900', false);
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
await exerciseFlagship(mobile, '390x844', true);
await mobile.close();
await browser.close();

const report = {
  site,
  version: 51,
  source: { canonical: 'e70450cba88cf09d2f68ee126e31a51474c54de2', sitesMirror: 'e19db8af22097eb6d20a9fb2555157234ea1831d' },
  tags,
  caseCount: results.length,
  violationCount: results.reduce((count, result) => count + (result.violationCount ?? 0), 0),
  seriousOrCritical: results.flatMap((result) => result.violations ?? []).filter((violation) => ['serious', 'critical'].includes(violation.impact)),
  results,
};
await fs.writeFile(path.join(outputDir, 'axe-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: path.join(outputDir, 'axe-audit.json'), cases: report.caseCount, violationCount: report.violationCount, seriousOrCritical: report.seriousOrCritical.length, results: results.map((result) => ({ route: result.route, viewport: result.viewport, state: result.state, violations: result.violationCount, layout: result.renderedScreen === undefined ? undefined : result })) }, null, 2));
