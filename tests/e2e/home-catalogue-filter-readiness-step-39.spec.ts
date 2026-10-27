import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

type RuntimeEvidence = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
};

function watchRuntime(page: Page): RuntimeEvidence {
  const runtime: RuntimeEvidence = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return runtime;
}

test('homepage category filters stay unavailable until their Astro island is ready', async ({
  page,
}, testInfo) => {
  const runtime = watchRuntime(page);
  let releaseBundle!: () => void;
  let markBundlePaused!: () => void;
  const bundlePaused = new Promise<void>((resolve) => {
    markBundlePaused = resolve;
  });
  const bundleGate = new Promise<void>((resolve) => {
    releaseBundle = resolve;
  });

  await page.route('**/_astro/CatalogueMosaic.*.js', async (route) => {
    markBundlePaused();
    await bundleGate;
    await route.continue();
  });

  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const title = page.getByRole('heading', { name: 'Open resources. Clear sample data.' });
    await expect(title).toBeVisible();
    await bundlePaused;

    const dataFilter = page.getByRole('button', { name: 'data', exact: true });
    const loadingStatus = page
      .getByRole('status')
      .filter({ hasText: 'Resource filters are loading.' });
    await expect(dataFilter).toBeVisible();
    const viewport = testInfo.project.name.includes('mobile')
      ? 'mobile-390x844'
      : 'desktop-1440x900';
    const evidenceDirectory = path.resolve(
      process.cwd(),
      'quality/evidence/step-39/home-filter-readiness'
    );
    await mkdir(evidenceDirectory, { recursive: true });
    await page.screenshot({
      path: path.join(evidenceDirectory, `loading-${viewport}.png`),
      fullPage: true,
    });
    await expect(dataFilter).toBeDisabled();
    await expect(loadingStatus).toBeVisible();
    await expect(dataFilter).toHaveAttribute(
      'aria-describedby',
      (await loadingStatus.getAttribute('id')) ?? ''
    );
  } finally {
    releaseBundle();
  }

  const dataFilter = page.getByRole('button', { name: 'data', exact: true });
  await expect(dataFilter).toBeEnabled();
  await expect(
    page.getByRole('status').filter({ hasText: 'Resource filters are loading.' })
  ).toHaveCount(0);
  await page.waitForFunction(() => {
    const island = document.querySelector('astro-island[component-export="CatalogueMosaic"]');
    return Boolean(island && !island.hasAttribute('ssr'));
  });
  await dataFilter.click();
  await expect(dataFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Area Chart', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Advanced Data Table', exact: true })).toHaveCount(
    0
  );

  const viewport = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  const evidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/home-filter-readiness'
  );
  await page.screenshot({
    path: path.join(evidenceDirectory, `selected-${viewport}.png`),
    fullPage: true,
  });

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
  ).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
