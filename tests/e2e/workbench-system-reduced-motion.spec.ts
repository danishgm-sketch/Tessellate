import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('Workbench screen resources do not animate when the operating system requests reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/workbench#screen-marketing-home');
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.locator('.tess-screen [data-node-id]').first()).toBeVisible();

  const renderedMotion = await page.locator('.tess-screen [data-node-id]').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return {
      role: element.getAttribute('data-semantic-role'),
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      animationName: style.animationName,
      animationDuration: style.animationDuration,
    };
  }));
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    reducedMotion: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    renderedNodes: renderedMotion.length,
    renderedMotion,
    consoleErrors,
    failedRequests,
    httpErrors,
  };
  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-48/system-reduced-motion');
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}.png`), fullPage: false });
  await testInfo.attach(`system-reduced-motion-${testInfo.project.name}.json`, {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(evidence.reducedMotion).toBe(true);
  expect(evidence.renderedNodes).toBeGreaterThan(0);
  expect(renderedMotion.filter((node) => node.transitionProperty !== 'none'), 'all project screen nodes should have transitions disabled for reduced motion').toEqual([]);
  expect(renderedMotion.filter((node) => node.animationName !== 'none'), 'project screen nodes should not animate for reduced motion').toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
