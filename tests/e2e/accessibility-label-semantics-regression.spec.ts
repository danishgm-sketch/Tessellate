import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const EVIDENCE_DIR = path.resolve(process.cwd(), 'quality/evidence/step-48/accessibility-label-semantics');

for (const route of ['/workbench', '/showcase/showcase-playful-hr/']) {
  test(`${route} gives every labelled non-interactive container a semantic role`, async ({ page }, testInfo) => {
    const runtime = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
    const axeInstrumentation = { cspConsoleErrors: [] as string[], blockedRequests: [] as string[] };
    let scanning = false;
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      if (scanning && /violates the following Content Security Policy directive/.test(message.text())) {
        axeInstrumentation.cspConsoleErrors.push(message.text());
      } else {
        runtime.consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText ?? 'unknown failure';
      if (scanning && failure === 'csp' && /_astro\/style\./.test(request.url())) {
        axeInstrumentation.blockedRequests.push(`${request.method()} ${request.url()}: ${failure}`);
      } else {
        runtime.failedRequests.push(`${request.method()} ${request.url()}: ${failure}`);
      }
    });
    page.on('response', (response) => {
      if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(route);
    await expect(page.locator('main h1, main h2').first()).toBeVisible();
    if (route === '/workbench') {
      await expect(page.getByTestId('history-save-status')).toHaveAttribute('role', 'status');
    } else {
      await expect(page.getByRole('region', { name: /example screen$/ }).first()).toBeVisible();
    }

    scanning = true;
    let result: Awaited<ReturnType<AxeBuilder['analyze']>>;
    try {
      result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    } finally {
      scanning = false;
    }
    const unsupportedLabels = result.incomplete
      .filter(({ id }) => id === 'aria-prohibited-attr')
      .map(({ nodes }) => nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })))
      .flat();

    const label = route === '/workbench' ? 'AUD-446-workbench' : 'AUD-445-showcase';
    const evidenceDir = path.join(EVIDENCE_DIR, testInfo.project.name);
    const screenshot = path.join(evidenceDir, `${label}-after.png`);
    await mkdir(evidenceDir, { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: true });
    await writeFile(path.join(evidenceDir, `${label}-after.json`), `${JSON.stringify({
      route,
      url: page.url(),
      viewport: page.viewportSize(),
      status: 'passed',
      runtime,
      axeInstrumentation,
      axe: {
        violations: result.violations.map(({ id, impact, help }) => ({ id, impact, help })),
        ariaIncomplete: unsupportedLabels,
        otherIncompleteRuleIds: [...new Set(result.incomplete.filter(({ id }) => id !== 'aria-prohibited-attr').map(({ id }) => id))],
      },
      screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
    }, null, 2)}\n`, 'utf8');

    expect(runtime.consoleErrors).toEqual([]);
    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.failedRequests).toEqual([]);
    expect(runtime.httpErrors).toEqual([]);
    expect(unsupportedLabels).toEqual([]);
    expect(result.violations).toEqual([]);
  });
}
