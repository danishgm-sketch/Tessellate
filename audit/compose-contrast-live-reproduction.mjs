/* global process, console, getComputedStyle */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-6';
const directory = `audit/evidence/${phase}/compose-contrast`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const evidence = { url: `${base}/compose/`, viewport: '1440x900', exceptions: [], console: [], network: [], intentionalCatalogueAbort: null, scans: [] };
page.on('pageerror', (error) => evidence.exceptions.push(error.message));
page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) evidence.console.push({ level: message.type(), text: message.text() }); });
page.on('requestfailed', (request) => {
  const failure = { url: request.url(), reason: request.failure()?.errorText };
  if (request.url().endsWith('/data/catalog.json')) evidence.intentionalCatalogueAbort = failure;
  else evidence.network.push(failure);
});
async function scan(name, target) {
  await target.scrollIntoViewIfNeeded();
  const axe = (await new AxeBuilder({ page }).options({ preload: false }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
  const screenshot = `${directory}/${name}-1440.png`;
  await page.screenshot({ path: screenshot });
  evidence.scans.push({ name, screenshot, axe });
}
async function getVisibleContrastRatio() {
  return page.getByTestId('compose-submit-btn').evaluate((element) => {
    const channels = (value) => {
      const match = value.match(/[0-9.]+/g)?.map(Number);
      if (!match || match.length < 3) throw new Error(`Cannot parse computed color: ${value}`);
      return [match[0], match[1], match[2], match[3] ?? 1];
    };
    const style = getComputedStyle(element);
    let parent = element.parentElement;
    let backdrop = [255, 255, 255, 1];
    while (parent) {
      const candidate = channels(getComputedStyle(parent).backgroundColor);
      if (candidate[3] > 0) { backdrop = candidate; break; }
      parent = parent.parentElement;
    }
    const opacity = Number(style.opacity);
    const blend = (foreground, background, alpha) => [0, 1, 2].map((index) => Math.round(foreground[index] * alpha + background[index] * (1 - alpha)));
    const luminance = (color) => {
      const linear = color.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const values = [luminance(blend(channels(style.color), backdrop, opacity)), luminance(blend(channels(style.backgroundColor), backdrop, opacity))].sort((a, b) => b - a);
    return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2));
  });
}
try {
  await page.route('**/data/catalog.json', (route) => route.abort());
  const response = await page.goto(evidence.url);
  evidence.httpStatus = response?.status();
  await page.getByTestId('catalog-status').getByText('Catalogue unavailable').waitFor();
  const submit = page.getByTestId('compose-submit-btn');
  evidence.submitDisabled = await submit.isDisabled();
  evidence.submitStyle = await submit.evaluate((element) => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor, opacity: getComputedStyle(element).opacity }));
  evidence.submitContrastRatio = await getVisibleContrastRatio();
  evidence.footerStyle = await page.locator('footer').last().evaluate((element) => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
  await scan('disabled-submit', submit);
  await scan('muted-ink-footer', page.locator('footer').last());
  await writeFile(`${directory}/result.json`, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ status: evidence.httpStatus, submitDisabled: evidence.submitDisabled, submitStyle: evidence.submitStyle, submitContrastRatio: evidence.submitContrastRatio, footerStyle: evidence.footerStyle, scans: evidence.scans.map(({ name, axe }) => ({ name, axe: axe.map((violation) => ({ id: violation.id, impact: violation.impact })) })), exceptions: evidence.exceptions.length, unexpectedNetwork: evidence.network.length }));
  if (process.env.AUDIT_EXPECT_CLEAN === '1') {
    assert(evidence.submitContrastRatio >= 4.5, 'Compose disabled button contrast ratio must be at least 4.5:1');
    assert(evidence.scans.every((scan) => scan.axe.length === 0), 'Visible route must have no Axe violations');
  }
} finally { await browser.close(); }
