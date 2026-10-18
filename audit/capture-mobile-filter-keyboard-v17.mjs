/* global document */
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const siteUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = 'audit/evidence/catalog-search-v17';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const consoleErrors = [];
const failedRequests = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
try {
  await page.goto(`${siteUrl}/explore`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: 'Close filters' }).waitFor({ state: 'visible' });
  const before = {
    url: page.url(),
    viewport: '390x844',
    drawerVisibleBeforeEscape: await page.getByRole('button', { name: 'Close filters' }).isVisible(),
    dialogSemantics: await page.getByRole('dialog').count(),
    focusedControl: await page.evaluate(() => ({ tag: document.activeElement?.tagName, ariaLabel: document.activeElement?.getAttribute('aria-label'), text: document.activeElement?.textContent?.trim() })),
  };
  await page.screenshot({ path: `${outputDirectory}/mobile-filter-drawer-before-escape-390x844.png` });
  await page.keyboard.press('Escape');
  before.drawerVisibleAfterEscape = await page.getByRole('button', { name: 'Close filters' }).isVisible();
  before.focusAfterEscape = await page.evaluate(() => ({ tag: document.activeElement?.tagName, ariaLabel: document.activeElement?.getAttribute('aria-label'), text: document.activeElement?.textContent?.trim() }));
  before.consoleErrors = consoleErrors;
  before.failedRequests = failedRequests;
  await writeFile(`${outputDirectory}/mobile-filter-keyboard-before.json`, `${JSON.stringify(before, null, 2)}\n`);
} finally { await browser.close(); }
