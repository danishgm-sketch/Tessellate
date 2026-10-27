import { expect, test } from '@playwright/test';

const recipeTitle = 'Application Overview Dashboard';
const expectedBrief =
  'Design a page titled “Application Overview Dashboard”. Workspace overview with key outcome metrics, recent activity, and clear next steps.';

async function openOverviewRecipe(page: import('@playwright/test').Page) {
  await page.goto('/pages');
  const card = page.locator('article').filter({
    has: page.getByRole('heading', { name: recipeTitle }),
  });
  await expect(card).toBeVisible();
  return card;
}

test('page recipe handoff quotes the title instead of assuming its article', async ({ page }) => {
  const card = await openOverviewRecipe(page);
  const link = card.getByRole('link', { name: /Compose this architecture/ });
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
  expect(new URL(href!, 'http://localhost').searchParams.get('brief')).toBe(expectedBrief);

  await link.click();
  await expect(page.getByRole('textbox', { name: 'Product Description & Objectives' })).toHaveValue(
    expectedBrief
  );
});

test('generic overview recipe does not produce developer-tools screens', async ({ page }, testInfo) => {
  const card = await openOverviewRecipe(page);
  await card.getByRole('link', { name: /Compose this architecture/ }).click();
  await expect(page.getByText('Catalogue ready')).toBeVisible();
  await page.getByRole('button', { name: 'Compose Interface System' }).click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByText('DEVELOPER-TOOLS', { exact: true })).toHaveCount(0);

  const plannedScreens = page.getByRole('heading', { name: /Planned ScreenGraph/ }).locator('xpath=ancestor::section[1]');
  for (const unrelatedScreen of ['Telemetry Dashboard', 'Log Explorer', 'API & Webhooks']) {
    await expect(plannedScreens.getByText(unrelatedScreen, { exact: true })).toHaveCount(0);
  }

  await page.screenshot({ path: testInfo.outputPath('application-overview-recipe-compose.png'), fullPage: true });
});
