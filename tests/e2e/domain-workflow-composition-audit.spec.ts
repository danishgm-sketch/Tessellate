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

test('adult offline language learning stays specific across all Compose directions', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const evidenceDirectory = process.env.TESSLLATE_STEP45_EVIDENCE_DIR
    ? path.resolve(process.env.TESSLLATE_STEP45_EVIDENCE_DIR)
    : testInfo.outputPath('adult-language-learning');
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

  const brief =
    'An offline-first Spanish learning app for adults with dyslexia who study in 10-minute sessions. Include clear progress, adjustable text spacing, audio pronunciation, short speaking practice, and downloadable lessons for commutes with no mobile signal.';
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('warm, encouraging, readable, and free of pressure');
  await page.getByRole('button', { name: 'Advanced Constraints & Devices' }).click();
  const accessibilityFloor = page.getByRole('combobox', { name: 'Accessibility Floor' });
  await expect(accessibilityFloor).toHaveValue('AA');

  const deviceGroup = page.getByRole('group', { name: 'Target Devices' });
  const desktopDevice = deviceGroup.getByRole('button', { name: 'Desktop' });
  const tabletDevice = deviceGroup.getByRole('button', { name: 'Tablet' });
  const mobileDevice = deviceGroup.getByRole('button', { name: 'Mobile' });
  if ((await desktopDevice.getAttribute('aria-pressed')) === 'true') await desktopDevice.click();
  if ((await tabletDevice.getAttribute('aria-pressed')) === 'true') await tabletDevice.click();
  await expect(mobileDevice).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByText('Your brief points to: Language Learning.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planned screens (4)' })).toBeVisible();
  const expectedScreens = ['Today', 'Practice Session', 'Vocabulary Review', 'Offline Library'];
  for (const number of ['01', '02', '03']) {
    await expect(page.getByTestId(`direction-diagnostics-summary-${number}`)).toHaveText(
      '6 required interface roles have no eligible resource in the current catalogue.'
    );
  }
  const diagnosticsSummary = page.getByTestId('direction-diagnostics-summary-01');
  await diagnosticsSummary.scrollIntoViewIfNeeded();
  for (const number of ['01', '02', '03']) {
    await expect(page.getByTestId(`direction-preview-${number}`).getByTestId('resource-loading'))
      .toHaveCount(0, { timeout: 15_000 });
  }
  const composeScreenshot = path.join(
    evidenceDirectory,
    `language-learning-compose-directions-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: composeScreenshot, animations: 'disabled' });
  await testInfo.attach('language-learning-compose-directions', {
    path: composeScreenshot,
    contentType: 'image/png',
  });
  const directions = [];

  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    const screenSelect = dialog.getByRole('combobox', { name: 'Direction preview screen' });
    const dna = dialog.locator('details').filter({ hasText: 'Design DNA and resource references' });
    await dna.locator('summary').click();
    const snapshot = JSON.parse(await dna.locator('pre').innerText()) as DirectionSnapshot;
    await dna.locator('summary').click();
    expect(snapshot.screens.map((screen) => screen.name)).toEqual(expectedScreens);
    expect(snapshot.diagnostics.map((diagnostic) => diagnostic.role).sort()).toEqual([
      'dyslexia-friendly-reading-controls',
      'dyslexia-friendly-reading-controls',
      'language-progress-summary',
      'offline-lesson-downloads',
      'pronunciation-audio',
      'speaking-practice',
      'vocabulary-review',
    ]);
    const screenData = JSON.stringify(snapshot.screens).toLowerCase();
    expect(screenData).toContain('speaking');
    expect(screenData).toContain('pronunciation');
    expect(screenData).toContain('dyslexia-friendly');
    expect(screenData).toContain('download');
    expect(screenData).not.toMatch(/gradebook|cohort|essay|claim xp|certification catalog|kanban-board/);

    const renderedScreens = [];
    for (const screen of snapshot.screens) {
      await screenSelect.selectOption(screen.id);
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas.getByRole('heading', { name: screen.name, level: 2 })).toBeVisible();
      await expect(dialog.getByTestId('resource-loading')).toHaveCount(0, { timeout: 15_000 });
      const unresolvedRoles = canvas.getByTestId('unresolved-required-role-diagnostic');
      const expectedUnresolvedRoles: Record<string, string[]> = {
        Today: ['language-progress-summary'],
        'Practice Session': [
          'pronunciation-audio',
          'speaking-practice',
          'dyslexia-friendly-reading-controls',
        ],
        'Vocabulary Review': ['vocabulary-review', 'dyslexia-friendly-reading-controls'],
        'Offline Library': ['offline-lesson-downloads'],
      };
      const expectedRoles = expectedUnresolvedRoles[screen.name] ?? [];
      await expect(unresolvedRoles).toHaveCount(expectedRoles.length);
      for (const role of expectedRoles) {
        await expect(unresolvedRoles.filter({ hasText: `Unresolved Required Role: ${role}` })).toBeVisible();
      }
      renderedScreens.push(screen.name);
      if (screen.name === 'Practice Session') {
        const screenshotPath = path.join(
          evidenceDirectory,
          `language-learning-practice-direction-${number}-${testInfo.project.name}.png`
        );
        await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
        await testInfo.attach(`language-learning-practice-direction-${number}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    }
    directions.push({ number, screens: renderedScreens, diagnostics: snapshot.diagnostics });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  const responsive = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(responsive.document).toBeLessThanOrEqual(responsive.viewport);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.badResponses).toEqual([]);
  writeFileSync(
    path.join(evidenceDirectory, `language-learning-${testInfo.project.name}.json`),
    `${JSON.stringify({ brief, viewport: page.viewportSize(), responsive, directions, runtime }, null, 2)}\n`,
    'utf8'
  );
});
