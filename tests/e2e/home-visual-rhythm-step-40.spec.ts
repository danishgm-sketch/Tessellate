import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('mobile homepage keeps wrapped presets and the composer within the first 90svh', async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const uncaughtErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`
    )
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const hero = page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::section[1]');
  const heroBox = await hero.boundingBox();
  const compose = page.getByRole('button', { name: /^Compose$/ });
  const composeBox = await compose.boundingBox();

  if (
    process.env.CI !== 'true' &&
    testInfo.project.name === 'mobile-chrome' &&
    heroBox &&
    composeBox
  ) {
    const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-45');
    mkdirSync(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'aud-352-home-mobile-390-after.png');
    await page.screenshot({ path: screenshot });
    const presetRow = await page.locator('[aria-label="Preset briefs"]').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      labels: Array.from(element.querySelectorAll('button')).map((button) =>
        button.textContent?.trim()
      ),
    }));
    writeFileSync(
      path.join(evidenceDirectory, 'aud-352-home-mobile-390-after.json'),
      JSON.stringify(
        {
          route: '/',
          url: page.url(),
          viewport: '390x844',
          browserProject: testInfo.project.name,
          pageStatus: response?.status() ?? null,
          fontsStatus: await page.evaluate(() => document.fonts.status),
          heroHeight: heroBox.height,
          heroLimit: 844 * 0.9,
          composeBottom: composeBox.y + composeBox.height,
          documentWidth: await page.evaluate(() => ({
            inner: window.innerWidth,
            scroll: document.documentElement.scrollWidth,
          })),
          presetRow,
          screenshot: 'audit/evidence/step-45/aud-352-home-mobile-390-after.png',
          consoleErrors,
          uncaughtErrors,
          failedRequests,
          httpErrors,
        },
        null,
        2
      )
    );
  }

  expect(heroBox).not.toBeNull();
  expect(heroBox!.height).toBeLessThanOrEqual(844 * 0.9);

  expect(composeBox).not.toBeNull();
  expect(composeBox!.y + composeBox!.height).toBeLessThanOrEqual(844);

  const settings = page.getByText('Feel, ambition and structure', { exact: true });
  await settings.click();
  await expect(page.locator('#hero-mobile-interface-feel')).toBeVisible();
  await expect(page.locator('#hero-mobile-visual-ambition')).toBeVisible();
  await expect(page.locator('#hero-mobile-structural-creativity')).toBeVisible();
});
