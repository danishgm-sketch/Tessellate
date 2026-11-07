import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
type AxeViolation = {
  id: string;
  impact?: string;
  nodes: Array<{ target: Array<string | number>; failureSummary?: string | null }>;
};
type AxeResult = { violations: AxeViolation[] };
type AxeWindow = Window & {
  axe?: {
    run: (
      context: Document,
      options: { runOnly: { type: 'tag'; values: string[] } }
    ) => Promise<AxeResult>;
  };
};
type ResourceResult = {
  slug: string;
  route: string;
  status: number | undefined;
  axeViolations: AxeViolation[];
  screenshot: string;
};
const data = JSON.parse(
  await readFile(path.resolve(process.cwd(), 'apps/site/public/data/catalog.json'), 'utf8')
) as { resources: Array<{ slug: string; status: string }> };
const gold = data.resources.filter((r) => r.status === 'verified-gold');
test('published Site: Gold resource frames render and stay accessible with expressive dark theme', async ({
  page,
}, testInfo) => {
  test.setTimeout(8 * 60 * 1000);
  const diagnostics = {
    consoleErrors: [] as string[],
    warnings: [] as string[],
    pageErrors: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (m) => {
    if (m.type() === 'error') diagnostics.consoleErrors.push(m.text());
    if (m.type() === 'warning') diagnostics.warnings.push(m.text());
  });
  page.on('pageerror', (e) => diagnostics.pageErrors.push(e.message));
  page.on('requestfailed', (r) =>
    diagnostics.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`)
  );
  page.on('response', (r) => {
    if (r.status() >= 400) diagnostics.httpErrors.push(`${r.status()} ${r.url()}`);
  });
  const output = path.resolve(
    process.cwd(),
    'audit/evidence/v25/gold-runtime-dark',
    testInfo.project.name
  );
  await mkdir(output, { recursive: true });
  const results: ResourceResult[] = [];
  for (const resource of gold) {
    const route = `/resources/${resource.slug}/`;
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    await expect(preview.locator('.tess-screen'), route).toBeVisible({ timeout: 15000 });
    const darkToggle = page.getByRole('button', { name: 'Switch to Dark theme' });
    await expect(darkToggle, route).toBeVisible();
    await darkToggle.click();
    await expect(preview.locator('html')).toHaveClass(/dark/);
    const expressive = page.getByRole('button', { name: 'Expressive', exact: true });
    if (await expressive.count()) await expressive.click();
    await preview.locator('html').evaluate((el, source) => {
      const s = document.createElement('script');
      s.textContent = source;
      document.head.appendChild(s);
    }, axeSource);
    const axe = await preview.locator('html').evaluate(async (el) => {
      const axeApi = (el.ownerDocument.defaultView as AxeWindow | null)?.axe;
      if (!axeApi) throw new Error('Axe did not load in the resource preview.');
      return axeApi.run(el.ownerDocument, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      });
    });
    const screenshot = path.join(output, `${resource.slug}-expressive-dark.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    results.push({
      slug: resource.slug,
      route,
      status: response?.status(),
      axeViolations: axe.violations,
      screenshot,
    });
  }
  await writeFile(
    path.join(output, 'report.json'),
    JSON.stringify(
      {
        site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
        capturedAt: new Date().toISOString(),
        viewport: page.viewportSize(),
        goldResources: gold.length,
        diagnostics,
        results,
      },
      null,
      2
    ) + '\n'
  );
  expect(gold).toHaveLength(40);
  const violations = results.flatMap((result) =>
    result.axeViolations.map(
      (violation) => `${result.slug}: ${violation.id} (${violation.impact ?? 'unknown'})`
    )
  );
  expect(violations, violations.join('\n')).toEqual([]);
  expect(diagnostics).toEqual({
    consoleErrors: [],
    warnings: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  });
});
