import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

test('deployed mobile visual-spectrum preview title remains readable without clipping', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Essential → Experimental.' }) }).first();
  await section.scrollIntoViewIfNeeded();
  const title = section.getByRole('heading', { name: 'Tessellate Design Preview' });
  await expect(title).toBeVisible();
  const measurements: Array<{ width: number; titleHeight: number; documentWidth: number; viewportWidth: number }> = [];
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const box = await title.boundingBox();
    const dimensions = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: document.documentElement.clientWidth }));
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(40);
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
    measurements.push({ width, titleHeight: box!.height, ...dimensions });
    if (width === 390) await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/home-spectrum-mobile-390.png'), fullPage: false });
  }
  const evidence = { route: page.url(), responseStatus: response?.status(), measurements, consoleErrors, pageErrors, failedRequests, badResponses };
  const output = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/home-spectrum-live.json');
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test('deployed homepage presets remain readable and Compose stays in the first mobile viewport', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const firstCsp = response?.headers()['content-security-policy'] ?? '';
  const firstNonce = firstCsp.match(/'nonce-([^']+)'/)?.[1] ?? null;
  const secondResponse = await page.reload();
  expect(secondResponse?.status()).toBe(200);
  const secondCsp = secondResponse?.headers()['content-security-policy'] ?? '';
  const secondNonce = secondCsp.match(/'nonce-([^']+)'/)?.[1] ?? null;
  const security = {
    hasResponseNonce: firstNonce !== null,
    nonceRotatedOnReload: firstNonce !== null && secondNonce !== null && firstNonce !== secondNonce,
    scriptSrcAllowsUnsafeInline: /(?:^|;)\s*script-src(?:\s|$)[^;]*'unsafe-inline'/.test(firstCsp),
    allowsLoopbackOrigins: /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/.test(firstCsp),
  };
  expect(security.hasResponseNonce).toBe(true);
  expect(security.nonceRotatedOnReload).toBe(true);
  expect(security.scriptSrcAllowsUnsafeInline).toBe(false);
  expect(security.allowsLoopbackOrigins).toBe(false);
  const heading = page.getByRole('heading', { name: 'Describe the product. Get the interface.' });
  await expect(heading).toBeVisible();
  const presetNames = [
    'AI research terminal',
    'luxury travel marketplace',
    'playful HR platform',
    'developer observability tool',
    'minimalist finance app',
  ];
  const compose = page.getByRole('button', { name: 'Compose', exact: true }).first();
  const measurements: Array<Record<string, unknown>> = [];
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of presetNames) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    await expect(compose).toBeVisible();
    const geometry = await page.evaluate(() => {
      const title = [...document.querySelectorAll('h1')].find((element) => element.textContent?.includes('Describe the product.'));
      const hero = title?.closest('section');
      const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.trim() === 'Compose');
      const heroRect = hero?.getBoundingClientRect();
      const buttonRect = button?.getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        heroTop: heroRect?.top ?? null,
        heroHeight: heroRect?.height ?? null,
        heroLimit90svh: window.innerHeight * 0.9,
        composeTop: buttonRect?.top ?? null,
        composeBottom: buttonRect?.bottom ?? null,
        presets: [...document.querySelectorAll('button')]
          .filter((element) => ['AI research terminal', 'luxury travel marketplace', 'playful HR platform', 'developer observability tool', 'minimalist finance app'].includes(element.textContent?.trim() ?? ''))
          .map((element) => ({ label: element.textContent?.trim(), clipped: element.scrollWidth > element.clientWidth })),
      };
    });
    expect(geometry.documentWidth).toBeLessThanOrEqual(width);
    expect(geometry.presets).toHaveLength(5);
    expect(geometry.presets.every((preset: { clipped: boolean }) => !preset.clipped)).toBe(true);
    if (width === 390) {
      expect(geometry.heroHeight).toBeLessThanOrEqual(geometry.heroLimit90svh as number);
      expect(geometry.composeBottom).toBeLessThanOrEqual(844);
      await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/home-first-fold-mobile-390.png'), fullPage: false });
    }
    if (width === 1440) {
      await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/home-first-fold-desktop-1440.png'), fullPage: false });
    }
    measurements.push(geometry);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const brief = page.getByRole('textbox', { name: 'Product description and requirements' });
  await page.getByRole('button', { name: 'playful HR platform', exact: true }).click();
  await expect(brief).toHaveValue(/Warm onboarding journeys/);
  await page.getByRole('button', { name: 'luxury travel marketplace', exact: true }).click();
  await expect(brief).toHaveValue(/private concierge bookings/);
  const interaction = { employeePresetApplied: true, travelPresetApplied: true };
  const evidence = { route: page.url(), responseStatus: response?.status(), security, presetNames, measurements, interaction, consoleErrors, pageErrors, failedRequests, badResponses };
  const output = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v37/home-first-fold-live.json');
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});
