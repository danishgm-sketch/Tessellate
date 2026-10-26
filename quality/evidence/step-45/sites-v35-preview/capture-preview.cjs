const fs = require('node:fs');
const path = require('node:path');
const playwrightModule = process.env.TESS_PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = require(playwrightModule);

const baseUrl = 'http://127.0.0.1:4337';
const outputDir = __dirname;
const cases = [
  { route: '/', width: 1440, height: 900, screenshot: 'home-1440x900.png' },
  { route: '/compose', width: 1440, height: 900, screenshot: 'compose-1440x900.png' },
  { route: '/', width: 390, height: 844, screenshot: 'home-390x844.png' },
  { route: '/compose', width: 390, height: 844, screenshot: 'compose-390x844.png' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const item of cases) {
      const context = await browser.newContext({ viewport: { width: item.width, height: item.height } });
      const page = await context.newPage();
      const consoleIssues = [];
      const pageErrors = [];
      const failedRequests = [];
      const badResponses = [];
      const requests = [];
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          consoleIssues.push({ type: message.type(), text: message.text() });
        }
      });
      page.on('pageerror', (error) => pageErrors.push(String(error)));
      page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
      page.on('request', (request) => requests.push(request.url()));
      page.on('response', (response) => {
        if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() });
      });

      const response = await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.screenshot({ path: path.join(outputDir, item.screenshot), fullPage: false });
      const pageMetrics = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const hero = h1?.closest('section') ?? h1?.parentElement;
        const presets = [...document.querySelectorAll('button')]
          .map((button) => (button.innerText || '').trim())
          .filter((text) => ['AI research terminal', 'luxury travel marketplace', 'playful HR platform', 'developer observability tool', 'minimalist finance app'].includes(text));
        const bodyText = document.body.innerText;
        return {
          title: document.title,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          heroHeight: hero ? Math.round(hero.getBoundingClientRect().height * 100) / 100 : null,
          presetLabels: presets,
          catalogueReady: bodyText.includes('Catalogue ready'),
        };
      });
      results.push({
        route: item.route,
        viewport: `${item.width}x${item.height}`,
        url: page.url(),
        pageStatus: response?.status() ?? null,
        ...pageMetrics,
        catalogueRequests: requests.filter((url) => new URL(url).pathname === '/data/catalog.json').length,
        requests: requests.length,
        consoleIssues,
        pageErrors,
        failedRequests,
        badResponses,
        screenshot: item.screenshot,
      });
      await context.close();
    }
    fs.writeFileSync(path.join(outputDir, 'preview-audit.json'), JSON.stringify({
      candidate: 'Sites v35 local preview',
      canonicalCheckoutHeadAtCapture: '7041e87641ee115e35c973a15d5d344ee2fb13db',
      siteProjectId: 'appgprj_6acc036de8cc8191a823339566972d85',
      savedVersionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_9ac26fefbc4c8191abcd3b7e4ce4dcc1',
      siteSourceCommit: '23d73d008baf22c82a925770b5e2428abc42c030',
      deploymentStatus: 'saved-not-deployed',
      publicVersion: 30,
      publicUrl: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
      bindings: { d1: false, r2: false },
      archive: { files: 1782, bytes: 55562240, sha256: '2aed63489f5774d31cfb6a347d64be28926b3961dc15175827cf70976b226e9e' },
      baseUrl,
      capturedAt: new Date().toISOString(),
      routes: results,
    }, null, 2) + '\n');
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
