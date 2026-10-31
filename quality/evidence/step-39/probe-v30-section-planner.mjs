/* global process, console, navigator */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve('node_modules/.pnpm/playwright@1.63.0/node_modules/playwright'));
const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const evidenceDirectory = path.resolve('quality/evidence/step-39/deployed-v30-interactions');
fs.mkdirSync(evidenceDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const runtime = { console: [], uncaught: [], failed: [], badResponses: [] };
page.on('console', message => { if (['error', 'warning'].includes(message.type())) runtime.console.push({ type: message.type(), text: message.text().slice(0, 500) }); });
page.on('pageerror', error => runtime.uncaught.push(String(error)));
page.on('requestfailed', request => runtime.failed.push({ url: request.url(), error: request.failure()?.errorText }));
page.on('response', response => { if (response.status() >= 400) runtime.badResponses.push({ url: response.url(), status: response.status() }); });

try {
  const response = await page.goto(`${site}/tools/section-planner`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);
  const archetypes = [
    'B2B SaaS Conversion Landing',
    'Developer Documentation Hub',
    'Fintech Analytics Cockpit',
    'Luxury Editorial Sanctuary',
    'Operational Triage & Admin Tool',
  ];
  const samples = [];
  for (const name of archetypes) {
    const button = page.getByRole('button', { name, exact: true });
    await button.click();
    const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    samples.push({
      name,
      selected: await button.getAttribute('aria-pressed'),
      text: text.slice(0, 1200),
      unsubstantiatedClaims: text.match(/SOC 2|ISO 27001|99\.9|verified benchmark|measured latency|connected booking/gi) ?? [],
    });
  }

  const moveButtons = await page.locator('button[aria-label^="Move "]').evaluateAll(buttons =>
    buttons.map(button => ({ label: button.getAttribute('aria-label'), disabled: button.disabled })),
  );
  const orderBefore = await page.locator('button[aria-label$=" up"]').evaluateAll(buttons =>
    buttons.map(button => button.getAttribute('aria-label')?.replace(/^Move | up$/g, '') ?? ''),
  );
  const move = moveButtons.find(button => !button.disabled && button.label?.endsWith(' down'));
  if (!move?.label) throw new Error('No enabled section reorder action was found.');
  await page.getByRole('button', { name: move.label, exact: true }).click();
  const orderAfter = await page.locator('button[aria-label$=" up"]').evaluateAll(buttons =>
    buttons.map(button => button.getAttribute('aria-label')?.replace(/^Move | up$/g, '') ?? ''),
  );
  await page.getByRole('button', { name: 'Copy Section Graph JSON', exact: true }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  let graph;
  try { graph = JSON.parse(clipboard); } catch (error) { throw new Error(`Copied output was not JSON: ${String(error)}`); }
  const status = await page.getByRole('status').allInnerTexts();
  const screenshot = path.join(evidenceDirectory, 'section-planner-live-390x844.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  const result = {
    generatedAt: new Date().toISOString(),
    site,
    version: 30,
    route: '/tools/section-planner',
    viewport: '390x844',
    httpStatus: response?.status() ?? null,
    samples,
    moveButtons,
    movedSection: move.label,
    orderBefore,
    orderAfter,
    orderChanged: orderBefore.join('|') !== orderAfter.join('|'),
    clipboardJsonValid: typeof graph === 'object' && graph !== null,
    clipboardBytes: clipboard.length,
    clipboardGraph: graph,
    status,
    runtime,
    screenshot: path.relative(process.cwd(), screenshot),
  };
  fs.writeFileSync(path.resolve('quality/evidence/step-39/deployed-v30-section-planner.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ httpStatus: result.httpStatus, archetypes: samples.map(({name,selected,unsubstantiatedClaims})=>({name,selected,unsubstantiatedClaims})), moveButtons, movedSection: move.label, orderBefore, orderAfter, orderChanged: result.orderChanged, clipboardJsonValid: result.clipboardJsonValid, consoleErrors: runtime.console.length, uncaught: runtime.uncaught.length, failed: runtime.failed.length, badResponses: runtime.badResponses.length, screenshot: result.screenshot }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
