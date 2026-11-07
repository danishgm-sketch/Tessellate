import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const warnings = [];
const errors = [];
const uncaughtExceptions = [];
const failedRequests = [];
const httpErrors = [];
const routes = [];
page.on('console', (message) => {
  if (message.type() === 'warning') warnings.push({ text: message.text(), location: message.location() });
  if (message.type() === 'error') errors.push({ text: message.text(), location: message.location() });
});
page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
page.on('requestfailed', (request) => failedRequests.push({ method: request.method(), url: new URL(request.url()).pathname, error: request.failure()?.errorText ?? null }));
page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: new URL(response.url()).pathname }); });
const slugs = ['ai-multi-agent-board','ai-plan-review','marquee-typography','sticky-scroll-story','number-count-up','version-history','data-hero','analytics-shell','data-terminal-header','connection-lost-state','feature-with-live-demo','kiosk-display-shell','interactive-globe'];
try {
  for (const slug of slugs) {
    if (slug === 'interactive-globe') await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto(`https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/r/${slug}/`, { waitUntil: 'networkidle' });
    const preview = page.frameLocator('iframe[title$=" live preview"]').first();
    await preview.locator('.tess-screen').waitFor({ state: 'visible', timeout: 15000 });
    routes.push({ slug, status: response?.status() ?? null, url: page.url() });
  }
  const report = {
    capturedAt: new Date().toISOString(),
    siteVersion: 78,
    viewport: '390x844',
    routes,
    warnings,
    errors,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  await writeFile('quality/evidence/step-45/public-v78-reaudit/console-warning-recheck.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
