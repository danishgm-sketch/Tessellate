import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('v25 mobile Explore keeps Filters unavailable until its handlers are ready', async ({
  page,
}) => {
  await page.route('**/_astro/ExploreView.*.js', (route) => route.abort('blockedbyclient'));

  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    if (!request.url().includes('/_astro/ExploreView.')) failedRequests.push(request.url());
  });

  const response = await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const filterButton = page.getByRole('button', { name: 'Filters', exact: true });
  await expect(filterButton).toBeVisible();
  await expect(page.getByTestId('explore-search-hydration-status')).toContainText(
    'Preparing search'
  );

  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/v25/mobile-filter-hydration');
  await mkdir(evidenceDir, { recursive: true });
  const screenshot = path.join(evidenceDir, 'filters-enabled-before-hydration-390x844.png');
  await page.screenshot({ path: screenshot, animations: 'disabled' });
  const buttonState = await filterButton.evaluate((button) => ({
    disabled: (button as HTMLButtonElement).disabled,
    ariaDescribedBy: button.getAttribute('aria-describedby'),
    expanded: button.getAttribute('aria-expanded'),
    text: button.textContent?.trim(),
  }));
  const report = {
    site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    version: '25',
    route: '/explore/',
    viewport: page.viewportSize(),
    status: response?.status(),
    buttonState,
    blockedHydrationRequest:
      'The Explore React island was intentionally blocked to inspect pre-hydration controls.',
    consoleErrors,
    failedRequests,
    screenshot,
  };
  await writeFile(path.join(evidenceDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

  expect(
    buttonState.disabled,
    'Filters must be disabled until the client handlers are ready.'
  ).toBe(true);
  expect(buttonState.ariaDescribedBy).toBe('explore-search-hydration-status');
  expect(failedRequests).toEqual([]);
});
