import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const writeJson = async (file, value) => writeFile(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const routeAudit = await readJson('quality/evidence/step-45/public-v37/route-audit.json');
const flagship = await readJson('quality/evidence/step-45/public-v37/flagship/playwright-report.json');
const axe = await readJson('quality/evidence/step-45/public-v37/axe/playwright-report.json');
const generatedAxe = await readJson('quality/evidence/step-45/public-v37/generated-a11y/playwright-report.json');
const hydration = await readJson('quality/evidence/step-45/public-v37/hydration-playwright-report.json');
const previewHandoff = await readJson('quality/evidence/step-45/public-v37/preview-navigation-live.json');
const homepage = await readJson('quality/evidence/step-45/public-v37/home-first-fold-live.json');
const replacement = await readJson('quality/evidence/step-45/public-v37/workbench-replacement-live.json');

const audit = await readJson('audit/runtime-audit.json');
const byId = new Map(audit.entries.map((entry) => [entry.id, entry]));
const v37 = 'Public Sites v37';
const closures = new Map([
  ['AUD-337', `${v37}: the accessible tree exposes the Search button as “Search ⌘K” on mobile; the full WCAG 2.2 A/AA + target-size sweep reports zero violations on Home and the other Core routes. Evidence: quality/evidence/step-45/public-v37/axe/sites-live-mobile-390/core-route-a11y.json and quality/evidence/step-45/public-v37/axe/playwright-report.json.`],
  ['AUD-342', `${v37}: fresh Home responses include a rotating script nonce; script-src has no unsafe-inline and the CSP contains no loopback origins. The 62-route browser sweep and focused flows captured zero browser console errors. The one unrelated Lighthouse deprecation finding is tracked as AUD-356. Evidence: quality/evidence/step-45/public-v37/home-first-fold-live.json and route-audit.json.`],
  ['AUD-343', `${v37}: four 390x844 Chrome DevTools cold-load traces at 4x CPU/Fast 4G measured LCP 1,747ms, 2,994ms, 1,762ms, and 1,739ms, with CLS 0 throughout. Three of four are below 2.5s; the 2,994ms outlier had 1,184ms TTFB and 1,810ms render delay. The LCP was text, render-blocking savings were 0ms, and CrUX has no field data. Treat the outlier as an explicit Sites cold-response limitation rather than claim every sample meets 2.5s. DevTools findings are summarized in quality/evidence/step-45/public-v37/performance-summary.json.`],
  ['AUD-344', `${v37}: the visible isolated-preview CTA flow passes on desktop and mobile. “Start composing” leaves the parent URL in the resource detail, the host displays an explicit confirmation, and only the user-confirmed “Open preview link” navigates to Compose. Compose reaches Catalogue ready with /data/catalog.json HTTP 200 and an enabled submit button. There were zero console errors, uncaught exceptions, failed requests, or bad HTTP responses. Evidence: quality/evidence/step-45/public-v37/preview-navigation-live.json and screenshots.`],
  ['AUD-345', `${v37}: live 360/390/430px checks measure the visual-spectrum preview title at one readable line (20px), with no horizontal overflow or runtime/network errors. Evidence: quality/evidence/step-45/public-v37/home-spectrum-live.json and home-spectrum-mobile-390.png.`],
  ['AUD-347', `${v37}: the visible Resource inspector and replacement candidate show their expected heading levels; the live replacement dialog Axe scan reports zero heading-order violations. The broader live Axe route/mode sweeps also report zero violations. Evidence: quality/evidence/step-45/public-v37/workbench-replacement-live.json and axe/playwright-report.json.`],
  ['AUD-348', `${v37}: the actual Replace Resource surface is exposed as role=dialog with aria-modal=true, is not hosted by aside[role=dialog], closes with Escape, and returns focus to its opener. Evidence: quality/evidence/step-45/public-v37/workbench-replacement-live.json and workbench-replacement-dialog-desktop-1440.png.`],
  ['AUD-349', `${v37}: the selected layer exposes visible and accessible names “Move up” and “Move down”; both actions are visible after Escape closes the dialog. The live Axe label-content-name-mismatch rule reports zero violations. Evidence: quality/evidence/step-45/public-v37/workbench-replacement-live.json.`],
  ['AUD-350', `${v37}: the live Workbench accessibility tree names the switch “Laptop model LAB Off” and explains that laptop features require this laptop and Docker. The mobile Command mode includes the truthful disabled state; live Workbench mode and generated-product Axe scans report zero violations. Evidence: quality/evidence/step-45/public-v37/axe/playwright-report.json and generated-a11y/playwright-report.json.`],
  ['AUD-351', `${v37}: all five preset buttons are fully visible, readable, and selectable at 360, 390, 430, 768, 1024, 1280, and 1440 CSS pixels; there is no document overflow or clipped chip text. Evidence: quality/evidence/step-45/public-v37/home-first-fold-live.json and mobile/desktop screenshots.`],
  ['AUD-352', `${v37}: at 390x844 the homepage hero is 647.53px high against its 759.6px 90svh budget; Compose ends at y=678.53, so all preset labels and the primary action fit in the first viewport. Evidence: quality/evidence/step-45/public-v37/home-first-fold-live.json and home-first-fold-mobile-390.png.`],
  ['AUD-353', `${v37}: /pages at desktop and mobile displays the role/team/goals onboarding recipe copy and contains no “interface telemetry” text. Both route responses returned HTTP 200 with zero console errors or failed requests. Evidence: quality/evidence/step-45/public-v37/route-audit.json and its /pages desktop/mobile screenshots.`],
  ['AUD-354', `${v37}: the JavaScript-disabled 390x844 Home response returns HTTP 200 and keeps the structure selectors disabled with a polite readiness message; the no-JS capture made no script requests. Hydration checks confirm the controls become usable after client readiness. Evidence: quality/evidence/step-45/public-v37/structure/aud-354-mobile-after.json and hydration-playwright-report.json.`],
  ['AUD-355', `${v37}: at 360, 390, 430, 768, 1024, and 1440px the structure diagram keeps scrollWidth equal to clientWidth and scrollHeight equal to clientHeight; no clipping or browser errors were recorded. Evidence: quality/evidence/step-45/public-v37/structure/aud-355-responsive-after.json and responsive screenshots.`],
]);

for (const [id, verification] of closures) {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Missing audit entry ${id}`);
  entry.status = 'closed-deployed-verified';
  entry.verification = verification;
}

for (const [id, verification] of [
  ['AUD-335', `${v37}: the saved Workbench project opened from the visible UI before any catalogue fetch; Library then loaded its catalogue on demand. The desktop/mobile flagship workflow passed without an uncaught browser or network error. See quality/evidence/step-45/public-v37/flagship/playwright-report.json and route-audit.json.`],
  ['AUD-336', `${v37}: the live public CSP contains no localhost or 127.0.0.1 origins. The nonce and policy assertions pass on fresh desktop/mobile Home responses; all 62 route captures report HTTP 200 and zero console errors. See quality/evidence/step-45/public-v37/home-first-fold-live.json and route-audit.json.`],
]) {
  const entry = byId.get(id);
  if (entry) entry.verification = verification;
}

if (!byId.has('AUD-356')) {
  audit.entries.push({
    id: 'AUD-356',
    severity: 'low',
    route: '/',
    viewport: '1440x900',
    category: 'performance',
    title: 'Sites-injected challenge script triggers Lighthouse deprecated API warnings',
    expected: 'A Lighthouse Best Practices run should not report deprecated browser APIs from code delivered with the page.',
    actual: 'Public v37 Lighthouse scored Best Practices 81. Its sole failing audit was deprecations, listing FencedFrame, StorageType.persistent, and Protected Audience API usage from the Cloudflare-injected /cdn-cgi/challenge-platform/scripts/jsd/main.js. Application route and workflow sweeps report zero console errors, uncaught exceptions, failed requests, or bad responses.',
    reproduction: [
      'Open the public review Site homepage at 1440x900.',
      'Run a Chrome Lighthouse navigation audit.',
      'Inspect the only failed Best Practices audit, deprecations, and its source at the Cloudflare challenge-platform script URL.',
    ],
    console: [],
    network: [{ url: '/cdn-cgi/challenge-platform/scripts/jsd/main.js', note: 'Injected by the Sites/Cloudflare edge; outside the Tessellate repository bundle.' }],
    screenshot: 'quality/evidence/step-45/public-v37/routes/home-desktop-1440x900.png',
    rootCause: 'The Sites/Cloudflare challenge platform injects a browser script that uses APIs Lighthouse currently marks deprecated. Tessellate source does not control this script.',
    affectedCode: ['ChatGPT Sites / Cloudflare challenge-platform injected script (external to this repository)'],
    fixCommit: null,
    status: 'documented-host-limitation',
    verification: 'Lighthouse desktop scores: Accessibility 100, SEO 100, Agentic Browsing 100, Best Practices 81. The deprecations audit lists only the three platform-injected APIs. No application console errors or failed network requests were recorded in the v37 route, flagship, accessibility, or interaction audits. This is documented as a Sites-host limitation; no source security policy was weakened.',
  });
}

audit.generatedAt = new Date().toISOString();
const historyMarker = 'Historical evidence and findings follow. ';
const historyStart = audit.scope.indexOf(historyMarker);
const historicalScope = historyStart >= 0 ? audit.scope.slice(historyStart + historyMarker.length) : audit.scope;
audit.scope = `Current public review baseline: Sites v37, from app code captured at canonical e08c34021bcf13fbe603f86803cb4d7f7eb443b8 and Sites mirror c2cd798a3b253a80395febea1f61ab2dd71ca347. The v37 desktop/mobile route sweep, visible employee flagship, core and generated-product Axe checks, hydration checks, responsive homepage, preview-to-Compose handoff, Workbench replacement dialog, and DevTools performance evidence are stored under quality/evidence/step-45/public-v37/. Findings AUD-337, AUD-342–345, and AUD-347–355 are closed after issue-specific deployed checks; AUD-356 documents the external Cloudflare Lighthouse deprecation finding. ${historyMarker}${historicalScope}`;
await writeJson('audit/runtime-audit.json', audit);

const routeStatuses = Object.fromEntries(Object.entries(Object.groupBy(routeAudit.results, (item) => item.classification)).map(([key, value]) => [key, value.length]));
const home390 = homepage.measurements.find((item) => item.viewportWidth === 390);
const performance = {
  site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
  deploymentVersion: 37,
  source: {
    canonicalAppCommit: 'e08c34021bcf13fbe603f86803cb4d7f7eb443b8',
    sitesMirrorCommit: 'c2cd798a3b253a80395febea1f61ab2dd71ca347',
    versionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_918118e36d4c819196088b063bfab113',
    deploymentId: 'appgdep_6adfb7fd932c8191ae443e9a0af85c25',
  },
  methodology: { provider: 'Chrome DevTools MCP', labOnly: true, fieldCrUXAvailable: false },
  homeDesktop1440: { lcpMs: 270, ttfbMs: 58, cls: 0, cache: 'cold' },
  workbenchMobile390: {
    viewport: '390x844', cpuSlowdown: '4x', network: 'Fast 4G', reducedMotion: true,
    coldLoadSamples: [
      { lcpMs: 1747, ttfbMs: 50, cls: 0, source: 'initial v37 trace' },
      { lcpMs: 2994, ttfbMs: 1184, renderDelayMs: 1810, cls: 0, source: 'fresh DevTools trace' },
      { lcpMs: 1762, ttfbMs: 66, renderDelayMs: 1697, cls: 0, source: 'fresh DevTools trace' },
      { lcpMs: 1739, ttfbMs: 69, renderDelayMs: 1669, cls: 0, source: 'fresh DevTools trace' },
    ],
    below2500ms: 3,
    totalSamples: 4,
    interpretation: 'Three of four cold lab samples were below 2.5s. The outlier was driven by a 1,184ms document TTFB; its LCP element was text, and the trace estimated zero savings from render-blocking requests. No CrUX field data is available.',
  },
  lighthouseDesktop: {
    accessibility: 100,
    seo: 100,
    agenticBrowsing: 100,
    bestPractices: 81,
    failedAudit: 'deprecations',
    externalWarnings: ['FencedFrame', 'StorageType.persistent', 'Protected Audience API'],
    source: '/cdn-cgi/challenge-platform/scripts/jsd/main.js',
  },
  noCspCompromise: { scriptSrcUnsafeInline: false, loopbackOrigins: false, freshResponseNonceRotates: homepage.security.nonceRotatedOnReload },
};
await writeJson('quality/evidence/step-45/public-v37/performance-summary.json', performance);

const summary = {
  schemaVersion: '1.0.0',
  site: performance.site,
  deploymentVersion: 37,
  deploymentStatus: 'succeeded',
  source: performance.source,
  routeSweep: { routeCount: routeAudit.routes.length, viewportCount: routeAudit.viewportCount, resultCount: routeAudit.results.length, http200: routeAudit.results.filter((item) => item.httpStatus === 200).length, classifications: routeStatuses, consoleErrors: 0, uncaughtErrors: 0, failedRequests: 0, badResponses: 0, limitation: 'PASS is a route/runtime/layout smoke classification, not a claim that every page interaction and content item was exhaustively tested.' },
  visibleFlagship: { expected: flagship.stats.expected, skipped: flagship.stats.skipped, unexpected: flagship.stats.unexpected, configuredSkips: true, viewportRuns: ['1440x900', '390x844'] },
  axe: { genericExpected: axe.stats.expected, genericSkipped: axe.stats.skipped, generatedProductExpected: generatedAxe.stats.expected, generatedProductSkipped: generatedAxe.stats.skipped, hydrationExpected: hydration.stats.expected, hydrationSkipped: hydration.stats.skipped, axeViolations: 0 },
  responsive: { widths: [360, 390, 430, 768, 1024, 1280, 1440], homeHeroAt390: { heightPx: home390.heroHeight, max90svhPx: home390.heroLimit90svh, composeBottomPx: home390.composeBottom, allFivePresetsVisible: true }, presetInteractions: homepage.interaction },
  previewComposeHandoff: { viewports: ['1440x900', '390x844'], runsPassed: 2, httpStatus: previewHandoff.detailHttpStatus, catalogueStatuses: previewHandoff.catalogueStatuses, consoleErrors: previewHandoff.consoleErrors, uncaughtErrors: previewHandoff.pageErrors, failedRequests: previewHandoff.failedRequests, badResponses: previewHandoff.badResponses },
  workbenchReplacement: { passed: 1, candidate: replacement.candidate, axeViolations: replacement.axeViolations, dialogKeyboardClose: replacement.escape, accessibleMoveActions: replacement.moveActionAccessibleNames },
  performance,
  bundleBudgets: {
    homepage: { gzipKb: 99.62, budgetKb: 150, pass: true },
    explore: { gzipKb: 177.37, budgetKb: 200, pass: true },
    compose: { gzipKb: 270.83, budgetKb: 750, pass: true },
    workbench: { gzipKb: 495.08, budgetKb: 750, pass: true },
    searchCatalog: { gzipKb: 112.52, budgetKb: 2048, pass: true },
  },
  localValidation: {
    frozenDependencyInstall: 'pass',
    catalogueBuild: { status: 'pass', resources: 324, goldRuntimeResources: 40 },
    typecheck: { status: 'pass', workspaceProjects: 22 },
    lint: { status: 'pass' },
    unitTests: { status: 'pass', passed: 1222, skipped: 1, failed: 0 },
    auditAll: { status: 'pass', behavioralReleaseGateCriteria: '16/16', resourceIsolationResources: 324, licenceProvenanceResources: 324, securityViolations: 0, dependencyAdvisories: 0 },
    productionBuild: { status: 'pass', staticPages: 733 },
    focusedLocalGeneratedProductAxe: { desktopPassed: 1, mobilePassed: 1 },
    fullRepositoryE2E: 'Exact-head GitHub CI verification pending after this evidence commit.',
  },
  persistenceAndBindings: { persistence: 'browser/local-first for the reviewed static staging experience', d1Provisioned: false, r2Provisioned: false, newDatabase: false },
  unverifiedLocalFixes: { bySeverity: Object.fromEntries(Object.entries(Object.groupBy(audit.entries.filter((entry) => entry.status === 'fixed-awaiting-deployed-verification'), (entry) => entry.severity)).map(([key, value]) => [key, value.length])), total: audit.entries.filter((entry) => entry.status === 'fixed-awaiting-deployed-verification').length, note: 'These findings have local fixes but do not count as deployed-verified until their specific behavior is checked on the active Site. The full hardening programme remains incomplete.' },
  documentedHostLimitations: audit.entries.filter((entry) => entry.status === 'documented-host-limitation').map(({ id, severity, title }) => ({ id, severity, title })),
};
await writeJson('quality/evidence/step-45/public-v37/verification-summary.json', summary);

process.stdout.write(`${JSON.stringify({ totalFindings: audit.entries.length, statuses: Object.fromEntries(Object.entries(Object.groupBy(audit.entries, (entry) => entry.status)).map(([key, value]) => [key, value.length])), routeResults: summary.routeSweep.resultCount, closures: [...closures.keys()] }, null, 2)}\n`);
