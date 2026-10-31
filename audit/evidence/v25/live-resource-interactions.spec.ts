import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Runtime = { consoleErrors: string[]; warnings: string[]; pageErrors: string[]; failedRequests: string[]; httpErrors: string[] };
function observe(page: Page): Runtime {
  const value: Runtime = { consoleErrors: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') value.consoleErrors.push(message.text()); if (message.type() === 'warning') value.warnings.push(message.text()); });
  page.on('pageerror', (error) => value.pageErrors.push(error.message));
  page.on('requestfailed', (request) => value.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', (response) => { if (response.status() >= 400) value.httpErrors.push(`${response.status()} ${response.url()}`); });
  return value;
}
const actions = [
  { slug: 'marketing-nav-cta', label: 'Start Free', expected: 'Start action previewed.' },
  { slug: 'pricing-three-tier', label: 'Get Started', expected: 'Free Core plan selected.' },
  { slug: 'empty-workspace', label: 'Create New Project', expected: 'Project creation previewed.' },
  { slug: 'magnetic-button', label: 'Explore Interface System', expected: 'Example action activated.' },
  { slug: 'error-state', label: 'Retry Operation', expected: 'Retry action previewed.' },
];
test('legacy resource detail actions produce truthful visible feedback on the published Site', async ({ page }, testInfo) => {
  const runtime = observe(page);
  const outputDir = path.resolve(process.cwd(), 'audit/evidence/v25/resource-actions', testInfo.project.name);
  await mkdir(outputDir, { recursive: true });
  const evidence: Array<Record<string, unknown>> = [];
  for (const item of actions) {
    const route = `/resources/${item.slug}/`;
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: /.+/ })).toBeVisible();
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15000 });
    const button = preview.getByRole('button').filter({ hasText: item.label }).first();
    await expect(button).toBeVisible();
    await page.screenshot({ path: path.join(outputDir, `${item.slug}-before.png`), fullPage: true, animations: 'disabled' });
    await button.click();
    await expect(preview.getByRole('status')).toHaveText(item.expected);
    await page.screenshot({ path: path.join(outputDir, `${item.slug}-after.png`), fullPage: true, animations: 'disabled' });
    evidence.push({ route, viewport: page.viewportSize(), status: response?.status(), action: item.label, visibleResult: item.expected });
  }
  expect(runtime).toEqual({ consoleErrors: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [] });
  await writeFile(path.join(outputDir, 'runtime.json'), `${JSON.stringify({ site: page.url().split('/').slice(0,3).join('/'), capturedAt: new Date().toISOString(), results: evidence, runtime }, null, 2)}\n`);
});

test('AI Prompt Composer action is explicitly local and sends no provider request', async ({ page }) => {
  const runtime = observe(page);
  const route = '/resources/ai-prompt-composer/';
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const frame = page.frameLocator('iframe[title$=" live preview"]');
  const prompt = frame.getByPlaceholder(/Compose task instructions/);
  await prompt.fill('Plan employee onboarding for a 500-person technology company.');
  await expect(prompt).toHaveValue('Plan employee onboarding for a 500-person technology company.');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));
  await frame.getByRole('button', { name: 'Execute Prompt' }).click();
  await expect(frame.getByRole('status')).toHaveText('Prompt previewed locally; no provider request was sent.');
  expect(requests).toEqual([]);
  expect(runtime).toEqual({ consoleErrors: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [] });
});

test('AI Prompt Hero resource detail keeps its title and preview layout intact', async ({ page }, testInfo) => {
  const runtime = observe(page);
  const response = await page.goto('/resources/ai-prompt-hero/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'AI Prompt Hero' })).toBeVisible();
  expect(await page.title()).toContain('AI Prompt Hero');
  const preview = page.locator('iframe[title="AI Prompt Hero live preview"]');
  await expect(preview).toBeVisible();
  await expect(preview.contentFrame().locator('.tess-screen')).toBeVisible({ timeout: 15000 });
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  const previewWidth = await preview.evaluate((element) => element.getBoundingClientRect().width);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(previewWidth).toBeGreaterThan(300);
  const outputDir = path.resolve(process.cwd(), 'audit/evidence/v25/resource-details', testInfo.project.name);
  await mkdir(outputDir, { recursive: true });
  const screenshot = path.join(outputDir, 'ai-prompt-hero.png');
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  expect(runtime).toEqual({ consoleErrors: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [] });
  await writeFile(path.join(outputDir, 'ai-prompt-hero.json'), `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), status: response?.status(), title: await page.title(), h1: await page.getByRole('heading', { level: 1 }).innerText(), previewWidth, layout, runtime, screenshot }, null, 2)}\n`);
});
