/* global process, console, document, HTMLButtonElement */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve('node_modules/.pnpm/playwright@1.63.0/node_modules/playwright'));
const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = path.resolve('quality/evidence/step-39/deployed-v30-interactions');
fs.mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const runtime = { console: [], uncaught: [], failed: [], badResponses: [] };
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        runtime.console.push({ type: message.type(), text: message.text().slice(0, 600) });
      }
    });
    page.on('pageerror', (error) => runtime.uncaught.push(String(error).slice(0, 600)));
    page.on('requestfailed', (request) => {
      runtime.failed.push({ url: request.url(), failure: request.failure()?.errorText ?? 'unknown' });
    });
    page.on('response', (response) => {
      if (response.status() >= 400) runtime.badResponses.push({ url: response.url(), status: response.status() });
    });

    const response = await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const experimental = page.getByRole('button', { name: '03 · Experimental' });
    await experimental.waitFor({ state: 'attached', timeout: 15000 });
    const initial = {
      disabled: await experimental.isDisabled(),
      pressed: await experimental.getAttribute('aria-pressed'),
      preparingVisible: await page.getByText('Preparing comparison controls').isVisible().catch(() => false),
    };

    await experimental.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent?.includes('03 · Experimental'));
      return button instanceof HTMLButtonElement && !button.disabled;
    }, { timeout: 15000 });
    await experimental.click();
    const selected = {
      disabled: await experimental.isDisabled(),
      pressed: await experimental.getAttribute('aria-pressed'),
      levelVisible: await page.getByText('Level 03 · Ambition 75–95').isVisible().catch(() => false),
    };
    const screenshot = path.join(outputDirectory, `home-spectrum-v30-${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
    results.push({
      route: '/',
      viewport: `${viewport.width}x${viewport.height}`,
      url: page.url(),
      httpStatus: response?.status() ?? null,
      initial,
      selected,
      runtime,
      screenshot: path.relative(process.cwd(), screenshot),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const reportPath = path.resolve('quality/evidence/step-39/deployed-v30-home-spectrum.json');
fs.writeFileSync(reportPath, `${JSON.stringify({ site: origin, version: 30, results }, null, 2)}\n`);
console.log(JSON.stringify({ reportPath: path.relative(process.cwd(), reportPath), results }, null, 2));
