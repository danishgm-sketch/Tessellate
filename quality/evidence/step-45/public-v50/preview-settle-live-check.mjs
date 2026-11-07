import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('quality/evidence/step-45/public-v50/flagship/settled-previews');
const viewportWidth = Number(process.argv[2] ?? 1440);
const viewportName = viewportWidth <= 430 ? `mobile-${viewportWidth}` : `desktop-${viewportWidth}`;
const viewportHeight = viewportWidth <= 430 ? 844 : 900;
const exactBrief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight }, reducedMotion: 'reduce' });
const consoleErrors = [];
const uncaughtExceptions = [];
const failedRequests = [];
const badResponses = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
page.on('response', (response) => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }); });

try {
  await fs.mkdir(output, { recursive: true });
  const response = await page.goto(`${baseURL}/compose`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('catalog-status').getByText(/Catalogue ready/i).waitFor();
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await page.getByText('Inferred Product Architecture', { exact: true }).waitFor();

  const previews = [];
  for (const id of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${id}`);
    const locator = page.getByTestId(`direction-preview-${id}`);
    const cardText = await card.innerText();
    await locator.waitFor({ state: 'visible' });
    const startedAt = Date.now();
    const initialText = await locator.innerText();
    const initialScreenshot = path.join(output, `direction-${id}-initial-${viewportName}.png`);
    await locator.screenshot({ path: initialScreenshot, animations: 'disabled' });
    let text = '';
    let settled = false;
    while (Date.now() - startedAt < 30_000) {
      text = await locator.innerText();
      if (!/\bLoading\b/i.test(text)) { settled = true; break; }
      await page.waitForTimeout(500);
    }
    const screenshot = path.join(output, `direction-${id}-${viewportName}.png`);
    await locator.screenshot({ path: screenshot, animations: 'disabled' });
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const directionDetails = await dialog.innerText();
    const detailScreenshot = path.join(output, `direction-${id}-dna-${viewportName}.png`);
    await dialog.screenshot({ path: detailScreenshot, animations: 'disabled' });
    const dialogBox = await dialog.boundingBox();
    if (dialogBox) {
      await page.mouse.move(dialogBox.x + dialogBox.width / 2, dialogBox.y + dialogBox.height / 2);
      await page.mouse.wheel(0, 1600);
      await page.waitForTimeout(250);
    }
    const scrolledDirectionDetails = await dialog.innerText();
    const scrolledDetailScreenshot = path.join(output, `direction-${id}-dna-bottom-${viewportName}.png`);
    await dialog.screenshot({ path: scrolledDetailScreenshot, animations: 'disabled' });
    await dialog.getByText('Design DNA and resource references', { exact: true }).click();
    await page.waitForTimeout(200);
    const expandedDirectionDetails = await dialog.innerText();
    const expandedDetailScreenshot = path.join(output, `direction-${id}-dna-expanded-${viewportName}.png`);
    await dialog.screenshot({ path: expandedDetailScreenshot, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    previews.push({
      direction: id,
      cardText,
      initialText,
      initialLoadingText: (initialText.match(/Loading[^\n]*/g) ?? []),
      directionDetails,
      scrolledDirectionDetails,
      expandedDirectionDetails,
      settled,
      settleMs: settled ? Date.now() - startedAt : null,
      visibleText: text,
      loadingText: (text.match(/Loading[^\n]*/g) ?? []),
      screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
      initialScreenshot: path.relative(process.cwd(), initialScreenshot).replaceAll('\\', '/'),
      detailScreenshot: path.relative(process.cwd(), detailScreenshot).replaceAll('\\', '/'),
      scrolledDetailScreenshot: path.relative(process.cwd(), scrolledDetailScreenshot).replaceAll('\\', '/'),
      expandedDetailScreenshot: path.relative(process.cwd(), expandedDetailScreenshot).replaceAll('\\', '/'),
    });
  }

  const report = {
    capturedAt: new Date().toISOString(),
    url: page.url(),
    viewport: `${viewportWidth}x${viewportHeight}`,
    httpStatus: response?.status() ?? null,
    previews,
    consoleErrors,
    uncaughtExceptions,
    failedRequests,
    badResponses,
  };
  await fs.writeFile(path.join(output, `report-${viewportName}.json`), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    httpStatus: report.httpStatus,
    directions: previews.map(({ direction, settled, settleMs, loadingText, screenshot }) => ({ direction, settled, settleMs, loadingText, screenshot })),
    consoleErrors: consoleErrors.length,
    uncaughtExceptions: uncaughtExceptions.length,
    failedRequests: failedRequests.length,
    badResponses: badResponses.length,
  }, null, 2));
} finally {
  await browser.close();
}
