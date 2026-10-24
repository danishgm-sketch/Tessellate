import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

test('unknown resource preview reports a visible error instead of substituting the Button preview', async ({ page }) => {
  const uncaught: string[] = [];
  const consoleErrors: string[] = [];
  const failedNetwork: string[] = [];

  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('requestfailed', (request) => failedNetwork.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failedNetwork.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    const previewMessages: Array<{ type?: string; resourceId?: string; error?: string }> = [];
    Object.defineProperty(window, '__previewMessages', { value: previewMessages });
    window.addEventListener('message', (event) => {
      if (event.source === window && event.data?.type?.startsWith('TESSELLATE_PREVIEW_')) {
        previewMessages.push(event.data);
      }
    });
  });

  await page.goto('/?resource=__missing-resource-for-renderer-audit__');
  await expect(page.getByRole('alert')).toContainText('not available');
  await expect(page.getByRole('button')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    return (window as Window & { __previewMessages?: Array<{ type?: string; error?: string }> }).__previewMessages
      ?.some((message) => message.type === 'TESSELLATE_PREVIEW_ERROR' && message.error?.includes('__missing-resource-for-renderer-audit__')) ?? false;
  })).toBe(true);
  const messageTypes = await page.evaluate(() => {
    return (window as Window & { __previewMessages?: Array<{ type?: string }> }).__previewMessages
      ?.map((message) => message.type) ?? [];
  });
  expect(messageTypes).not.toContain('TESSELLATE_PREVIEW_READY');

  const afterPath = path.resolve(process.cwd(), 'audit/evidence/step-07/after/unknown-resource-error-state.png');
  mkdirSync(path.dirname(afterPath), { recursive: true });
  await page.screenshot({ path: afterPath, fullPage: true });
  expect(uncaught).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedNetwork).toEqual([]);
});
