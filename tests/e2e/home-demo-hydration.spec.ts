import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

test('homepage route reaches Compose and waits for the live catalogue', async ({
  page,
  isMobile,
}) => {
  const diagnostics = {
    consoleErrors: [] as string[],
    uncaught: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.uncaught.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400)
      diagnostics.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  const homeResponse = await page.goto('/');
  expect(homeResponse?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Describe the product. Get the interface.' })
  ).toBeVisible();
  if (isMobile) {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page
      .getByRole('dialog', { name: 'Main navigation' })
      .getByRole('link', { name: 'Product Composer' })
      .click();
  } else {
    await page.getByRole('link', { name: 'Compose', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/compose\/?$/);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  expect(diagnostics).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});

test('homepage example-directions action produces three real previews', async ({
  page,
}, testInfo) => {
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

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const generateButton = page.getByRole('button', { name: 'Generate example directions' });
  await expect(generateButton).toBeEnabled({ timeout: 30_000 });
  await generateButton.click();
  const demo = page.locator('#three-directions-demo');
  const directionNames = ['Direction A', 'Direction B', 'Direction C'];
  const cards = directionNames.map((name) =>
    demo.getByRole('heading', { name, exact: true }).locator('xpath=ancestor::article[1]')
  );
  for (const name of directionNames) {
    await expect(demo.getByRole('heading', { name, exact: true })).toBeVisible({ timeout: 30_000 });
  }
  const navigationModels: string[] = [];
  for (const card of cards) {
    await expect(card).toBeVisible();
    await expect(card.locator('.tess-screen')).toBeVisible();
    await expect(card.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
    await expect(card.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
      0
    );
    const text = await card.innerText();
    expect(text).not.toMatch(
      /trading desk|order book|portfolio allocation|infrastructure latency/i
    );
    const model = text.match(/\b(sidebar|top-nav|rail) ·/)?.[1];
    expect(model).toBeTruthy();
    navigationModels.push(model!);
  }
  expect(new Set(navigationModels).size).toBe(3);
  const evidence = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/home-demo-hydration'
  );
  fs.mkdirSync(evidence, { recursive: true });
  await page.screenshot({
    path: path.join(evidence, `${testInfo.project.name}-directions.png`),
    fullPage: true,
    animations: 'disabled',
  });
  const report = {
    route: page.url(),
    viewport: page.viewportSize(),
    status: response?.status(),
    directions: directionNames,
    navigationModels,
    consoleErrors,
    uncaught,
    failedRequests,
    httpErrors,
  };
  fs.writeFileSync(
    path.join(evidence, `${testInfo.project.name}-report.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
  await cards[2]!.getByRole('button', { name: 'Choose Direction C', exact: true }).click();
  await expect(page).toHaveURL(/\/workbench\?project=/);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  expect({ consoleErrors, uncaught, failedRequests, httpErrors }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
    httpErrors: [],
  });
});

test('homepage example control is unavailable until its island is hydrated', async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const uncaught: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT'))
      consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => {
    if (!request.url().includes('/_astro/ThreeDirectionsDemo.')) failedRequests.push(request.url());
  });
  await page.route('**/_astro/ThreeDirectionsDemo.*.js', (route) => route.abort('blockedbyclient'));
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const button = page.getByRole('button', { name: 'Generate example directions' });
  await expect(button).toBeVisible();
  const readiness = page.locator('#example-directions-readiness');
  await expect(readiness).toHaveText('Preparing the example composer…');
  await readiness.scrollIntoViewIfNeeded();
  const buttonState = await button.evaluate((element) => ({
    disabled: (element as HTMLButtonElement).disabled,
    describedBy: element.getAttribute('aria-describedby'),
  }));
  const evidence = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/home-demo-hydration'
  );
  fs.mkdirSync(evidence, { recursive: true });
  const screenshot = path.join(evidence, `pre-hydration-${testInfo.project.name}.png`);
  await page.screenshot({ path: screenshot, animations: 'disabled' });
  fs.writeFileSync(
    path.join(evidence, `pre-hydration-${testInfo.project.name}.json`),
    `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), status: response?.status(), buttonState, consoleErrors, uncaught, failedRequests, screenshot }, null, 2)}\n`
  );
  expect(
    buttonState.disabled,
    'A server-rendered homepage action must not be enabled before its click handler is ready.'
  ).toBe(true);
  expect(buttonState.describedBy).toBe('example-directions-readiness');
  expect({ consoleErrors, uncaught, failedRequests }).toEqual({
    consoleErrors: [],
    uncaught: [],
    failedRequests: [],
  });
});
