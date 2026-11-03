/* global window, document, Element, performance, getComputedStyle, innerWidth, innerHeight, matchMedia, process */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const brief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
const directory = path.dirname(fileURLToPath(import.meta.url));
const runtime = {
  consoleErrors: [],
  consoleWarnings: [],
  uncaughtExceptions: [],
  failedRequests: [],
  httpErrors: [],
};

await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__auditMotionEvents = [];
    for (const eventName of ['transitionrun', 'transitionstart', 'animationstart']) {
      window.addEventListener(eventName, (event) => {
        if (!(event.target instanceof Element) || !event.target.closest('.tess-screen')) return;
        window.__auditMotionEvents.push({
          type: eventName,
          property: 'propertyName' in event ? event.propertyName : null,
          target: event.target.getAttribute('data-semantic-role') ?? event.target.className,
          at: Math.round(performance.now()),
        });
      }, true);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto(`${site}/compose`, { waitUntil: 'domcontentloaded' });
  const catalogueStatus = page.getByTestId('catalog-status');
  await catalogueStatus.waitFor({ state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="catalog-status"]')?.textContent?.includes('Catalogue ready'),
    undefined,
    { timeout: 90000 }
  );
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();

  const directionC = page.getByTestId('direction-card-03');
  await directionC.waitFor({ state: 'visible', timeout: 120000 });
  await page.getByTestId('direction-preview-03').waitFor({ state: 'visible' });
  const unresolvedResources = await directionC.locator('[data-testid="missing-resource-recovery"]').count();
  const unresolvedRoles = await directionC.locator('[data-testid="unresolved-required-role-diagnostic"]').count();
  const selectedProjectId = await directionC.getAttribute('data-project-id');
  if (!selectedProjectId) throw new Error('Direction C did not expose its project identity.');

  await directionC.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(new RegExp(`/workbench\\?project=${selectedProjectId}$`), { timeout: 60000 });
  await page.getByTestId('workbench-shell').waitFor({ state: 'visible', timeout: 60000 });
  await page.getByTestId('top-toolbar').waitFor({ state: 'visible' });
  await page.locator('.tess-screen [data-node-id]').first().waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForTimeout(10000);

  const desktopMotion = await page.locator('.tess-screen [data-node-id]').evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      return {
        role: node.getAttribute('data-semantic-role'),
        transitionProperty: style.transitionProperty,
        transitionDuration: style.transitionDuration,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
      };
    })
  );
  await page.screenshot({ path: path.join(directory, 'workbench-desktop-1440x900.png'), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId('mobile-workbench').waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(3000);
  const mobileLayout = await page.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    visibleLoadingStates: [...document.querySelectorAll('body *')]
      .filter((element) => element.children.length === 0 && /Loading .* when this section is in view/i.test(element.textContent ?? ''))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent?.trim(),
          inViewport: rect.bottom > 0 && rect.top < innerHeight,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
  }));
  runtime.reducedMotionEvents = await page.evaluate(() => window.__auditMotionEvents ?? []);
  await page.screenshot({ path: path.join(directory, 'workbench-mobile-390x844.png'), fullPage: false });

  const result = {
    deployment: 'v74',
    sourceCommit: '75276e8078e908b8258fa3d2cba629d71b85cd60',
    route: page.url(),
    selectedProjectId,
    exactBrief: brief,
    catalogueReady: true,
    directionCount: 3,
    directionC: { unresolvedResources, unresolvedRoles },
    reducedMotion: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    desktop: { viewport: { width: 1440, height: 900 }, renderedNodeCount: desktopMotion.length, renderedMotion: desktopMotion },
    mobile: mobileLayout,
    visibleLoadingStates: await page.evaluate(() => [...document.querySelectorAll('body *')]
      .filter((element) => element.children.length === 0 && /Loading .* when this section is in view/i.test(element.textContent ?? ''))
      .map((element) => element.textContent?.trim())),
    reducedMotionEvents: runtime.reducedMotionEvents,
    runtime,
    screenshots: ['workbench-desktop-1440x900.png', 'workbench-mobile-390x844.png'],
  };
  await writeFile(path.join(directory, 'workbench-reduced-motion-live.json'), `${JSON.stringify(result, null, 2)}\n`);

  const invalidMotion = desktopMotion.filter(
    (node) => node.transitionProperty !== 'none' || node.animationName !== 'none'
  );
  if (!result.reducedMotion) throw new Error('Reduced-motion preference was not active.');
  if (desktopMotion.length === 0) throw new Error('Workbench rendered no screen nodes.');
  if (invalidMotion.length) throw new Error(`Reduced-motion styles remain on ${invalidMotion.length} screen nodes.`);
  if (runtime.reducedMotionEvents.length) throw new Error(`Reduced-motion triggered ${runtime.reducedMotionEvents.length} project transition or animation events.`);
  if (unresolvedResources || unresolvedRoles) throw new Error('Direction C contains unresolved resources or roles.');
  if (mobileLayout.documentWidth > mobileLayout.viewportWidth) throw new Error('Workbench overflows the 390px viewport.');
  if (runtime.consoleErrors.length || runtime.uncaughtExceptions.length || runtime.httpErrors.length) {
    throw new Error('The deployed browser run produced console, exception, or HTTP errors.');
  }
  process.stdout.write(`${JSON.stringify({ ...result, runtime: { ...runtime, failedRequestCount: runtime.failedRequests.length } })}\n`);
  await context.close();
} finally {
  await browser.close();
}
