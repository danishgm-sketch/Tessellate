import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';

const brief =
  'A public drinking-water utility operations workspace helps field crews and control-room dispatchers respond to burst mains and planned outages across three districts. Teams need to locate affected streets, assign qualified repair crews, verify isolation and water-quality clearance before service returns, and prepare accessible resident updates. Technicians use phones with intermittent connectivity. This is an offline product prototype with sample data only.';

function findManifestNode(value: unknown, targetId: string): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findManifestNode(child, targetId);
      if (match) return match;
    }
    return undefined;
  }
  if (typeof value !== 'object' || value === null) return undefined;

  const record = value as Record<string, unknown>;
  if (record.id === targetId) return record;
  for (const child of Object.values(record)) {
    const match = findManifestNode(child, targetId);
    if (match) return match;
  }
  return undefined;
}

test('inspect a municipal water response brief through the visible composer', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 15_000,
  });
  await page.getByLabel('Product Description & Objectives').fill(brief);
  await page.getByLabel('Desired Feel / Adjectives').fill('calm, precise, and reassuring');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  const expectedScreens = [
    'Network Operations',
    'Outage & Incident Queue',
    'Repair Work Orders',
    'Water Quality Clearance',
    'Resident Updates',
  ];
  expect(bodyText).toContain('Your brief points to: Public Water Operations.');
  expect(bodyText).toMatch(/Network controllers, water-quality reviewers, field technicians/);
  expect(bodyText).toMatch(/Restore public water service safely/);
  expect(bodyText).toContain('Planned screens (5)');
  expect(bodyText).not.toMatch(/Inventory Catalog|Purchase Orders/);

  const directions: Array<{
    id: string;
    screenOptions: string[];
    screens: Record<string, string>;
  }> = [];
  for (const id of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${id}`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${id}`) });
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const screenOptions = await screenSelect.locator('option').allTextContents();
    const manifestDetails = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await manifestDetails.locator('summary').click();
    const manifest = JSON.parse(await manifestDetails.locator('pre').innerText()) as {
      screens: Array<{ name: string; rootNode: unknown }>;
    };
    const screens: Record<string, string> = {};
    expect(screenOptions.map((option) => option.trim()).filter(Boolean)).toEqual(expectedScreens);
    for (const option of screenOptions) {
      if (!option.trim()) continue;
      await screenSelect.selectOption({ label: option.trim() });
      const canvas = dialog.locator('.tess-screen');
      const pendingResource = await canvas.getByTestId('resource-loading').evaluateAll((elements) =>
        elements.map((element) => {
          let parent = element.parentElement;
          while (parent && !parent.closest('.tess-screen')?.isSameNode(parent)) {
            const nodeId = parent.getAttribute('data-node-id');
            if (nodeId) {
              return { nodeId, semanticRole: parent.getAttribute('data-semantic-role') };
            }
            parent = parent.parentElement;
          }
          return { nodeId: null, semanticRole: null };
        })
      );
      if (pendingResource.length > 0) {
        const selectedScreen = manifest.screens.find((screen) => screen.name === option.trim());
        fs.writeFileSync(
          testInfo.outputPath(
            `water-utility-pending-${id}-${option.trim().replace(/\W+/g, '-')}.json`
          ),
          JSON.stringify(
            {
              screen: option.trim(),
              pendingResource: pendingResource.map((item) => ({
                ...item,
                manifestNode: item.nodeId
                  ? findManifestNode(selectedScreen?.rootNode, item.nodeId)
                  : undefined,
              })),
            },
            null,
            2
          )
        );
      }
      await expect(canvas.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });
      await expect(canvas.locator('[data-semantic-role]')).not.toHaveCount(0);
      await expect(canvas.getByTestId('missing-resource-recovery')).toHaveCount(0);
      await expect(canvas.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(0);
      expect(
        await canvas.evaluate((element) => element.scrollWidth - element.clientWidth),
        `${id} ${option.trim()} preview should not overflow horizontally`
      ).toBeLessThanOrEqual(1);
      screens[option.trim()] = await canvas.innerText();
      if (id === '01' || option.trim() === 'Network Operations') {
        const safeName = option
          .trim()
          .replace(/[^a-z0-9]+/gi, '-')
          .toLocaleLowerCase();
        await dialog.screenshot({
          path: testInfo.outputPath(`water-utility-${id}-${safeName}.png`),
          animations: 'disabled',
        });
      }
    }
    const screenCopy = Object.fromEntries(
      Object.entries(screens).map(([name, copy]) => [name, copy.toLocaleLowerCase()])
    );
    expect(screenCopy['Network Operations']).toContain('water service response status');
    expect(screenCopy['Network Operations']).toContain('open service incidents');
    expect(screenCopy['Network Operations']).toContain('no connected data');
    expect(screenCopy['Outage & Incident Queue']).toContain('example service incident a');
    expect(screenCopy['Outage & Incident Queue']).toContain('incident service not connected');
    expect(screenCopy['Repair Work Orders']).toContain('triage a water service interruption');
    expect(screenCopy['Repair Work Orders']).toContain('verify isolation and record repair progress');
    expect(screenCopy['Repair Work Orders']).not.toContain(
      'prepare an accessible update for residents'
    );
    expect(screenCopy['Water Quality Clearance']).toContain('example water-quality clearance a');
    expect(screenCopy['Water Quality Clearance']).toContain('clearance service not connected');
    expect(screenCopy['Water Quality Clearance']).toContain('test results not connected');
    expect(screenCopy['Resident Updates']).toContain('prepare an accessible update for residents');
    expect(screenCopy['Resident Updates']).toContain('accessible and translated formats');
    expect(screenCopy['Resident Updates']).not.toContain('triage a water service interruption');
    expect(screenCopy['Resident Updates']).not.toContain('review water quality evidence');

    await screenSelect.focus();
    await screenSelect.press('ArrowUp');
    await expect(screenSelect.locator('option:checked')).toHaveText('Water Quality Clearance');
    directions.push({ id, screenOptions, screens });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  fs.writeFileSync(
    testInfo.outputPath('water-utility-compose-observation.json'),
    JSON.stringify(
      { brief, bodyText, directions, consoleErrors, uncaught, failedRequests, httpErrors },
      null,
      2
    )
  );
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});
