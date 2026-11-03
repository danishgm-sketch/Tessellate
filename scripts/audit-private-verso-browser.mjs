/* global URL, fetch, window, document */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectionPath = process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION;
const siteOrigin = process.env.TESSELLATE_SITE_ORIGIN ?? 'http://127.0.0.1:4321';
const previewOrigin = process.env.TESSELLATE_PRIVATE_PREVIEW_ORIGIN ?? 'http://127.0.0.1:5173';
const outputIndex = process.argv.indexOf('--output');
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const limitIndex = process.argv.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : Infinity;

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

if (!projectionPath || !path.isAbsolute(projectionPath)) {
  throw new Error('Set TESSELLATE_PRIVATE_VERSO_PROJECTION to the absolute path of the private projection JSON.');
}
if (!outputPath || !path.isAbsolute(outputPath)) {
  throw new Error('Pass --output with an absolute path outside the Tessellate repository.');
}

const resolvedOutput = path.resolve(outputPath);
if (isWithin(repoRoot, resolvedOutput)) {
  throw new Error('Private runtime evidence and screenshots must be stored outside the Tessellate repository.');
}

const projection = JSON.parse(fs.readFileSync(projectionPath, 'utf8'));
if (projection.license !== 'UNLICENSED' || !Array.isArray(projection.records)) {
  throw new Error('The audit only accepts the explicit UNLICENSED local projection.');
}
if (!(limit > 0)) throw new Error('--limit must be a positive integer when supplied.');
const recordsToAudit = projection.records.slice(0, Number.isFinite(limit) ? Math.floor(limit) : undefined);

const catalogResponse = await fetch(new URL('/data/catalog.json', siteOrigin));
if (!catalogResponse.ok) throw new Error(`Site catalogue request failed with HTTP ${catalogResponse.status}.`);
const catalog = await catalogResponse.json();
if (!Array.isArray(catalog.resources) || catalog.count !== catalog.resources.length) {
  throw new Error('Site catalogue count does not match its resource records.');
}
const privateResources = catalog.resources.filter((resource) => resource.slug.startsWith('verso-'));
if (privateResources.length !== projection.records.length) {
  throw new Error(`Site overlay has ${privateResources.length} private records; projection contains ${projection.records.length}.`);
}
const catalogueSlugs = catalog.resources.map((resource) => resource.slug);
if (new Set(catalogueSlugs).size !== catalogueSlugs.length) throw new Error('Site catalogue contains duplicate resource slugs.');
const projectedSlugs = new Set(projection.records.map((record) => record.manifest.slug));
if (privateResources.some((resource) => !projectedSlugs.has(resource.slug))) {
  throw new Error('Site overlay contains a private resource outside the validated projection.');
}

const outputDirectory = path.dirname(resolvedOutput);
fs.mkdirSync(outputDirectory, { recursive: true });
const result = {
  generatedAt: new Date().toISOString(),
  scope: 'local private preview only; no source or screenshot is stored in this repository',
  siteOrigin,
  previewOrigin,
  projectionRecordCount: projection.records.length,
  auditedRecordCount: recordsToAudit.length,
  siteCatalogueRecordCount: catalog.count,
  privateCatalogueRecordCount: privateResources.length,
  catalogueUniqueSlugCount: new Set(catalogueSlugs).size,
  sourceOriginIsolation: null,
  representativeDetail: null,
  renderSummary: null,
  renderedResources: [],
  renderFailures: [],
  axe: null,
};

const representativeSource = projection.records[0].source.path;
const sourcePath = path.resolve(projection.sourceRoot, representativeSource).replace(/\\/g, '/');
const sourcePathUrl = `/@fs/${encodeURI(sourcePath)}`;
const [mainOriginSourceResponse, previewOriginSourceResponse] = await Promise.all([
  fetch(new URL(sourcePathUrl, siteOrigin)),
  fetch(new URL(sourcePathUrl, previewOrigin)),
]);
result.sourceOriginIsolation = {
  mainOriginStatus: mainOriginSourceResponse.status,
  mainOriginContentType: mainOriginSourceResponse.headers.get('content-type'),
  previewOriginStatus: previewOriginSourceResponse.status,
  previewOriginContentType: previewOriginSourceResponse.headers.get('content-type'),
  mainOriginServesJavascript: /(?:java|ecma)script/i.test(mainOriginSourceResponse.headers.get('content-type') ?? ''),
  previewOriginServesJavascript: /(?:java|ecma)script/i.test(previewOriginSourceResponse.headers.get('content-type') ?? ''),
  passed: !/(?:java|ecma)script/i.test(mainOriginSourceResponse.headers.get('content-type') ?? '') && /(?:java|ecma)script/i.test(previewOriginSourceResponse.headers.get('content-type') ?? ''),
};
await mainOriginSourceResponse.body?.cancel();
await previewOriginSourceResponse.body?.cancel();

