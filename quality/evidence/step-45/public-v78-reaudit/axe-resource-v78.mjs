import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('quality/evidence/step-45/public-v78-reaudit/axe-resource-results.json');
const screenshots = path.resolve('quality/evidence/step-45/public-v78-reaudit/axe');
const resources = ['button', 'ai-empty-state'];
const require = createRequire(import.meta.url);
const axePackageRequire = createRequire(require.resolve('@axe-core/playwright'));
const axeSource = await readFile(axePackageRequire.resolve('axe-core/axe.min.js'), 'utf8');
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function monitor(page) {
  const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push({ method: request.method(), url: new URL(request.url()).pathname, error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ status: response.status(), url: new URL(response.url()).pathname });
  });
  return runtime;
}

async function scanAxe(page) {
  // Axe injects inline CSS that the preview's restrictive CSP blocks. Capture
  // app telemetry before instrumentation, then keep the two results separate.
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.removeAllListeners('requestfailed');
  page.removeAllListeners('response');
  const result = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  return result.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }));
}

async function scanFrameAxe(frame) {
  // Keep the frame sandbox and CSP intact. Serve axe from a same-origin test
  // route within the frame's existing /_astro/ script allowlist.
  await frame.evaluate(() => new Promise((resolve, reject) => {
    const script = globalThis.document.createElement('script');
    script.src = '/_astro/axe-audit.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Axe failed to load inside the isolated preview frame'));
    globalThis.document.head.append(script);
  }));
  const result = await frame.evaluate(async (tags) => {
    const axe = globalThis.window.axe;
    const scan = await axe.run(globalThis.document, { runOnly: { type: 'tag', values: tags } });
    return scan.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
  }, axeTags);
  return result;
}

const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir(screenshots, { recursive: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    for (const slug of resources) {
      const detail = await context.newPage();
      const detailRuntime = monitor(detail);
      await detail.route('**/_astro/axe-audit.min.js', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: axeSource })
      );
      const detailUrl = `${origin}/r/${slug}/`;
      const detailResponse = await detail.goto(detailUrl, { waitUntil: 'networkidle' });
      await detail.locator('main h1').first().waitFor({ state: 'visible' });
      const preview = detail.frameLocator('iframe[title$=" live preview"]').first();
      await preview.locator('.tess-screen').waitFor({ state: 'visible', timeout: 15000 });
      const previewFrame = detail.frames().find((frame) => frame.url().includes('/preview-content/'));
      if (!previewFrame) throw new Error(`Isolated preview frame was not attached for ${slug} at ${viewport.name}`);
      const frameUrl = await detail.locator('iframe[title$=" live preview"]').first().getAttribute('src');
      const detailScreenshot = path.join(screenshots, `${slug}-${viewport.name}-detail.png`);
      const frameScreenshot = path.join(screenshots, `${slug}-${viewport.name}-preview.png`);
      await detail.screenshot({ path: detailScreenshot, fullPage: true });
      await preview.locator('.tess-screen').screenshot({ path: frameScreenshot });
      const detailLayout = await detail.evaluate(() => ({
        viewportWidth: globalThis.document.documentElement.clientWidth,
        documentWidth: globalThis.document.documentElement.scrollWidth,
        horizontalOverflow: globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth + 1,
      }));
      const detailRuntimeBeforeAxe = structuredClone(detailRuntime);
      const detailAxe = await scanAxe(detail);
      const frameLayout = await previewFrame.evaluate(() => ({
        viewportWidth: globalThis.document.documentElement.clientWidth,
        documentWidth: globalThis.document.documentElement.scrollWidth,
        horizontalOverflow: globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth + 1,
      }));
      const frameAxe = await scanFrameAxe(previewFrame);
      results.push({
        slug,
        viewport: viewport.name,
        surface: 'resource-detail-shell',
        url: detailUrl,
        status: detailResponse?.status() ?? null,
        layout: detailLayout,
        runtime: detailRuntimeBeforeAxe,
        axeViolations: detailAxe,
        screenshot: path.relative(process.cwd(), detailScreenshot).replaceAll('\\', '/'),
      });

      if (!frameUrl) throw new Error(`Missing isolated preview URL for ${slug} at ${viewport.name}`);
      const absoluteFrameUrl = new URL(frameUrl, origin).toString();
      results.push({
        slug,
        viewport: viewport.name,
        surface: 'isolated-preview-content',
        url: absoluteFrameUrl,
        status: detailResponse?.status() === 200 ? 200 : detailResponse?.status() ?? null,
        layout: frameLayout,
        runtime: detailRuntimeBeforeAxe,
        axeViolations: frameAxe,
        screenshot: path.relative(process.cwd(), frameScreenshot).replaceAll('\\', '/'),
      });
      await detail.close();
      console.log(`${viewport.name} ${slug}: detail ${detailAxe.length} axe; isolated preview ${frameAxe.length} axe`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const summary = {
  capturedAt: new Date().toISOString(),
  publicSite: origin,
  siteVersion: 78,
  siteVersionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_67206589708c81919ade92023cb90608',
  deploymentId: 'appgdep_6aed6cf7cc288191a4ba98ee07ef81fc',
  canonicalSourceCommit: '3e889d0ca68345c5ccf5ef767c3c05ebc07716ca',
  siteSourceCommit: 'e6387f7ff8e1080a5a4c191cf00faef813719a3d',
  standard: 'WCAG 2.2 A/AA axe-core tags',
  note: 'App console/network telemetry is captured before Axe instrumentation. Axe-generated CSP messages are not counted as application errors.',
  resources,
  viewports: viewports.map(({ name }) => name),
  results,
};
await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  output: path.relative(process.cwd(), output).replaceAll('\\', '/'),
  scans: results.length,
  failedRoutes: results.filter((result) => result.status !== 200).length,
  runtimeFailures: results.filter((result) => Object.values(result.runtime).some((items) => items.length)).length,
  axeViolations: results.reduce((sum, result) => sum + result.axeViolations.length, 0),
}));
