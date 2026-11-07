import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('AI Prompt Composer reports clearly that its preview does not send a provider request', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'Run against the isolated Sites Worker preview.');
  await page.setViewportSize({ width: 390, height: 844 });
  const diagnostics = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[], actionRequests: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) diagnostics.httpErrors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('/resources/ai-prompt-composer/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBe(true);
  const frame = page.frameLocator('iframe[title$=" live preview"]');
  await expect(frame.locator('.tess-screen')).toHaveCount(1);
  const prompt = frame.getByPlaceholder(/Compose task instructions/);
  await prompt.fill('Plan employee onboarding for a 500-person technology company.');
  await page.waitForLoadState('networkidle');
  page.on('request', (request) => diagnostics.actionRequests.push(`${request.method()} ${request.url()}`));

  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06');
  mkdirSync(path.join(evidenceDir, 'before'), { recursive: true });
  mkdirSync(path.join(evidenceDir, 'after'), { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'before/ai-prompt-action-390.png'), animations: 'disabled' });

  await frame.getByRole('button', { name: 'Execute Prompt' }).click();
  await expect(frame.getByRole('status')).toHaveText('Prompt previewed locally; no provider request was sent.');
  expect(diagnostics).toEqual({ consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [], actionRequests: [] });
  await page.screenshot({ path: path.join(evidenceDir, 'after/ai-prompt-action-390.png'), animations: 'disabled' });
  const resultDir = path.join(evidenceDir, 'results');
  mkdirSync(resultDir, { recursive: true });
  writeFileSync(path.join(resultDir, 'ai-prompt-action.json'), JSON.stringify({
    schemaVersion: '1.0.0', route: '/resources/ai-prompt-composer/', viewport: '390x844',
    action: 'Execute Prompt', result: 'Prompt previewed locally; no provider request was sent.',
    providerRequests: 0, diagnostics,
    screenshots: ['audit/evidence/step-06/before/ai-prompt-action-390.png', 'audit/evidence/step-06/after/ai-prompt-action-390.png'],
  }, null, 2));
});
