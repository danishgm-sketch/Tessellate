import { test, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

async function downloadManifest(page: import('@playwright/test').Page) {
  await page.getByTestId('export-button').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPromise;
  const filePath = await download.path();
  if (!filePath) throw new Error('Manifest download did not produce a file.');
  return JSON.parse(await readFile(filePath, 'utf8')) as {
    designDNA: Record<string, number | string>;
  };
}

test('Design DNA sliders update semantic output and preserve the mapped values', async ({ page, isMobile }) => {
  test.skip(isMobile, 'This evidence journey captures both viewports from one desktop Workbench session.');

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/design-dna');
  await mkdir(evidenceDir, { recursive: true });
  const consoleMessages: Array<{ type: string; text: string }> = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const badResponses: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/workbench');
  await expect(page.getByTestId('workbench-canvas')).toBeVisible();
  const screen = page.locator('[data-screen-id]').first();
  await expect(screen).toBeVisible();

  const deselect = page.getByRole('button', { name: 'Deselect Node' });
  if (await deselect.isVisible()) await deselect.click();
  await page.getByRole('button', { name: 'Intent', exact: true }).click();

  const beforeStyle = (await screen.getAttribute('style')) ?? '';
  await page.screenshot({ path: path.join(evidenceDir, 'before-1440x900.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenceDir, 'before-390x844.png'), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  const ambition = page.getByRole('slider', { name: 'Visual Ambition' });
  await ambition.focus();
  await page.keyboard.press('End');
  await expect(ambition).toHaveValue('100');

  const structuralCreativity = page.getByRole('slider', { name: 'Structural Creativity' });
  await structuralCreativity.focus();
  await page.keyboard.press('End');
  await expect(structuralCreativity).toHaveValue('100');

  const afterStyle = (await screen.getAttribute('style')) ?? '';
  expect(afterStyle).not.toBe(beforeStyle);
  expect(afterStyle).toContain('--tess-heading-letter-spacing:');

  await page.screenshot({ path: path.join(evidenceDir, 'after-1440x900.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenceDir, 'after-390x844.png'), fullPage: true });

  const manifest = await downloadManifest(page);
  expect(manifest.designDNA.visualAmbition).toBe(100);
  expect(manifest.designDNA.typographicExpression).toBe(94);
  expect(manifest.designDNA.motion).toBe(95);
  expect(manifest.designDNA.structuralCreativity).toBe(100);
  expect(manifest.designDNA.asymmetry).toBe(90);

  expect(pageErrors).toEqual([]);
  expect(consoleMessages.filter((message) => message.type === 'error')).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
  await writeFile(
    path.join(evidenceDir, 'runtime.json'),
    JSON.stringify(
      {
        route: new URL(page.url()).pathname,
        viewports: ['1440x900', '390x844'],
        console: consoleMessages,
        uncaught: pageErrors,
        failedRequests,
        badResponses,
        exportedDesignDNA: manifest.designDNA,
        screenshots: [
          'before-1440x900.png',
          'after-1440x900.png',
          'before-390x844.png',
          'after-390x844.png',
        ],
      },
      null,
      2
    ),
    'utf8'
  );
});
