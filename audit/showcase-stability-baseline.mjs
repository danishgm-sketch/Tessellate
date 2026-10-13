/* global process, document */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = 'audit/evidence/deployed-version-5/showcase-stability';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const entry = { url: `${base}/showcase/showcase-playful-hr/`, viewport: [], exceptions: [], console: [], network: [] };
page.on('pageerror', error => entry.exceptions.push(error.message));
page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) entry.console.push({ level: message.type(), text: message.text() });
});
page.on('requestfailed', request => entry.network.push({ url: request.url(), failure: request.failure()?.errorText }));
try {
  for (const width of [1440, 390]) {
    const height = width === 390 ? 844 : 900;
    await page.setViewportSize({ width, height });
    const response = await page.goto(entry.url);
    await page.waitForLoadState('networkidle');
    const screenshot = `${output}/showcase-playful-hr-${width}.png`;
    await page.screenshot({ path: screenshot });
    entry.viewport.push({ width, height, httpStatus: response.status(), title: await page.title(), screenshot, text: await page.locator('body').innerText() });
  }
} finally {
  await writeFile(`${output}/result.json`, JSON.stringify(entry, null, 2));
  await browser.close();
}
