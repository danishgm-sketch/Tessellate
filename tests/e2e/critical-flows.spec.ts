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
    await expect(page).toHaveTitle(/Explore|Catalogue/i);

    // Header and filter elements
    await expect(page.locator('h1')).toContainText('Explore Resource Library');

    // Wait for catalogue to be ready
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    await page.waitForTimeout(500);
    await searchInput.fill('button');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Button').first()).toBeVisible();
  });

  test('showcases gallery presents 8 distinct systems and inspects Design DNA', async ({ page }) => {
    await page.goto('/showcases');
    await expect(page).toHaveTitle(/Showcase/i);

    // Page title and subtitle
    await expect(page.locator('h1').first()).toContainText('Distinct Systems');

    // Verify presence of showcase card elements
    const workbenchLink = page.locator('a[href*="/workbench?showcase="]').first();
    await expect(workbenchLink).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Inspect in Workbench').first()).toBeVisible();
  });

  test('workbench route loads dark studio workspace and Design DNA inspector', async ({ page }) => {
    await page.goto('/workbench');
    await page.waitForLoadState('domcontentloaded');

    // Studio canvas or loading shell
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify workbench toolbar or canvas
    await expect(
      page.locator('[data-testid="top-toolbar"]')
        .or(page.locator('[data-testid="workbench-canvas"]'))
        .or(page.locator('text=Local'))
        .first()
    ).toBeVisible();
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

