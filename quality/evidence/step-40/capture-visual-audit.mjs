import { chromium } from '@playwright/test';
import { log } from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const baseUrl = process.env.TESS_VISUAL_BASE_URL ?? 'http://127.0.0.1:4323';
const outputDirectory = process.env.TESS_VISUAL_OUTPUT ?? 'quality/evidence/step-40/before';
fs.mkdirSync(outputDirectory, { recursive: true });

const routes = [
  ['home', '/'],
  ['explore', '/explore'],
  ['components', '/components'],
  ['sections', '/sections'],
  ['blocks', '/blocks'],
  ['pages', '/pages'],
  ['effects', '/effects'],
  ['motion', '/motion'],
  ['backgrounds', '/backgrounds'],
  ['ai', '/ai'],
  ['data', '/data'],
  ['compose', '/compose'],
  ['workbench', '/workbench'],
  ['blueprints', '/blueprints'],
  ['blueprint-b2b-saas', '/blueprints/b2b-saas'],
  ['collections', '/collections'],
  ['creators', '/creators'],
  ['showcase-gallery', '/showcase'],
  ['showcase-playful-hr', '/showcase/showcase-playful-hr'],
  ['trends', '/trends'],
  ['tools', '/tools'],
  ['tool-accessibility', '/tools/accessibility'],
  ['agents', '/agents'],
  ['docs', '/docs'],
  ['docs-manifest', '/docs/manifest'],
  ['docs-product-spec', '/docs/product-spec'],
  ['resource-activity-feed', '/r/activity-feed'],
  ['sponsor', '/sponsor'],
  ['about', '/about'],
  ['license', '/license'],
  ['privacy', '/privacy'],
  ['terms', '/terms'],
  ['resource-testimonial-grid', '/r/testimonial-grid'],
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const evidence = [];

for (const viewport of viewports) {
  for (const [name, route] of routes) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    const pageErrors = [];
    const requestFailures = [];
    const httpErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
      else if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      requestFailures.push({ url: request.url(), failure: request.failure()?.errorText });
    });
    page.on('response', (response) => {
      if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
    });

    const started = Date.now();
    let status = null;
    let navigationError = null;
    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
      status = response?.status() ?? null;
      await page.evaluate(() => globalThis.document.fonts.ready);
      await page.waitForTimeout(1_200);
    } catch (error) {
      navigationError = String(error);
    }

    const visual = await page.evaluate(() => ({
      title: globalThis.document.title,
      h1: globalThis.document.querySelector('h1')?.innerText?.trim() ?? null,
      bodyTextLength: globalThis.document.body.innerText.length,
      scrollWidth: globalThis.document.documentElement.scrollWidth,
      clientWidth: globalThis.document.documentElement.clientWidth,
      horizontalOverflow: globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth,
      viewport: `${globalThis.innerWidth}x${globalThis.innerHeight}`,
    })).catch(() => null);
    const stem = `${name}-${viewport.name}`;
    const screenshotViewport = path.join(outputDirectory, `${stem}-viewport.png`);
    const screenshotFull = path.join(outputDirectory, `${stem}-full.png`);
    await page.screenshot({ path: screenshotViewport, fullPage: false, animations: 'disabled' }).catch(() => {});
    await page.screenshot({ path: screenshotFull, fullPage: true, animations: 'disabled' }).catch(() => {});

    evidence.push({
      id: `VIS40-${String(evidence.length + 1).padStart(3, '0')}`,
      url: route,
      viewport: viewport.name,
      requestedViewport: `${viewport.width}x${viewport.height}`,
      status,
      elapsedMs: Date.now() - started,
      navigationError,
      visual,
      consoleErrors,
      consoleWarnings,
      pageErrors,
      requestFailures,
      httpErrors,
      screenshotViewport: screenshotViewport.replaceAll('\\', '/'),
      screenshotFull: screenshotFull.replaceAll('\\', '/'),
    });
    await context.close();
  }
}

await browser.close();
fs.writeFileSync(
  path.join(outputDirectory, 'visual-audit.json'),
  JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl, runtime: 'built Sites Worker', routes: evidence }, null, 2),
);
log(JSON.stringify(evidence.map((route) => ({
  id: route.id,
  url: route.url,
  viewport: route.viewport,
  status: route.status,
  elapsedMs: route.elapsedMs,
  title: route.visual?.title,
  h1: route.visual?.h1,
  overflow: route.visual?.horizontalOverflow,
  consoleErrors: route.consoleErrors.length,
  consoleWarnings: route.consoleWarnings.length,
  pageErrors: route.pageErrors.length,
  failedRequests: route.requestFailures.length,
  httpErrors: route.httpErrors,
})), null, 2));
