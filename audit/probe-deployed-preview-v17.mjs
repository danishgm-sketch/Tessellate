/* global location, document */
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleEvents = [];
const failedRequests = [];
const responses = [];
page.on('console', (message) => consoleEvents.push({ type: message.type(), text: message.text(), location: message.location() }));
page.on('requestfailed', (request) => failedRequests.push({
  url: request.url(),
  error: request.failure()?.errorText ?? null,
  resourceType: request.resourceType(),
  frameUrl: request.frame()?.url() ?? null,
}));
page.on('response', (response) => responses.push({ url: response.url(), status: response.status(), resourceType: response.request().resourceType() }));
try {
  await page.goto(`${baseUrl}/explore`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(6000);
  const axe = await new AxeBuilder({ page }).analyze();
  const headings = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll((elements) => elements.map((element) => ({ tag: element.tagName, text: element.textContent?.trim() })));
  const frames = [];
  for (const frame of page.frames()) {
    const summary = await frame.evaluate(() => ({
      url: location.href,
      title: document.title,
      body: document.body?.innerText?.slice(0, 500) ?? '',
      links: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href),
      scripts: [...document.querySelectorAll('script[src]')].map((script) => script.src),
    })).catch((error) => ({ url: frame.url(), error: String(error) }));
    frames.push(summary);
  }
  await page.screenshot({ path: 'audit/evidence/catalog-search-v17/explore-settled-1440x900.png' });
  const exploreDiagnostics = { consoleEvents: [...consoleEvents], failedRequests: [...failedRequests] };
  consoleEvents.length = 0;
  failedRequests.length = 0;
  responses.length = 0;
  const resourceResponse = await page.goto(`${baseUrl}/r/ai-agent-activity-feed/`, { waitUntil: 'domcontentloaded' });
  const resourceFrame = page.frameLocator('iframe[title="AI Agent Activity Feed live preview"]');
  await resourceFrame.getByRole('heading', { name: 'Agent Swarm Activity', level: 4 }).waitFor({ timeout: 10000 });
  const resourceAxe = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
  const resourceEvidence = {
    url: page.url(),
    viewport: '1440x900',
    httpStatus: resourceResponse?.status() ?? null,
    heading: await resourceFrame.locator('h4').first().innerText(),
    headingTag: await resourceFrame.locator('h4').first().evaluate((element) => element.tagName),
    axeViolations: resourceAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map((node) => node.target) })),
    consoleEvents,
    failedRequests,
    httpErrors: responses.filter((response) => response.status >= 400),
    screenshot: 'audit/evidence/catalog-search-v17/ai-agent-heading-before-1440x900.png',
  };
  await page.screenshot({ path: resourceEvidence.screenshot });
  await writeFile('audit/evidence/catalog-search-v17/ai-agent-heading-before.json', `${JSON.stringify(resourceEvidence, null, 2)}\n`);
  await writeFile('audit/evidence/catalog-search-v17/preview-diagnostics.json', `${JSON.stringify({
    url: page.url(), viewport: '1440x900', consoleEvents, failedRequests, responses, frames, headings,
    axeViolations: axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
    exploreDiagnostics,
  }, null, 2)}\n`);
} finally { await browser.close(); }
