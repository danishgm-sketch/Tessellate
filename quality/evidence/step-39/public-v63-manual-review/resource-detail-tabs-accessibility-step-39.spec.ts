import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

test('resource detail information tabs expose selected state and keyboard navigation', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ url: string; status: number }> = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  const response = await page.goto('/r/ai-empty-state/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'AI Empty State', level: 1 })).toBeVisible();
  const preview = page.frameLocator('iframe[title="AI Empty State live preview"]');
  await expect(
    preview.getByRole('heading', { name: 'How can Tessellate assist your build?' })
  ).toBeVisible();

  const tablist = page.getByRole('tablist', { name: 'Resource information' });
  await expect(tablist).toBeVisible();
  await page.waitForFunction(() => {
    const tabList = document.querySelector('[role="tablist"][aria-label="Resource information"]');
    const island = tabList?.closest('astro-island');
    return Boolean(island && !island.hasAttribute('ssr'));
  });
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(8);
  const intent = page.getByRole('tab', { name: 'Intent' });
  const code = page.getByRole('tab', { name: 'Code' });
  await expect(intent).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('First-run prompt layout');
  const evidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v63-manual-review/after-local'
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const viewportName = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  await page.screenshot({ path: path.join(evidenceDirectory, `resource-tabs-${viewportName}.png`) });

  await intent.focus();
  await page.keyboard.press('ArrowRight');
  await expect(code).toBeFocused();
  await expect(code).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('AIEmptyState');

  await page.keyboard.press('End');
  const versions = page.getByRole('tab', { name: 'Versions' });
  await expect(versions).toBeFocused();
  await expect(versions).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(intent).toBeFocused();
  await expect(intent).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowLeft');
  await expect(versions).toBeFocused();
  await expect(versions).toHaveAttribute('aria-selected', 'true');

  const aliasResponse = await page.goto('/resources/ai-empty-state/');
  expect(aliasResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'AI Empty State', level: 1 })).toBeVisible();
  const aliasTablist = page.getByRole('tablist', { name: 'Resource information' });
  await expect(aliasTablist).toBeVisible();
  await page.waitForFunction(() => {
    const tabList = document.querySelector('[role="tablist"][aria-label="Resource information"]');
    const island = tabList?.closest('astro-island');
    return Boolean(island && !island.hasAttribute('ssr'));
  });
  const aliasIntent = page.getByRole('tab', { name: 'Intent' });
  const aliasCode = page.getByRole('tab', { name: 'Code' });
  await expect(aliasIntent).toHaveAttribute('aria-selected', 'true');
  await aliasIntent.focus();
  await page.keyboard.press('ArrowRight');
  await expect(aliasCode).toBeFocused();
  await expect(aliasCode).toHaveAttribute('aria-selected', 'true');

  expect(consoleErrors).toEqual([]);
  expect(consoleWarnings).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
});
