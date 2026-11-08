import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

const mealPlannerBrief =
  'A mobile-first meal-planning app for busy households of 2–5 people. Plan five weeknight dinners from dietary preferences and pantry ingredients, create consolidated shopping lists, let adult household members suggest and vote on meals, track pantry freshness, and set optional weekly grocery budgets. No bank accounts, payments, transfers, transaction history, bill pay, or financial dashboards. Lists must work offline in a grocery store and sync across adults. Recipes need editable portions, clear allergen labels, and large-text controls; adults manage household membership.';

test('meal-planning brief ignores explicitly excluded financial functions', async ({ page, isMobile }) => {
  test.setTimeout(120_000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-524');
  mkdirSync(evidenceDirectory, { recursive: true });
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 15_000 });
  await page.locator('#description').fill(mealPlannerBrief);
  await page.locator('#feel').fill(
    'warm editorial food journal, confident typography, fresh produce photography, restrained tomato red and herb green, accessible large text'
  );
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByText('Your brief points to: Consumer Productivity.')).toBeVisible();
  await expect(page.getByText('Your brief points to: Fintech.')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Planned screens (3)' })).toBeVisible();
  await expect(page.getByText('Weekly Meal Plan', { exact: true })).toBeVisible();
  await expect(page.getByText('Recipes & Dietary Needs', { exact: true })).toBeVisible();
  await expect(page.getByText('Shopping List & Pantry', { exact: true })).toBeVisible();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  await expect(page.locator('body')).not.toContainText('Finance managers, compliance teams, and account holders');
  await expect(page.locator('body')).not.toContainText('Account Balances');
  await expect(page.locator('body')).not.toContainText('Transaction History');
  await expect(page.locator('body')).not.toContainText('money movement and reconciliation');

  const directions = [];
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    const preview = page.getByTestId(`direction-preview-${number}`);
    await expect(preview.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });
    const visibleText = await card.innerText();
    expect(visibleText).not.toMatch(/account balances|transaction history|money movement|ledger/i);
    directions.push({ number, visibleText });
  }

  const responsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(responsive.documentWidth).toBeLessThanOrEqual(responsive.viewportWidth);
  await page.screenshot({
    path: path.join(evidenceDirectory, `meal-planner-compose-${viewportLabel}.png`),
    fullPage: true,
    animations: 'disabled',
  });

  writeFileSync(
    path.join(evidenceDirectory, `meal-planner-${viewportLabel}.json`),
    `${JSON.stringify({
      url: page.url(),
      viewport: page.viewportSize(),
      brief: mealPlannerBrief,
      pageCopy: await page.locator('body').innerText(),
      directions,
      responsive,
      runtime,
    }, null, 2)}\n`
  );

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);

  await page.getByTestId('open-workbench-dir-01').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 45_000 });
  if (isMobile) {
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  } else {
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
  }

  const activeManifestValue = await page.evaluate(() => {
    const activeProject = localStorage.getItem('tessellate_active_project');
    return activeProject ? JSON.parse(activeProject) : null;
  });
  const activeManifest = ProjectManifestSchema.parse(activeManifestValue);
  const projectRecord = await page.evaluate((projectId) => {
    const savedProject = localStorage.getItem(`tessellate_project_${projectId}`);
    return savedProject ? JSON.parse(savedProject) : null;
  }, activeManifest.id);
  expect(ProjectManifestSchema.parse(projectRecord)).toEqual(activeManifest);
  expect(activeManifest.productModel.productArchetypes[0]?.tag).toBe('productivity');
  expect(activeManifest.productModel.entities.map((entity) => entity.name)).toEqual([
    'WeeklyMealPlan',
    'Recipe',
    'PantryItem',
    'ShoppingList',
    'MealSuggestion',
  ]);
  expect(activeManifest.productModel.workflows.map((workflow) => workflow.id)).toEqual([
    'plan-weeknight-meals',
    'build-shopping-list',
    'coordinate-meal-suggestions',
    'track-pantry-freshness',
  ]);
  expect(activeManifest.productModel.likelyScreens.map((screen) => screen.name)).toEqual([
    'Weekly Meal Plan',
    'Recipes & Dietary Needs',
    'Shopping List & Pantry',
  ]);
  const inferredPlan = JSON.stringify({
    audience: activeManifest.productModel.primaryAudience,
    objective: activeManifest.productModel.primaryObjective,
    entities: activeManifest.productModel.entities,
    workflows: activeManifest.productModel.workflows,
    screens: activeManifest.productModel.likelyScreens,
  }).toLowerCase();
  expect(inferredPlan).not.toMatch(
    /account balances|transaction history|transfer funds|money movement/
  );

  await page.getByTestId('export-button').click();
  const manifestDownloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestDownloadPending;
  expect(manifestDownload.suggestedFilename()).toMatch(/\.tess\.json$/);
  const manifestPath = await manifestDownload.path();
  expect(manifestPath).not.toBeNull();
  const exportedManifest = ProjectManifestSchema.parse(
    JSON.parse(readFileSync(manifestPath!, 'utf8'))
  );
  expect(exportedManifest).toEqual(activeManifest);

  const workbenchResponsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(workbenchResponsive.documentWidth).toBeLessThanOrEqual(workbenchResponsive.viewportWidth);
  await page.screenshot({
    path: path.join(evidenceDirectory, `meal-planner-workbench-${viewportLabel}.png`),
    fullPage: true,
    animations: 'disabled',
  });
  writeFileSync(
    path.join(evidenceDirectory, `meal-planner-workbench-${viewportLabel}.json`),
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        projectId: activeManifest.id,
        storedManifestMatchesActive: true,
        exportedManifestMatchesActive: true,
        entities: activeManifest.productModel.entities.map((entity) => entity.name),
        workflows: activeManifest.productModel.workflows.map((workflow) => workflow.id),
        screens: activeManifest.productModel.likelyScreens.map((screen) => screen.name),
        responsive: workbenchResponsive,
        runtime,
      },
      null,
      2
    )}\n`
  );

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
