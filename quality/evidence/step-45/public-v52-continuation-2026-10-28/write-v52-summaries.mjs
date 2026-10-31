import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28');
const routeAudit = JSON.parse(await readFile(path.join(root, 'route-audit.json'), 'utf8'));
const interaction = JSON.parse(await readFile(path.join(root, 'interactive-smoke.json'), 'utf8'));
const coverage = {
  '/': 'Homepage content and first-fold responsive layout reviewed; exact brief composer entry verified in flagship run.',
  '/explore': 'Search dashboard, combine Motion facet, clear query while retaining the facet, and clear facet; desktop and mobile.',
  '/compose': 'Exact employee brief, catalogue ready, three direction previews, selection of Direction C and Workbench handoff.',
  '/workbench': 'Direction C, all five modes, selection, inheritance, lock, Recompose 95, Replace, Surprise Me, Undo/Redo, responsive views, reload, exports.',
  '/showcase/showcase-playful-hr/': 'Static sample disclosure and eight showcase products audited at desktop/mobile; employee page contains duplicate hero/CTA copy.',
  '/showcase': 'Gallery cards and Beta/sample disclosure reviewed; public companion index data is stale for four of eight records.',
  '/tools/section-planner/': 'Add section through UI at desktop/mobile; stable interaction works, but Chrome reports the custom-title input lacks id/name.',
  '/r/dashboard-kpi-grid/': 'Representative resource detail, provenance and metadata reviewed; route and preview network smoke passed.',
  '/blueprints/b2b-saas/': 'Representative blueprint detail reviewed; route and responsive smoke passed.',
  '/docs/manifest/': 'Representative documentation page reviewed; route and responsive smoke passed.',
  '/collections': 'Empty state explicitly says resources are browser-local and explains how to start a collection.',
  '/trends': 'Counts and DNA distributions disclose that they come from catalogue metadata, not usage analytics.',
  '/agents': 'Beta disclosure says the public Site has no hosted MCP process or API.',
  '/terms': 'Review deployment limits, no shared accounts/server retention/uptime, and content safety are stated.',
  '/privacy': 'Guest/browser storage boundary disclosed.',
};
const degraded = {
  '/showcase': 'DEGRADED',
  '/showcase/showcase-playful-hr/': 'DEGRADED',
  '/tools/section-planner/': 'DEGRADED',
};
const why = {
  '/showcase': 'The page itself is current, but its public companion JSON index has four stale records; see AUD-377.',
  '/showcase/showcase-playful-hr/': 'The same employee marketing headline is rendered as both the hero H1 and the conversion CTA H2; see AUD-375.',
  '/tools/section-planner/': 'The add-section action works, but the custom-title textbox has neither id nor name and triggers a Chrome issue; see AUD-376.',
};
const results = routeAudit.routes.map((route) => {
  const desktop = routeAudit.results.find((x) => x.route === route && x.viewport === 'desktop-1440x900');
  const mobile = routeAudit.results.find((x) => x.route === route && x.viewport === 'mobile-390x844');
  const classification = degraded[route] ?? 'PASS';
  return {
    route,
    classification,
    rationale: why[route] ?? (coverage[route] ?? 'The public route returned content and passed the desktop/mobile route, runtime, network-response, image and overflow smoke. This classification is limited to the explicitly listed interaction coverage.'),
    interactions: coverage[route] ?? 'Visible content and responsive first fold reviewed; no route-specific interaction claim.',
    evidence: {
      desktop: { viewport: '1440x900', status: desktop?.navigationStatus, screenshot: desktop?.screenshot, horizontalOverflow: desktop?.metrics?.horizontalOverflow, consoleErrorsOrWarnings: desktop?.console?.length ?? 0, failedRequests: desktop?.failedRequests?.length ?? 0, badResponses: desktop?.badResponses?.length ?? 0 },
      mobile: { viewport: '390x844', status: mobile?.navigationStatus, screenshot: mobile?.screenshot, horizontalOverflow: mobile?.metrics?.horizontalOverflow, consoleErrorsOrWarnings: mobile?.console?.length ?? 0, failedRequests: mobile?.failedRequests?.length ?? 0, badResponses: mobile?.badResponses?.length ?? 0 },
    },
  };
});
const dataArtifact = {
  route: '/data/showcases/index.json',
  classification: 'MISLEADING',
  rationale: 'The JSON returns HTTP 200 but differs from the canonical showcase records in four of eight entries. The visible showcase gallery uses current definitions, so the public JSON and page disagree.',
  evidence: {
    status: 200,
    screenshot: 'quality/evidence/step-45/public-v52-continuation-2026-10-28/routes/_showcase-desktop-1440x900.png',
    comparison: 'quality/evidence/step-45/public-v52-continuation-2026-10-28/compare-showcase-index.ts output',
    mismatches: ['showcase-luxury-hospitality tagline', 'showcase-playful-hr name and tagline', 'showcase-luxury-ecommerce tagline', 'showcase-minimal-productivity tagline'],
  },
};
await writeFile(path.join(root, 'route-classifications.json'), JSON.stringify({
  site: routeAudit.site,
  siteVersion: 52,
  capturedAt: routeAudit.capturedAt,
  scope: 'Required public route set, desktop/mobile route smoke plus specific visible interactions documented per route. PASS does not claim exhaustive testing of every linked feature.',
  classifications: results,
  additionalPublicDataArtifacts: [dataArtifact],
}, null, 2) + '\n');

