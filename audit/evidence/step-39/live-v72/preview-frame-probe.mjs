import { chromium } from '@playwright/test';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const output = [];
for (const slug of ['ai-chat-panel', 'pricing-three-tier', 'dashboard-kpi-grid']) {
  const response = await page.goto(`${site}/r/${slug}/`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15000 });
  const frames = await Promise.all(page.frames().slice(1).map(async (frame) => {
    try {
      return await frame.evaluate(() => ({
        url: location.href,
        title: document.title,
        bodyText: (document.body?.innerText ?? '').slice(0, 5000),
        bodyChildren: document.body?.children.length ?? 0,
        readyState: document.readyState,
      }));
    } catch (error) {
      return { url: frame.url(), inaccessible: String(error) };
    }
  }));
  output.push({ slug, status: response?.status() ?? null, frameCount: frames.length, frames });
}
await browser.close();
console.log(JSON.stringify(output, null, 2));
/* global console, document, location */

