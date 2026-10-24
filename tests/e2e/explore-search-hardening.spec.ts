import { expect, test } from '@playwright/test';

async function openMobileFiltersIfNeeded(page: import('@playwright/test').Page) {
  if ((page.viewportSize()?.width ?? 1440) < 1024) {
    const filterButton = page.getByRole('button', { name: 'Filters', exact: true });
    await filterButton.click();
    await expect(filterButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog', { name: 'Explore filters' })).toBeVisible();
  }
}

test('search returns resources that match declared intent, not only a related word', async ({ page }) => {
  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const search = page.getByLabel('Search catalogue');

  await search.fill('payment');
  await expect(page).toHaveURL(/q=payment/);
  await expect(page.getByRole('link', { name: 'Billing Overview', exact: true })).toBeVisible();

  await search.fill('luxury checkout');
  await expect(page).toHaveURL(/q=luxury\+checkout/);
  await expect(page.getByText('No matching resources found', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Conic Light Field', exact: true })).toHaveCount(0);

  await search.fill('checkout');
  await expect(page).toHaveURL(/q=checkout/);
  await expect(page.getByRole('link', { name: 'Funnel Chart', exact: true })).toBeVisible();
});

test('Explore search keeps browser-restorable field identity while filtering results', async ({ page }) => {
  await page.goto('/explore/');
  const search = page.getByRole('textbox', { name: 'Search catalogue' });

  await expect(search).toHaveAttribute('id', 'catalogue-search');
  await expect(search).toHaveAttribute('name', 'q');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await search.fill('dashboard');
  await expect(page).toHaveURL(/q=dashboard/);
  await expect(page.getByRole('link', { name: 'Dashboard KPI Grid', exact: true })).toBeVisible();
});

test('Explore search explains and blocks input until its client handlers are ready', async ({ page }) => {
  let releaseScript!: () => void;
  const scriptGate = new Promise<void>((resolve) => { releaseScript = resolve; });
  await page.route('**/_astro/ExploreView.*.js', async (route) => {
    await scriptGate;
    await route.continue();
  });

  const navigation = await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  expect(navigation?.status()).toBe(200);
  const search = page.getByRole('textbox', { name: 'Search catalogue' });
  try {
    await expect(search).toBeDisabled();
    await expect(page.getByTestId('explore-search-hydration-status')).toContainText('Preparing search');
  } finally {
    releaseScript();
  }

  await expect(search).toBeEnabled();
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await search.fill('dashboard');
  await expect(page).toHaveURL(/q=dashboard/);
  await expect(page.getByRole('link', { name: 'Dashboard KPI Grid', exact: true })).toBeVisible();
});

test('suggested searches lead to relevant catalog results', async ({ page }) => {
  const suggestions = [
    ['Bloomberg-style analytics', 'Heatmap'],
    ['cinematic product hero', 'Cinematic Media Hero'],
    ['AI research sidebar', 'AI Research Answer'],
    ['mobile navigation', 'Mobile Drawer Navigation'],
    ['onboarding', 'Onboarding Role Select'],
    ['billing overview', 'Billing Overview'],
    ['data table', 'Advanced Data Table'],
    ['empty state', 'Empty Collection State'],
  ] as const;

  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  for (const [query, expectedResult] of suggestions) {
    await page.getByRole('button', { name: query, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(query).replaceAll('%20', '\\+')}`));
    await expect(page.getByRole('link', { name: expectedResult, exact: true })).toBeVisible();
  }
});

test('facet selection filters results and survives reload through the URL', async ({ page }) => {
  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const search = page.getByLabel('Search catalogue');
  await search.fill('dashboard');
  await expect(page).toHaveURL(/q=dashboard/);
  const summary = page.locator('[aria-live="polite"]');
  await expect(summary).toContainText(/Showing \d+ of \d+ resources/);
  const beforeFilter = (await summary.textContent()) ?? '';

  await openMobileFiltersIfNeeded(page);
  await page.getByRole('button', { name: /^Density/ }).click();
  const dense = page.getByRole('checkbox', { name: 'Dense', exact: true });
  await dense.check();
  await page.getByRole('button', { name: /^Performance/ }).click();
  const lightweight = page.getByRole('checkbox', { name: 'Lightweight', exact: true });
  await lightweight.check();
  await expect(page).toHaveURL(/density=Dense/);
  await expect(page).toHaveURL(/performance=Lightweight/);
  await expect(summary).toContainText(/Showing \d+ of \d+ resources/);
  const afterFilter = (await summary.textContent()) ?? '';
  expect(Number(afterFilter.match(/of (\d+) resources/)?.[1])).toBeLessThan(Number(beforeFilter.match(/of (\d+) resources/)?.[1]));

  await expect(summary).toContainText(/Showing \d+ of \d+ resources/);
  const filteredSummary = (await summary.textContent()) ?? '';
  await page.reload();
  await openMobileFiltersIfNeeded(page);
  await page.getByRole('button', { name: /^Density/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Dense', exact: true })).toBeChecked();
  await page.getByRole('button', { name: /^Performance/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Lightweight', exact: true })).toBeChecked();
  await expect(summary).toHaveText(filteredSummary);
});

test('Accessibility facet labels declared conformance targets without claiming certification', async ({ page }) => {
  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await openMobileFiltersIfNeeded(page);
  await page.getByRole('button', { name: /^Accessibility/ }).click();
  await expect(page.getByRole('checkbox', { name: 'AA target or higher', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'AAA target', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Verified AA', exact: true })).toHaveCount(0);
});

test('facet lists only include values represented in the loaded catalogue', async ({ page }) => {
  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await openMobileFiltersIfNeeded(page);

  await expect(page.getByRole('checkbox', { name: 'component', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'page', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'primitive', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Motion/ }).click();
  await expect(page.getByRole('checkbox', { name: 'None', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Heavy', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Light', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Density/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Sparse', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Dense', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Performance/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Lightweight', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Dependencies/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Zero extra dependency', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Radix', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Three.js', exact: true })).toHaveCount(0);
});

test('a stale URL facet remains visible so it can be removed', async ({ page }) => {
  await page.goto('/explore/?motion=Heavy');
  await expect(page.getByText('Showing 0 of 0 resources', { exact: true })).toBeVisible();
  await openMobileFiltersIfNeeded(page);
  await page.getByRole('button', { name: /^Motion/ }).click();
  const staleOption = page.getByRole('checkbox', { name: 'Heavy', exact: true });
  await expect(staleOption).toBeChecked();
  await staleOption.click({ noWaitAfter: true });
  await expect(page).not.toHaveURL(/motion=Heavy/);
  await expect(page.getByText(/Showing \d+ of \d+ resources/)).toBeVisible();
  await expect(staleOption).toHaveCount(0);
});

test('Explore reports the real total and exposes more than the first 50 resources', async ({ page }) => {
  await page.goto('/explore/');
  await expect(page.getByText(/Showing 50 of 324 resources/)).toBeVisible();

  await expect(page.getByRole('button', { name: /show more/i })).toBeVisible();
  await page.getByRole('button', { name: /show more/i }).click();
  await expect(page.getByText('Showing 100 of 324 resources', { exact: true })).toBeVisible();
});

test('mobile filter drawer is a keyboard dialog with focus containment and Escape close', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 1024, 'Mobile drawer behavior is only applicable below the desktop breakpoint.');
  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const opener = page.getByRole('button', { name: 'Filters', exact: true });
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'Explore filters' });
  const close = page.getByRole('button', { name: 'Close filters' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(close).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  const focusable = dialog.locator('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  await expect(focusable.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('typing a query does not repeatedly abort resource preview requests', async ({ page }) => {
  const abortedPreviews: string[] = [];
  await page.route('**/preview/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('/preview/')) abortedPreviews.push(request.url());
  });

  await page.goto('/explore/');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  abortedPreviews.length = 0;
  await page.getByLabel('Search catalogue').pressSequentially('luxury checkout', { delay: 70 });
  await expect(page).toHaveURL(/q=luxury\+checkout/);
  await page.waitForTimeout(1000);

  expect(abortedPreviews).toHaveLength(0);
});
