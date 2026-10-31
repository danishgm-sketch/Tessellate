/* global window, document, performance, Element, innerWidth, innerHeight */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const out = path.resolve('quality/evidence/step-39/public-v50-copy/mobile-filter-reproduction');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const runs = [];
try {
  for (let index = 0; index < 6; index += 1) {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const runtime = { consoleErrors: [], pageErrors: [], failedRequests: [] };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) =>
      runtime.failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? null,
      })
    );
    await page.addInitScript(() => {
      window.__tessellateReadinessEvents = [];
      document.addEventListener(
        'astro:hydrate',
        (event) => {
          const target = event.target;
          window.__tessellateReadinessEvents.push({
            type: 'astro:hydrate',
            component: target?.getAttribute?.('component-export') ?? null,
            at: performance.now(),
          });
        },
        true
      );
      document.addEventListener(
        'click',
        (event) => {
          const target = event.target instanceof Element ? event.target.closest('button') : null;
          if (target?.textContent?.trim().toLowerCase() === 'data')
            window.__tessellateReadinessEvents.push({
              type: 'data-click',
              trusted: event.isTrusted,
              at: performance.now(),
            });
        },
        true
      );
    });
    const response = await page.goto(`${origin}/`, { waitUntil: 'load' });
    const sectionTitle = page.getByRole('heading', { name: 'Open resources. Clear sample data.' });
    await sectionTitle.scrollIntoViewIfNeeded();
    const dataButton = page.getByRole('button', { name: 'data', exact: true });
    await dataButton.waitFor({ state: 'visible' });
    const island = page.locator('astro-island[component-export="CatalogueMosaic"]');
    const before = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(
        (item) => item.textContent?.trim().toLowerCase() === 'data'
      );
      const root = button?.closest('astro-island');
      return {
        viewport: { width: innerWidth, height: innerHeight },
        readyState: document.readyState,
        ssrAttribute: root?.hasAttribute('ssr') ?? null,
        pressed: button?.getAttribute('aria-pressed'),
        disabled: button?.disabled,
        events: window.__tessellateReadinessEvents,
      };
    });
    await page.screenshot({
      path: path.join(out, `run-${index + 1}-before.jpg`),
      quality: 80,
      fullPage: false,
    });
    const clickedAt = Date.now();
    await dataButton.click();
    await page.waitForTimeout(1200);
    const afterFirst = await dataButton.getAttribute('aria-pressed');
    const afterFirstState = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(
        (item) => item.textContent?.trim().toLowerCase() === 'data'
      );
      const root = button?.closest('astro-island');
      return {
        ssrAttribute: root?.hasAttribute('ssr') ?? null,
        pressed: button?.getAttribute('aria-pressed'),
        disabled: button?.disabled,
        events: window.__tessellateReadinessEvents,
      };
    });
    let recoveryClick = null;
    if (afterFirst !== 'true') {
      await island.evaluate((element) =>
        element.addEventListener(
          'astro:hydrate',
          () =>
            window.__tessellateReadinessEvents.push({
              type: 'late-hydration',
              at: performance.now(),
            }),
          { once: true }
        )
      );
      await page.waitForTimeout(2000);
      await dataButton.click();
      await page.waitForTimeout(200);
      recoveryClick = await dataButton.getAttribute('aria-pressed');
    }
    const final = await page.evaluate(() => ({
      pressed: [...document.querySelectorAll('button')]
        .find((item) => item.textContent?.trim().toLowerCase() === 'data')
        ?.getAttribute('aria-pressed'),
      cards: [...document.querySelectorAll('[data-testid="home-resource-card"] h3')].map(
        (element) => element.textContent?.trim()
      ),
      events: window.__tessellateReadinessEvents,
    }));
    const screenshot = path.join(out, `run-${index + 1}-after.jpg`);
    await page.screenshot({ path: screenshot, quality: 80, fullPage: false });
    runs.push({
      run: index + 1,
      status: response?.status() ?? null,
      url: page.url(),
      viewport: page.viewportSize(),
      before,
      afterFirst,
      afterFirstState,
      recoveryClick,
      final,
      elapsedToClickMs: Date.now() - clickedAt,
      runtime,
      screenshotBefore: path.join(out, `run-${index + 1}-before.jpg`),
      screenshotAfter: screenshot,
    });
    await context.close();
  }
} finally {
  await browser.close();
}
const report = {
  capturedAt: new Date().toISOString(),
  sourceVersion: 50,
  origin,
  issue:
    'Homepage resource category control may accept a tap before the CatalogueMosaic island hydrates.',
  runs,
  failedFirstAttempts: runs.filter((run) => run.afterFirst !== 'true').length,
};
await writeFile(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      output: path.join(out, 'report.json'),
      failedFirstAttempts: report.failedFirstAttempts,
      runs: runs.map(({ run, status, before, afterFirst, recoveryClick, final, runtime }) => ({
        run,
        status,
        viewport: before.viewport,
        ssr: before.ssrAttribute,
        disabled: before.disabled,
        afterFirst,
        recoveryClick,
        finalPressed: final.pressed,
        cards: final.cards,
        pageErrors: runtime.pageErrors,
      })),
    },
    null,
    2
  )
);