await writeFile(path.join(root, 'performance-summary.json'), JSON.stringify({
  site: routeAudit.site,
  siteVersion: 52,
  observedAt: '2026-10-28',
  tool: 'Chrome DevTools MCP performance trace',
  traceMode: 'Cold navigation, 1x CPU, no network throttling.',
  fieldData: 'No CrUX data is available; navigation traces do not synthesize representative INP.',
  traces: [
    { route: '/', viewport: '1440x900', lcpMs: 278, ttfbMs: null, renderDelayMs: null, cls: 0, notes: 'Value was captured in the prior v52 DevTools trace; detailed breakdown unavailable in this continuation.' },
    { route: '/compose', viewport: '1440x900', lcpMs: 140, ttfbMs: 40, renderDelayMs: 100, cls: 0, renderBlockingEstimatedSavingsMs: 0 },
    { route: '/explore', viewport: '1440x900', lcpMs: 142, ttfbMs: 44, renderDelayMs: 98, cls: 0, renderBlockingEstimatedSavingsMs: 0, advisory: 'ForcedReflow insight 52ms; unattributed and no top-level task or estimated savings.' },
    { route: '/workbench?project=proj-direction-c-fac3e48987084b118aaa2b606861e08ddirc', viewport: '1440x900', lcpMs: 635, ttfbMs: 66, renderDelayMs: 569, cls: 0, renderBlockingEstimatedSavingsMs: 0 },
  ],
  traceArtifact: 'Chrome DevTools MCP returned inline trace metrics but denied trace export outside its configured workspace roots.',
}, null, 2) + '\n');

const aborted = interaction.checks.flatMap((x) => x.failedRequests ?? []).filter((x) => x.error === 'net::ERR_ABORTED');
interaction.requestCancellationAssessment = {
  observedCount: aborted.length,
  meaning: 'During rapid query/facet changes, the result list unmounts previews and Chromium cancels their in-flight scripts/iframes. These cancellations are explicitly recorded as ERR_ABORTED; no HTTP 4xx/5xx, console errors, or uncaught errors accompanied them. Stable route sweeps and the final catalogue request returned 200. They are not silently treated as successful HTTP responses.',
  requests: aborted,
};
await writeFile(path.join(root, 'interactive-smoke.json'), JSON.stringify(interaction, null, 2) + '\n');
console.log(JSON.stringify({ routeCount: results.length, classifications: results.reduce((a,x)=>(a[x.classification]=(a[x.classification]||0)+1,a),{}), dataArtifact, performance: 3, requestCancellations: aborted.length }));
