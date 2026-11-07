/* global document */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setTimeout as delay } from 'node:timers/promises';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const evidenceDir = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28/high-findings');
const results = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const badResponses = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false },
    { name: 'mobile-390x844', width: 390, height: 844, isMobile: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(`${viewport.name}: ${message.text()}`);
    });
    page.on('pageerror', error => pageErrors.push(`${viewport.name}: ${error.message}`));
    page.on('requestfailed', request => failedRequests.push({ viewport: viewport.name, url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', response => {
      if (response.status() >= 400) badResponses.push({ viewport: viewport.name, url: response.url(), status: response.status() });
    });
    await page.route('**/data/catalog.json', async route => {
      await delay(6000);
      await route.continue();
    });
    const response = await page.goto(`${site}/explore`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (response?.status() !== 200) throw new Error(`${viewport.name}: /explore returned ${response?.status()}`);
    const loadingStatus = page.getByRole('status', { name: 'Loading catalogue resources' });
    await loadingStatus.waitFor({ state: 'visible', timeout: 20000 });
    const semantics = await page.evaluate(() => {
      const status = document.querySelector('[role="status"][aria-label="Loading catalogue resources"]');
      return {
        statusRole: status?.getAttribute('role') ?? null,
        statusLabel: status?.getAttribute('aria-label') ?? null,
        busy: status?.getAttribute('aria-busy') ?? null,
        skeletonVisible: Boolean(document.querySelector('[data-testid="catalogue-skeleton"]') || document.querySelector('[role="status"][aria-label="Loading catalogue resources"]')),
      };
    });
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    await page.screenshot({ path: path.join(evidenceDir, `aud-281-explore-loading-${viewport.name}.png`), fullPage: false });
    await page.getByText(/Showing \d+ of 324 resources/).waitFor({ timeout: 30000 });
    results.push({
      viewport: `${viewport.width}x${viewport.height}`,
      route: `${site}/explore`,
      httpStatus: response.status(),
      loadingState: semantics,
      axeViolationCount: axe.violations.length,
      axeViolations: axe.violations.map(violation => ({ id: violation.id, impact: violation.impact, description: violation.description })),
      catalogueLoaded: true,
      screenshot: `quality/evidence/step-45/public-v51-recheck-2026-10-28/high-findings/aud-281-explore-loading-${viewport.name}.png`,
    });
    await context.close();
  }

  const report = {
    siteVersion: 51,
    sourceCommit: 'e70450cba88cf09d2f68ee126e31a51474c54de2',
    siteSourceCommit: 'e19db8af22097eb6d20a9fb2555157234ea1831d',
    technique: 'Public Site browser route with /data/catalog.json delayed for six seconds to inspect the actual visible loading skeleton.',
    results,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
  };
  await fs.writeFile(path.join(evidenceDir, 'aud-281-public-runtime.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (results.some(result => result.axeViolationCount > 0)) throw new Error('Axe found one or more violations in the deployed loading state');
  if (results.some(result => result.loadingState.statusRole !== 'status' || result.loadingState.statusLabel !== 'Loading catalogue resources')) throw new Error('Deployed loading state did not expose a labelled status role');
  if (consoleErrors.length || pageErrors.length || failedRequests.length || badResponses.length) throw new Error('Browser errors or failed requests detected');
  globalThis.console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
