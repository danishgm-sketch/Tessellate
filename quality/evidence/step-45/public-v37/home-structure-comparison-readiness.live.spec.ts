import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type PageAudit = {
  consoleErrors: string[];
  uncaughtExceptions: string[];
  failedRequests: string[];
  httpErrors: Array<{ url: string; status: number }>;
};

function watchPage(page: Page): PageAudit {
  const audit: PageAudit = {
    consoleErrors: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') audit.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => audit.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => audit.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) audit.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return audit;
}

test('homepage structure selectors stay disabled until the visible island hydrates', async ({ browser }) => {
  test.skip(test.info().project.name !== 'sites-mobile-chromium', 'Capture the narrow pre-hydration state.');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const audit = watchPage(page);

  try {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const section = page.locator('section').filter({ hasText: 'Screen Architecture Grammar' }).first();
    await section.scrollIntoViewIfNeeded();
    const selector = section.getByRole('button', { name: 'Modular Cockpit (Three-Pane)' });
    const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/structure');
    await mkdir(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'aud-354-mobile-after.png');
    await page.screenshot({ path: screenshot });
    await writeFile(
      path.join(evidenceDirectory, 'aud-354-mobile-after.json'),
      `${JSON.stringify(
        {
          route: page.url(),
          viewport: page.viewportSize(),
          javascriptEnabled: false,
          responseStatus: response?.status(),
          selector: {
            text: await selector.innerText(),
            disabled: await selector.isDisabled(),
            ariaDisabled: await selector.getAttribute('aria-disabled'),
          },
          audit,
          screenshot,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
    await expect(selector).toBeDisabled();
    await expect(section.getByText('Diagram selectors become available after this example loads.')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('homepage wireframe keeps every pane inside the visible diagram before JavaScript', async ({ browser }) => {
  test.skip(test.info().project.name !== 'sites-mobile-chromium', 'Check the narrow layout preview.');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const audit = watchPage(page);
  try {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const section = page.locator('section').filter({ hasText: 'Screen Architecture Grammar' }).first();
    await section.scrollIntoViewIfNeeded();
    const frame = section.getByText('DESKTOP WIREFRAME').locator('xpath=../../..');
    const layout = frame.locator('div.flex-1.my-3.flex.gap-3').first();
    const geometry = await layout.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/structure');
    await mkdir(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'aud-355-mobile-nojs-after.png');
    await page.screenshot({ path: screenshot });
    await writeFile(
      path.join(evidenceDirectory, 'aud-355-mobile-nojs-after.json'),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), geometry, audit, screenshot }, null, 2)}\n`,
      'utf8',
    );
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight);
  } finally {
    await context.close();
  }
});

test('tablet homepage wireframe keeps the complete three-pane diagram visible', async ({ browser }) => {
  test.skip(test.info().project.name !== 'sites-mobile-chromium', 'Check the tablet breakpoint.');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 768, height: 844 },
  });
  const page = await context.newPage();
  const audit = watchPage(page);
  try {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const section = page.locator('section').filter({ hasText: 'Screen Architecture Grammar' }).first();
    await section.scrollIntoViewIfNeeded();
    const frame = section.getByText('DESKTOP WIREFRAME').locator('xpath=../../..');
    const layout = frame.locator('div.flex-1.my-3.flex.gap-3').first();
    const geometry = await layout.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/structure');
    await mkdir(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'aud-355-768-before.png');
    await page.screenshot({ path: screenshot });
    await writeFile(
      path.join(evidenceDirectory, 'aud-355-768-before.json'),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), geometry, audit, screenshot }, null, 2)}\n`,
      'utf8',
    );
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight);
  } finally {
    await context.close();
  }
});

test('homepage wireframe fits without clipping across phone, tablet, and desktop widths', async ({ page }) => {
  test.skip(test.info().project.name !== 'sites-mobile-chromium', 'Run one explicit width matrix.');
  const audit = watchPage(page);
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const section = page.locator('section').filter({ hasText: 'Screen Architecture Grammar' }).first();
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/structure');
  await mkdir(evidenceDirectory, { recursive: true });
  const widths = [360, 390, 430, 768, 1024, 1440];
  const records: Array<{
    width: number;
    geometry: Record<string, number>;
    mainContentWidth?: number | null;
  }> = [];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await section.scrollIntoViewIfNeeded();
    const cockpit = section.getByRole('button', { name: 'Modular Cockpit (Three-Pane)' });
    await expect(cockpit).toBeEnabled();
    await cockpit.click();
    await expect(cockpit).toHaveAttribute('aria-pressed', 'true');
    await expect(section.getByText('LAYOUT GRAMMAR: THREE_PANE_COCKPIT')).toBeVisible();
    const frame = section.getByText('DESKTOP WIREFRAME').locator('xpath=../../..');
    const layout = frame.locator('div.flex-1.my-3.flex.gap-3').first();
    const geometry = await layout.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    let mainContentWidth: number | null = null;
    if (width === 768) {
      const mainContentPanel = section.getByText('Example main content').locator('..');
      mainContentWidth = (await mainContentPanel.boundingBox())?.width ?? null;
    }
    records.push({ width, geometry, ...(width === 768 ? { mainContentWidth } : {}) });
    await page.screenshot({ path: path.join(evidenceDirectory, `aud-355-${width}-after.png`) });
    expect(geometry.scrollWidth, `${width}px diagram content width`).toBeLessThanOrEqual(
      geometry.clientWidth,
    );
    expect(geometry.scrollHeight, `${width}px diagram content height`).toBeLessThanOrEqual(
      geometry.clientHeight,
    );
    if (width === 768) {
      expect(mainContentWidth, '768px main content panel remains readable').toBeGreaterThanOrEqual(260);
    }
  }

  await writeFile(
    path.join(evidenceDirectory, 'aud-355-responsive-after.json'),
    `${JSON.stringify({ route: page.url(), widths: records, audit }, null, 2)}\n`,
    'utf8',
  );
  expect(audit.consoleErrors).toEqual([]);
  expect(audit.uncaughtExceptions).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpErrors).toEqual([]);
});

test('hydrated homepage structure selectors change the visible layout diagram without mobile clipping', async ({ page }) => {
  const audit = watchPage(page);

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const section = page.locator('section').filter({ hasText: 'Screen Architecture Grammar' }).first();
  await section.scrollIntoViewIfNeeded();
  const cockpit = section.getByRole('button', { name: 'Modular Cockpit (Three-Pane)' });
  await expect(cockpit).toBeEnabled();
  await cockpit.click();
  await expect(section.getByText('LAYOUT GRAMMAR: THREE_PANE_COCKPIT')).toBeVisible();
  await expect(cockpit).toHaveAttribute('aria-pressed', 'true');
  if (page.viewportSize()?.width === 390) {
    const frame = section.getByText('DESKTOP WIREFRAME').locator('xpath=../../..');
    const layout = frame.locator('div.flex-1.my-3.flex.gap-3').first();
    const geometry = await layout.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/structure');
    await mkdir(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'aud-355-mobile-after.png');
    await page.screenshot({ path: screenshot });
    await writeFile(
      path.join(evidenceDirectory, 'aud-355-mobile-after.json'),
      `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), geometry, screenshot }, null, 2)}\n`,
      'utf8',
    );
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight);
  }
  expect(audit.consoleErrors).toEqual([]);
  expect(audit.uncaughtExceptions).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpErrors).toEqual([]);
});
