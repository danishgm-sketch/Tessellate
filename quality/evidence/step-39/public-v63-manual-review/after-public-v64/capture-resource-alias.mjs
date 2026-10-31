import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = path.dirname(fileURLToPath(import.meta.url));
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const observations = [];

try {
  for (const viewport of [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    const exceptions = [];
    const failedRequests = [];
    const httpErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => exceptions.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    page.on('response', (response) => {
      if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
    });

    const url = `${baseUrl}/resources/ai-empty-state/`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    const tablist = page.getByRole('tablist', { name: 'Resource information' });
    const tabs = page.getByRole('tab');
    await tablist.waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const tabList = document.querySelector('[role="tablist"][aria-label="Resource information"]');
      const island = tabList?.closest('astro-island');
      return Boolean(island && !island.hasAttribute('ssr'));
    });
    const intent = page.getByRole('tab', { name: 'Intent' });
    const code = page.getByRole('tab', { name: 'Code' });
    await intent.focus();
    await page.keyboard.press('ArrowRight');
    await code.waitFor({ state: 'visible' });
    const selected = await code.getAttribute('aria-selected');
    const panelId = await page.getByRole('tabpanel').getAttribute('aria-labelledby');
    const screenshot = `resource-alias-${viewport.name}.png`;
    await page.screenshot({ path: path.join(outputDirectory, screenshot), fullPage: true });

    observations.push({
      route: url,
      viewport: `${viewport.width}x${viewport.height}`,
      status: response?.status() ?? null,
      tablistRole: await tablist.getAttribute('role'),
      tabCount: await tabs.count(),
      keyboardSelection: selected,
      panelLabelledBy: panelId,
      screenshot,
      consoleErrors,
      consoleWarnings,
      exceptions,
      failedRequests,
      httpErrors,
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  capturedAt: new Date().toISOString(),
  siteVersion: 64,
  canonicalSourceCommit: '248a2a09c84a0734998850f8f3b85a14ddf3b78c',
  siteSourceCommit: '8aca504b5d4231509bfd4d90d13aec949e979f58',
  deployment: 'appgdep_6ae650c685a48191b78c4d41686f5cf7',
  observations,
};
await writeFile(path.join(outputDirectory, 'resource-alias-runtime.json'), `${JSON.stringify(report, null, 2)}\n`);
if (observations.some((item) => item.status !== 200 || item.tablistRole !== 'tablist' || item.tabCount !== 8 || item.keyboardSelection !== 'true' || item.horizontalOverflow || item.consoleErrors.length || item.consoleWarnings.length || item.exceptions.length || item.failedRequests.length || item.httpErrors.length)) {
  process.exitCode = 1;
}
