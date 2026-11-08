import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const benchmarkCases = [
  {
    id: 'ECOM-01',
    brief:
      'A direct-to-consumer clothing store helps shoppers browse a seasonal catalog, compare garment details, choose a size, and complete checkout.',
    productType: 'Ecommerce',
    requiredScreens: ['Product Catalog', 'Product Detail', 'Checkout'],
    domainEvidence: ['example garment', 'material and sizing'],
    contamination: /marketing home|hero campaign|trading|portfolio|order book/i,
  },
  {
    id: 'ECOM-04',
    brief:
      'A digital music shop sells licensed albums, supports sample playback, and lets listeners buy and download selected releases.',
    productType: 'Media & Publishing',
    requiredScreens: ['Product Catalog', 'Product Detail'],
    domainEvidence: ['album', 'sample', 'download'],
    contamination: /physical shipment|shipping address|delivery window|order tracking|order delivery/i,
  },
  {
    id: 'TRV-03',
    brief:
      'A flight-management app organizes confirmed journeys, check-in reminders, gate updates, and travel documents for frequent flyers.',
    productType: 'Travel & Hospitality',
    requiredScreens: ['Journey Overview', 'Flight Details', 'Travel Documents'],
    domainEvidence: ['confirmed flight', 'check-in', 'gate'],
    contamination: /Destination Showcase|Property Detail|Hotel Booking|Room Details|destination discovery/i,
  },
  {
    id: 'MED-04',
    brief:
      'A streaming service helps viewers browse films, continue a watchlist, and explore editorial collections by theme.',
    productType: 'Media & Publishing',
    requiredScreens: ['Film Catalogue', 'Film Detail', 'Watchlist'],
    domainEvidence: ['film', 'watchlist', 'collection'],
    contamination: /Front Page Feed|Article Reader|Section Explorer|newspaper|journalism/i,
  },
] as const;

type DirectionSnapshot = {
  id: string;
  screens: Array<{ id: string; name: string; rootNode: unknown }>;
  diagnostics: unknown[];
};

test('specialized ecommerce, flight, and film briefs keep their domain workflows across all directions', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    badResponses: [] as Array<{ url: string; status: number }>,
  };
  const evidenceDirectory = process.env.TESSLLATE_STEP45_EVIDENCE_DIR
    ? path.resolve(process.env.TESSLLATE_STEP45_EVIDENCE_DIR)
    : testInfo.outputPath('domain-workflows');
  mkdirSync(evidenceDirectory, { recursive: true });
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtime.badResponses.push({ url: response.url(), status: response.status() });
    }
  });

  const results = [];
  for (const benchmark of benchmarkCases) {
    await page.goto('/compose');
    await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
    await page.locator('#description').fill(benchmark.brief);
    await page.locator('#feel').fill('clear, trustworthy, and specific to the product');
    await page.getByRole('button', { name: 'Refined' }).click();
    await page.getByTestId('compose-submit-btn').click();
    await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Planned screens/ })).toBeVisible();
    await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);

    const architectureText = await page.locator('body').innerText();
    expect(architectureText).toContain(benchmark.productType);
    for (const screenName of benchmark.requiredScreens) {
      expect(architectureText, `${benchmark.id} should plan ${screenName}`).toContain(screenName);
    }

    const directionResults = [];
    for (const number of ['01', '02', '03']) {
      const card = page.getByTestId(`direction-card-${number}`);
      await expect(card).toBeVisible();
      await expect(card.getByTestId(`direction-preview-${number}`)).toBeVisible();
      await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
      const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.tess-screen')).toBeVisible();
      await expect(dialog.getByRole('combobox', { name: 'Direction preview screen' })).toBeVisible();

      const details = dialog.locator('details').filter({ hasText: 'Design DNA and resource references' });
      await details.locator('summary').click();
      const snapshot = JSON.parse(await details.locator('pre').innerText()) as DirectionSnapshot;
      const screenNames = snapshot.screens.map((screen) => screen.name);
      const serializedScreens = JSON.stringify(snapshot.screens);
      expect(snapshot.diagnostics, `${benchmark.id} Direction ${number} unresolved diagnostics`).toEqual([]);
      for (const screenName of benchmark.requiredScreens) {
        expect(screenNames, `${benchmark.id} Direction ${number} should include ${screenName}`).toContain(screenName);
      }
      for (const evidence of benchmark.domainEvidence) {
        expect(serializedScreens.toLowerCase(), `${benchmark.id} Direction ${number} should include ${evidence}`).toContain(evidence);
      }
      expect(serializedScreens, `${benchmark.id} Direction ${number} contains cross-domain content`).not.toMatch(
        benchmark.contamination
      );

      const screenshot = path.join(
        evidenceDirectory,
        `${benchmark.id.toLowerCase()}-${testInfo.project.name}-direction-${number}.png`
      );
      await dialog.screenshot({ path: screenshot, animations: 'disabled' });
      directionResults.push({ id: snapshot.id, number, screenNames, screenshot: path.relative(process.cwd(), screenshot) });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
    results.push({ id: benchmark.id, productType: benchmark.productType, directions: directionResults });
  }

  const reportPath = path.join(
    evidenceDirectory,
    `domain-workflow-results-${testInfo.project.name}.json`
  );
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    `${JSON.stringify({ site: page.url(), viewport: page.viewportSize(), results, runtime }, null, 2)}\n`,
    'utf8'
  );
  await testInfo.attach('domain-workflow-results', { path: reportPath, contentType: 'application/json' });
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.badResponses).toEqual([]);
});

