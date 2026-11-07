import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
test('inspect deployed dialog resource frame', async ({ page }, info) => {
  const diagnostics = { console: [] as string[], errors: [] as string[], failed: [] as string[] };
  page.on('console', (m) => {
    if (m.type() === 'error') diagnostics.console.push(m.text());
  });
  page.on('pageerror', (e) => diagnostics.errors.push(e.message));
  page.on('requestfailed', (r) => diagnostics.failed.push(r.url() + ' ' + r.failure()?.errorText));
  const response = await page.goto('/resources/dialog/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const iframe = page.locator('iframe[title$=" live preview"]');
  const infoPage = {
    status: response?.status(),
    title: await page.title(),
    url: page.url(),
    iframeCount: await iframe.count(),
    iframeVisible: await iframe.isVisible().catch(() => false),
    iframeSrc: await iframe.getAttribute('src'),
    bodyText: (await page.locator('body').innerText()).slice(0, 1000),
    frameUrls: page.frames().map((f) => f.url()),
    diagnostics,
  };
  let frameInfo = {};
  try {
    const frame = iframe.contentFrame();
    frameInfo = await frame.evaluate(() => ({
      url: location.href,
      ready: document.readyState,
      body: document.body.innerText.slice(0, 1500),
      htmlClass: document.documentElement.className,
      nodeIds: Array.from(document.querySelectorAll('[data-node-id]')).map((e) => ({
        id: e.getAttribute('data-node-id'),
        visible: !!e.getBoundingClientRect().width,
        txt: (e as HTMLElement).innerText.slice(0, 200),
      })),
      screens: Array.from(document.querySelectorAll('.tess-screen')).map((e) => ({
        visible: !!e.getBoundingClientRect().width,
        rect: (() => {
          const r = e.getBoundingClientRect();
          return { w: r.width, h: r.height };
        })(),
        text: (e as HTMLElement).innerText.slice(0, 600),
      })),
    }));
  } catch (e) {
    frameInfo = { error: String(e) };
  }
  const out = path.resolve(
    process.cwd(),
    'audit/evidence/v25/dialog-preview-inspect',
    info.project.name
  );
  await mkdir(out, { recursive: true });
  const screenshot = path.join(out, 'dialog-resource-1440.png');
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  await writeFile(
    path.join(out, 'report.json'),
    JSON.stringify({ viewport: page.viewportSize(), infoPage, frameInfo, screenshot }, null, 2) +
      '\n'
  );
  console.log(JSON.stringify({ infoPage, frameInfo, screenshot }));
});
