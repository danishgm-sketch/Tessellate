import { test, expect } from '@playwright/test';

test.describe('Critical Anonymous User Flows', () => {
  test('homepage loads editorial shell, navigation, and interactive islands', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tessellate/);

    // Site header brand mark and navigation
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(page.locator('text=Tessellate').first()).toBeVisible();

    // Main section presence
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // Verify key sections on homepage
    await expect(page.locator('text=Choose a direction').first()).toBeVisible();
  });

  test('explore catalogue loads verified resource index and supports filtering', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveTitle(/Explore/);

    // Header and filter elements
    await expect(page.locator('h1')).toContainText('Explore Resource Library');

    await expect(page.getByText('Showing 50 of 324 resources',{exact:true})).toBeVisible();
    await page.getByLabel('Search catalogue').fill('advanced data table');
    await expect(page.getByRole('link',{name:'Advanced Data Table',exact:true})).toBeVisible();
    await expect(page).toHaveURL(/q=advanced/);
  });

  test('showcases gallery presents 8 distinct systems and inspects Design DNA', async ({ page }) => {
    await page.goto('/showcases');
    await expect(page).toHaveTitle(/Showcase projects/);
    await expect(page.locator('main article')).toHaveCount(8);
    await page.getByRole('link',{name:'Explore example →'}).first().click();
    await expect(page.locator('a[href*="workbench?showcase="]')).toBeVisible();
    await expect(page.locator('[data-screen-id]').first()).toBeVisible();
  });

  test('workbench route loads dark studio workspace and Design DNA inspector', async ({ page }) => {
    await page.goto('/workbench');
    await page.waitForLoadState('domcontentloaded');

    // Studio canvas or loading shell
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify workbench title or key controls
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    await expect(page.locator('[data-screen-id]').first()).toBeVisible();
  });

  test('production error state: 404 page renders cleanly with recovery links', async ({ page }) => {
    await page.goto('/non-existent-route-for-testing-404');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=404').first()).toBeVisible();
    await expect(page.locator('text=Page Not Found').first()).toBeVisible();

    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });
});