test('marine field research preview navigation changes screens in place on mobile', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const evidenceDirectory = process.env.TESSLLATE_STEP45_EVIDENCE_DIR
    ? path.resolve(process.env.TESSLLATE_STEP45_EVIDENCE_DIR)
    : testInfo.outputPath('marine-field-preview');
  mkdirSync(evidenceDirectory, { recursive: true });
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    badResponses: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtime.badResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(
    'A marine biology field atlas for 12 survey crews: offline transects, species evidence, permit workflows, and a calm review queue.'
  );
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByText('Your brief points to: Marine Field Research.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planned screens (4)' })).toBeVisible();
  const preview = page.getByTestId('direction-preview-01');
  const directionCard = page.getByTestId('direction-card-01');
  await expect(preview).toBeVisible();
  const checkedScreens: string[] = [];

  for (const screenName of [
    'Field Survey',
    'Observation Review',
    'Permits & Protocols',
    'Survey Overview',
  ]) {
    await preview.getByRole('link', { name: screenName }).click();
    await expect(preview.getByRole('heading', { name: screenName })).toBeVisible();
    await expect(preview.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });
    await expect(directionCard).toContainText(`Screen Preview: ${screenName}`);
    await expect(page).not.toHaveURL(/#screen-/);
    checkedScreens.push(screenName);
    if (screenName === 'Field Survey') {
      await expect(
        preview.getByText('Capture species observations, location notes, and field evidence along a transect')
      ).toBeVisible();
      const screenshotPath = path.join(
        evidenceDirectory,
        'compose-marine-field-preview-mobile-390x844.png'
      );
      await directionCard.screenshot({ path: screenshotPath, animations: 'disabled' });
      await testInfo.attach('marine-field-preview-mobile', {
        path: screenshotPath,
        contentType: 'image/png',
      });
    }
  }

  const responsiveState = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(responsiveState.viewportWidth).toBe(390);
  expect(responsiveState.documentWidth).toBeLessThanOrEqual(responsiveState.viewportWidth);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.badResponses).toEqual([]);
  writeFileSync(
    path.join(evidenceDirectory, 'compose-marine-field-preview-mobile.json'),
    `${JSON.stringify({
      brief: 'A marine biology field atlas for 12 survey crews: offline transects, species evidence, permit workflows, and a calm review queue.',
      url: page.url(),
      viewport: page.viewportSize(),
      archetype: 'intelligence-research',
      specialization: 'Marine Field Research',
      screens: checkedScreens,
      responsiveState,
      runtime,
      result: 'PASS',
    }, null, 2)}\n`,
    'utf8'
  );
});
