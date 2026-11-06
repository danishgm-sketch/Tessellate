import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = 'quality/evidence/step-45/public-v80-reaudit/manual-copy-suspects';
const resources = ['admin-console-shell','ai-memory-context-panel','ai-prompt-history','ai-suggested-actions','api-capability-section','audit-log','command-centre-shell','cohort-matrix'];
const viewports = [{ name: 'desktop-1440x900', width: 1440, height: 900 }, { name: 'mobile-390x844', width: 390, height: 844 }];
const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir(output, { recursive: true });
try {
  for (const viewport of viewports) {
    for (const slug of resources) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const telemetry = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      const consoleListener = (message) => { if (message.type() === 'error') telemetry.consoleErrors.push(message.text()); if (message.type() === 'warning') telemetry.consoleWarnings.push(message.text()); };
      page.on('console', consoleListener);
      page.on('pageerror', (error) => telemetry.uncaughtExceptions.push(error.message));
      page.on('requestfailed', (request) => telemetry.failedRequests.push(`${request.method()} ${new URL(request.url()).pathname} ${request.failure()?.errorText ?? ''}`));
      page.on('response', (response) => { if (response.status() >= 400) telemetry.httpErrors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
      const url = `${site}/r/${slug}/`;
      let status = null; let navigationError = null; let frameText = ''; let detailText = ''; let buttons = []; let interaction = null; let metrics = null; let axeViolations = []; let axeInstrumentationConsoleErrors = [];
      const stem = `${slug}-${viewport.name}`;
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        status = response?.status() ?? null;
        await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 20000 });
        const preview = page.frameLocator('iframe[title$=" live preview"]').first();
        await preview.locator('.tess-screen').waitFor({ state: 'visible', timeout: 20000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
        axeInstrumentationConsoleErrors = [];
        page.off('console', consoleListener);
        const axeConsoleListener = (message) => { if (message.type() === 'error') axeInstrumentationConsoleErrors.push(message.text()); };
        page.on('console', axeConsoleListener);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
        page.off('console', axeConsoleListener);
        page.on('console', consoleListener);
        axeViolations = axe.violations.map(({ id, impact, help, description, nodes }) => ({ id, impact, help, description, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
        detailText = await page.locator('main').innerText();
        frameText = await preview.locator('body').innerText();
        buttons = await preview.locator('button').evaluateAll((nodes) => nodes.map((node) => ({ text: (node.innerText ?? '').trim(), ariaLabel: node.getAttribute('aria-label'), disabled: node.hasAttribute('disabled'), expanded: node.getAttribute('aria-expanded'), pressed: node.getAttribute('aria-pressed'), title: node.getAttribute('title') })));
        metrics = await page.evaluate(() => ({ viewportWidth: globalThis.document.documentElement.clientWidth, documentWidth: globalThis.document.documentElement.scrollWidth, horizontalOverflow: globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth + 1 }));
        await page.screenshot({ path: path.join(output, `${stem}-detail-before.png`), fullPage: true });
        await preview.locator('.tess-screen').screenshot({ path: path.join(output, `${stem}-preview-before.png`) });
        const actionName = { 'admin-console-shell': 'Invite User', 'ai-memory-context-panel': 'Clear examples', 'ai-prompt-history': 'Replay', 'ai-suggested-actions': 'Export as Vite App' }[slug];
        if (actionName) {
          const action = preview.getByRole('button', { name: actionName, exact: slug !== 'ai-prompt-history' }).first();
          const visible = await action.isVisible().catch(() => false); const before = frameText; let clicked = false;
          const disabled = visible ? await action.isDisabled().catch(() => true) : null;
          if (visible && !disabled) { await action.click().catch(() => undefined); clicked = true; await page.waitForTimeout(250); }
          const after = await preview.locator('body').innerText();
          interaction = { actionName, visible, disabled, clicked, visibleTextChanged: before !== after, beforeText: before, afterText: after };
          await page.screenshot({ path: path.join(output, `${stem}-detail-after.png`), fullPage: true });
          await preview.locator('.tess-screen').screenshot({ path: path.join(output, `${stem}-preview-after.png`) });
        }
      } catch (error) { navigationError = error instanceof Error ? error.message : String(error); }
      results.push({ slug, viewport: viewport.name, url, status, navigationError, detailText, frameText, buttons, interaction, metrics, axeViolations, telemetry, axeInstrumentationConsoleErrors });
      await context.close();
    }
  }
} finally { await browser.close(); }
const report = { capturedAt: new Date().toISOString(), site, siteVersion: 80, resources, viewports: viewports.map((viewport) => viewport.name), results };
await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output, captures: results.length, failed: results.filter((row) => row.status !== 200 || row.navigationError || row.telemetry.consoleErrors.length || row.telemetry.uncaughtExceptions.length || row.telemetry.failedRequests.length || row.telemetry.httpErrors.length).length, interactions: results.filter((row) => row.interaction).length, axeViolations: results.reduce((n, row) => n + row.axeViolations.length, 0) }, null, 2));

