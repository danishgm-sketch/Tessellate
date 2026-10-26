import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const outputDir = path.resolve('quality/evidence/step-45/public-v32/a11y');
const brief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('deployed v32 core routes and flagship Workbench pass WCAG 2.2 AA Axe scan', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  fs.mkdirSync(outputDir, { recursive: true });
  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  await page.addInitScript(() => {
    type PolicyViolation = {
      blockedURI: string;
      effectiveDirective: string;
      violatedDirective: string;
      sourceFile: string;
      lineNumber: number;
      disposition: string;
    };
    const browserWindow = window as Window & { __tessellatePolicyViolations?: PolicyViolation[] };
    browserWindow.__tessellatePolicyViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      browserWindow.__tessellatePolicyViolations?.push({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        disposition: event.disposition,
      });
    });
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      httpErrors.push({ url: response.url(), status: response.status() });
  });

  const results: Array<Record<string, unknown>> = [];
  const scan = async (label: string, screenshot: string) => {
    await page.screenshot({ path: path.join(outputDir, screenshot) });
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const policyViolations = await page.evaluate(() => {
      const browserWindow = window as Window & {
        __tessellatePolicyViolations?: Array<Record<string, string | number>>;
      };
      return browserWindow.__tessellatePolicyViolations ?? [];
    });
    results.push({
      label,
      url: page.url(),
      viewport: page.viewportSize(),
      violations: axe.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      })),
      securityPolicyViolations: policyViolations,
      passes: axe.passes.length,
      incomplete: axe.incomplete.map((item) => ({ id: item.id, impact: item.impact, help: item.help })),
    });
  };

  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await scan('homepage', `homepage-${testInfo.project.name}.png`);

  await page.goto('/explore');
  await expect(page.locator('main')).toBeVisible();
  await scan('explore', `explore-${testInfo.project.name}.png`);

  await page.goto('/r/minimal-top-nav');
  await expect(page.locator('main')).toBeVisible();
  await scan('resource-detail', `resource-detail-${testInfo.project.name}.png`);

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 30_000,
  });
  await scan('compose-ready', `compose-${testInfo.project.name}.png`);

  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  const directionC = page.getByTestId('direction-card-03');
  await expect(directionC).toBeVisible();
  await directionC.getByTestId('open-workbench-dir-03').click();
  await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeVisible({
    timeout: 60_000,
  });
  await scan('flagship-workbench-direction-c', `flagship-workbench-${testInfo.project.name}.png`);

  const report = {
    siteVersion: 'v32',
    routeAudits: results,
    consoleErrors,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(
    path.join(outputDir, `audit-${testInfo.project.name}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const seriousOrCritical = results.flatMap((result) =>
    (result.violations as Array<{ impact?: string; id: string; nodes: unknown[] }>)
      .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      .map((violation) => ({ route: result.label, id: violation.id, nodes: violation.nodes.length })),
  );
  expect(seriousOrCritical, 'no serious or critical WCAG 2.2 AA violations').toEqual([]);
  expect(uncaughtExceptions, 'no uncaught browser exceptions').toEqual([]);
  expect(failedRequests, 'no failed essential requests').toEqual([]);
  expect(httpErrors, 'no HTTP errors').toEqual([]);
});
