import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

test('MCP setup guide is truthful, keyboard reachable, and usable on desktop and mobile', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));

  const response = await page.goto('/docs/mcp/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Model Context Protocol (MCP)', level: 1 })).toBeVisible();
  await expect(page.getByText('The MCP server is a private workspace package, not an npm download.')).toBeVisible();
  await expect(page.getByText(/this public Site does not host an MCP process/i)).toBeVisible();

  const config = page.locator('main pre');
  const parsedConfig = JSON.parse((await config.innerText()).trim()) as {
    mcpServers: { tessellate: { command: string; args: string[] } };
  };
  expect(parsedConfig.mcpServers.tessellate.command).toBe('pnpm');
  expect(parsedConfig.mcpServers.tessellate.args).toEqual([
    '--dir',
    'C:\\path\\to\\Tessellate',
    'exec',
    'tsx',
    'packages/mcp/src/index.ts',
  ]);
  await expect(page.getByText(/npx @tessellate\/mcp/)).toHaveCount(0);

  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);

  const evidenceDir = path.resolve('quality/evidence/step-27/after');
  await mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, `mcp-docs-${testInfo.project.name}.png`), fullPage: true });

  await config.focus();
  await expect(config).toBeFocused();

  const axe = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
