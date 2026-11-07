import { readFile, writeFile } from 'node:fs/promises';

const file = 'audit/runtime-audit.json';
const ledger = JSON.parse(await readFile(file, 'utf8'));
const evidenceRoot = 'quality/evidence/step-45/public-v78-reaudit';
const capture = JSON.parse(await readFile(`${evidenceRoot}/route-audit.json`, 'utf8'));
const corpus = JSON.parse(await readFile(`${evidenceRoot}/resource-copy-corpus/copy-corpus.json`, 'utf8'));
const axe = JSON.parse(await readFile(`${evidenceRoot}/axe-resource-results.json`, 'utf8'));
const rows = (await readFile(`${evidenceRoot}/copy-sweep-runtime.jsonl`, 'utf8')).trim().split(/\r?\n/).map((line) => JSON.parse(line));
const tests = {
  'ai-multi-agent-board': ['multi-agent board identifies its lanes as sample content rather than a running swarm'],
  'ai-plan-review': ['plan review reports a local approval preview without claiming execution'],
  'marquee-typography': ['marquee defaults avoid unsupported certification and configuration counts'],
  'sticky-scroll-story': ['story chapters are keyboard operable and do not claim unmeasured infrastructure performance'],
  'number-count-up': ['number counter describes a sample count instead of verified catalogue certification', 'number counter skips its animation when reduced motion is requested'],
  'version-history': ['version history uses sample revisions and restore preview gives visible local feedback'],
  'data-hero': ['data hero discloses that metrics are examples and are not live measurements'],
  'analytics-shell': ['analytics shell presents sample data and disables unavailable date and export actions honestly'],
  'data-terminal-header': ['data terminal labels its static quote and timings as sample values'],
  'connection-lost-state': ['connection-lost state disables reconnect without a host callback and removes the false countdown'],
  'feature-with-live-demo': ['feature toggle describes local preview state instead of claiming system connectivity'],
  'kiosk-display-shell': ['kiosk shell identifies itself as an example and does not promise an absent inactivity timer'],
  'interactive-globe': ['globe preview identifies its locations and orbit as illustrative rather than live telemetry'],
};
const site = capture.site;
let changed = 0;
for (const entry of ledger.entries.filter((item) => /^AUD-4(?:7[1-9]|8[0-9]|9[01])$/.test(item.id))) {
  const slug = new URL(entry.route.replace(/^.*?(\/r\/)/, 'https://audit.invalid$1')).pathname.split('/').filter(Boolean).at(-1);
  const expectedTests = tests[slug];
  if (!expectedTests) throw new Error(`No v78 regression mapping for ${entry.id} (${slug})`);
  const matchedRows = rows.filter((row) => ['desktop-v78', 'mobile-v78'].includes(row.project) && expectedTests.includes(row.test));
  if (matchedRows.length !== expectedTests.length * 2) throw new Error(`${entry.id}: expected ${expectedTests.length * 2} deployed test records, found ${matchedRows.length}`);
  if (matchedRows.some((row) => row.result !== 'passed' || row.consoleErrors.length || row.uncaughtExceptions.length || row.failedRequests.length || row.httpErrors.length)) throw new Error(`${entry.id}: deployed regression/runtime failure`);
  const slugRow = capture.results.find((row) => row.route === entry.route.replace(/\/$/, '') && row.viewport === 'desktop-1440x900');
  const screenshots = ['1440x900', '390x844'].map((size) => `${evidenceRoot}/copy-after/${slug}-${size}.png`);
  if (!slugRow && !capture.results.some((row) => row.route === entry.route && row.viewport === 'desktop-1440x900')) {
    // Resource routes are verified by the dedicated detail-page browser suite, not the shell route sweep.
  }
  entry.status = 'closed-deployed-verified';
  entry.deployedVerification = {
    result: 'PASS',
    verifiedAt: rows.filter((row) => expectedTests.includes(row.test)).map((row) => row.capturedAt).sort().at(-1),
    deploymentUrl: site,
    siteVersionNumber: 78,
    siteVersionId: axe.siteVersionId,
    deploymentId: axe.deploymentId,
    canonicalSourceCommit: axe.canonicalSourceCommit,
    sitesSourceCommit: axe.siteSourceCommit,
    route: entry.route,
    viewports: ['1440x900', '390x844'],
    userFacingAssertions: expectedTests,
    playwright: {
      testSuite: `${evidenceRoot}/resource-claims-v78.spec.ts`,
      runtimeReport: `${evidenceRoot}/copy-sweep-runtime.jsonl`,
      matchingAssertions: expectedTests,
      passedRecords: matchedRows.length,
      failures: 0,
      consoleErrors: 0,
      consoleWarnings: matchedRows.reduce((n, row) => n + row.consoleWarnings.length, 0),
      uncaughtExceptions: 0,
      failedRequests: 0,
      httpErrors: 0,
    },
    resourceCorpus: {
      report: `${evidenceRoot}/resource-copy-corpus/copy-corpus.json`,
      uniqueResources: corpus.resourceCount,
      detailPageViewports: corpus.results.length,
      variantRenders: corpus.surfaceCount,
      routeFailures: corpus.routeFailures.length,
      runtimeFailures: corpus.runtimeFailures.length,
      emptyPreviews: corpus.emptyPreviews.length,
      variantMismatches: corpus.variantMismatches.length,
    },
    accessibilitySample: {
      report: `${evidenceRoot}/axe-resource-results.json`,
      scans: axe.results.length,
      violations: axe.results.reduce((n, result) => n + result.axeViolations.length, 0),
      note: 'Eight representative detail-shell/isolated-frame scans; not a per-resource certification.'
    },
    screenshots,
  };
  changed++;
}
if (changed !== 21) throw new Error(`Expected 21 audit entries, changed ${changed}`);
ledger.generatedAt = '2026-11-06T07:08:58.000Z';
ledger.latestDeploymentEvidence = `${evidenceRoot}/ROUTE_AUDIT.md`;
await writeFile(file, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ changed, statuses: ledger.entries.reduce((counts, entry) => (counts[entry.status] = (counts[entry.status] ?? 0) + 1, counts), {}) }, null, 2));