function writeProgress() {
  const temporaryPath = `${resolvedOutput}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, resolvedOutput);
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const detailPage = await context.newPage();
  const detailTelemetry = { console: [], pageErrors: [], failedRequests: [], badResponses: [] };
  detailPage.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      detailTelemetry.console.push({ type: message.type(), text: message.text() });
    }
  });
  detailPage.on('pageerror', (error) => detailTelemetry.pageErrors.push(error.message));
  detailPage.on('requestfailed', (request) => detailTelemetry.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
  detailPage.on('response', (response) => {
    if (response.status() >= 400) detailTelemetry.badResponses.push({ url: response.url(), status: response.status() });
  });

  const representative = projection.records.find((record) => record.manifest.slug === 'verso-depth-aperture') ?? projection.records[0];
  const detailUrl = new URL(`/r/${encodeURIComponent(representative.manifest.slug)}`, siteOrigin);
  detailUrl.searchParams.set('private-audit', '1');
  const detailResponse = await detailPage.goto(detailUrl.href, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const previewFrame = detailPage.frameLocator('iframe');
  await previewFrame.locator('h1.sr-only').waitFor({ state: 'attached', timeout: 45000 });
  const detailHeading = await detailPage.getByRole('heading', { level: 1 }).first().textContent();
  const frameTitle = await detailPage.locator('iframe').getAttribute('title');
  const frameSandbox = await detailPage.locator('iframe').getAttribute('sandbox');
  const desktopLayout = await detailPage.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }));

  const screenshotStem = path.basename(resolvedOutput, path.extname(resolvedOutput));
  const desktopScreenshot = path.join(outputDirectory, `${screenshotStem}-detail-desktop.png`);
  await detailPage.screenshot({ path: desktopScreenshot, fullPage: true });
  const axeResults = await new AxeBuilder({ page: detailPage }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();

  await detailPage.setViewportSize({ width: 390, height: 844 });
  await detailPage.waitForTimeout(150);
  const mobileLayout = await detailPage.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  const mobileScreenshot = path.join(outputDirectory, `${screenshotStem}-detail-mobile.png`);
  await detailPage.screenshot({ path: mobileScreenshot, fullPage: true });

  result.representativeDetail = {
    slug: representative.manifest.slug,
    status: detailResponse?.status() ?? null,
    heading: detailHeading?.trim() ?? null,
    frameTitle,
    frameSandbox,
    desktopLayout,
    mobileLayout,
    screenshots: [desktopScreenshot, mobileScreenshot],
    console: detailTelemetry.console,
    pageErrors: detailTelemetry.pageErrors,
    failedRequests: detailTelemetry.failedRequests,
    badResponses: detailTelemetry.badResponses,
  };
  result.axe = {
    violations: axeResults.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.length })),
    incomplete: axeResults.incomplete.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
  };
  writeProgress();

  const renderPage = await context.newPage();
  renderPage.setDefaultNavigationTimeout(45000);
  let activeSlug = '';
  let activeEvidence = null;
  renderPage.on('console', (message) => {
    if (!activeEvidence || (message.type() !== 'error' && message.type() !== 'warning')) return;
    activeEvidence.console.push({ type: message.type(), text: message.text() });
  });
  renderPage.on('pageerror', (error) => {
    if (activeEvidence) activeEvidence.pageErrors.push(error.message);
  });
  renderPage.on('requestfailed', (request) => {
    if (activeEvidence) activeEvidence.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' });
  });
  renderPage.on('response', (response) => {
    if (activeEvidence && response.status() >= 400) activeEvidence.badResponses.push({ url: response.url(), status: response.status() });
  });

  const startedAt = Date.now();
  for (let index = 0; index < recordsToAudit.length; index += 1) {
    const record = recordsToAudit[index];
    activeSlug = record.manifest.slug;
    const evidence = { slug: activeSlug, status: null, ready: false, renderedName: null, console: [], pageErrors: [], failedRequests: [], badResponses: [] };
    activeEvidence = evidence;
    result.renderedResources.push(evidence);
    const resourceUrl = new URL('/', previewOrigin);
    resourceUrl.searchParams.set('resource', activeSlug);
    resourceUrl.searchParams.set('audit', `${index + 1}`);

    try {
      const response = await renderPage.goto(resourceUrl.href, { waitUntil: 'domcontentloaded', timeout: 45000 });
      evidence.status = response?.status() ?? null;
      if (!response?.ok()) throw new Error(`Preview shell returned HTTP ${evidence.status}.`);
      await renderPage.waitForFunction(() => document.querySelector('h1.sr-only') || [...document.querySelectorAll('[role="alert"]')].some((node) => node.textContent?.trim().startsWith('Preview failed:')), null, { timeout: 20000 });
      const state = await renderPage.evaluate(() => ({
        name: document.querySelector('h1.sr-only')?.textContent?.trim() ?? null,
        error: [...document.querySelectorAll('[role="alert"]')].map((node) => node.textContent?.trim() ?? '').find((text) => text.startsWith('Preview failed:')) ?? null,
      }));
      if (state.error) throw new Error(state.error);
      evidence.ready = state.name === `${record.manifest.name} preview`;
      evidence.renderedName = state.name;
      if (!evidence.ready) throw new Error(`Expected '${record.manifest.name} preview'; received '${state.name ?? 'no rendered heading'}'.`);
    } catch (error) {
      evidence.error = error instanceof Error ? error.message : String(error);
      result.renderFailures.push(evidence);
      if (result.renderFailures.length <= 5) {
        evidence.screenshot = path.join(outputDirectory, `${screenshotStem}-failure-${index + 1}.png`);
        await renderPage.screenshot({ path: evidence.screenshot, fullPage: true }).catch(() => undefined);
      }
    }

    if (evidence.console.some((message) => message.type === 'error') || evidence.pageErrors.length || evidence.failedRequests.length || evidence.badResponses.length) {
      if (!evidence.error) evidence.error = 'Runtime or network telemetry recorded an error/warning for this resource.';
      if (!result.renderFailures.includes(evidence)) result.renderFailures.push(evidence);
    }
    if ((index + 1) % 25 === 0 || index + 1 === projection.records.length) {
      result.renderSummary = {
        checked: index + 1,
        total: recordsToAudit.length,
        passed: index + 1 - result.renderFailures.length,
        failed: result.renderFailures.length,
        warnings: result.renderedResources.reduce((sum, item) => sum + item.console.filter((message) => message.type === 'warning').length, 0),
        elapsedMs: Date.now() - startedAt,
      };
      writeProgress();
      process.stdout.write(`${result.renderSummary.checked}/${result.renderSummary.total} checked; ${result.renderSummary.failed} failures\n`);
    }
  }

  result.renderSummary = {
    checked: recordsToAudit.length,
    total: recordsToAudit.length,
    passed: recordsToAudit.length - result.renderFailures.length,
    failed: result.renderFailures.length,
    warnings: result.renderedResources.reduce((sum, item) => sum + item.console.filter((message) => message.type === 'warning').length, 0),
    elapsedMs: Date.now() - startedAt,
  };
  writeProgress();
  await context.close();
} finally {
  await browser.close();
}

process.stdout.write(`Audit report: ${pathToFileURL(resolvedOutput).href}\n`);
if (!result.sourceOriginIsolation?.passed || result.renderFailures.length || result.axe?.violations.length || result.representativeDetail?.console.some((message) => message.type === 'error') || result.representativeDetail?.pageErrors.length || result.representativeDetail?.failedRequests.length || result.representativeDetail?.badResponses.length || result.representativeDetail?.desktopLayout.overflow || result.representativeDetail?.mobileLayout.overflow) {
  process.exitCode = 1;
}
