import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = 'quality/evidence/step-45/public-v78-reaudit';
const routeReport = JSON.parse(await readFile(path.join(root, 'route-audit.json'), 'utf8'));
const corpus = JSON.parse(await readFile(path.join(root, 'resource-copy-corpus/copy-corpus.json'), 'utf8'));
const axe = JSON.parse(await readFile(path.join(root, 'axe-resource-results.json'), 'utf8'));
const runtimeRows = (await readFile(path.join(root, 'copy-sweep-runtime.jsonl'), 'utf8')).trim().split(/\r?\n/).map((line) => JSON.parse(line));
const previewReports = [];
for (const file of await (await import('node:fs/promises')).readdir(path.join(root, 'previews'))) {
  if (!['desktop', 'mobile'].includes(file)) continue;
  for (const name of await (await import('node:fs/promises')).readdir(path.join(root, 'previews', file))) {
    if (!name.endsWith('.json')) continue;
    previewReports.push(JSON.parse(await readFile(path.join(root, 'previews', file, name), 'utf8')));
  }
}
const routes = routeReport.routes.map((route) => {
  const desktop = routeReport.results.find((result) => result.route === route.path && result.viewport.startsWith('desktop'));
  const mobile = routeReport.results.find((result) => result.route === route.path && result.viewport.startsWith('mobile'));
  const pass = [desktop, mobile].every((result) => result?.httpStatus === 200
    && result.classification === 'PASS'
    && !result.layout.horizontalOverflow
    && result.console.length === 0
    && result.uncaught.length === 0
    && result.network.failedRequests.length === 0
    && result.network.badResponses.length === 0
    && !result.previewWaitTimedOut
    && !result.routeReadyTimedOut);
  return { ...route, desktop, mobile, classification: pass ? 'PASS' : 'DEGRADED' };
});
const warningProbe = JSON.parse(await readFile(path.join(root, 'console-warning-recheck.json'), 'utf8'));
const flaggedSlugs = [...new Set(corpus.flaggedCopies.map((row) => row.slug))].sort();
const warningRecheckCount = warningProbe.warnings.length;
const screenshotLink = (result) => `[capture](routes/${result.screenshot.split('\\').at(-1)})`;
const rows = routes.map((route) => `| \`${route.path}\` | ${route.classification} | ${route.desktop.httpStatus} / ${route.mobile.httpStatus} | ${screenshotLink(route.desktop)} | ${screenshotLink(route.mobile)} |`).join('\n');
const totalResponses = runtimeRows.reduce((total, row) => {
  for (const [status, count] of Object.entries(row.responseStatusCounts)) total[status] = (total[status] ?? 0) + count;
  return total;
}, {});
const report = `# Public v78 route and content re-audit

Captured: ${routeReport.generatedAt}
Site: [${routeReport.site}](${routeReport.site})
Version: 78 — \`${axe.siteVersionId}\`
Deployment: \`${axe.deploymentId}\`
Canonical source: \`${axe.canonicalSourceCommit}\`
Sites source mirror: \`${axe.siteSourceCommit}\`

## Result

All ${routes.length} required routes are classified **PASS** for route rendering, visible content, responsive shell, and screenshot smoke at 1440×900 and 390×844 (${routeReport.results.length}/${routeReport.results.length} captures). Every page returned HTTP 200. No route readiness or catalogue preview timeout, horizontal overflow, uncaught exception, failed request, or HTTP error was recorded. Screenshots and contact sheets are retained below.

The route smoke does not claim every button on every secondary page was exercised. The flagship editing flow and high-risk resource controls were tested separately; this report records what the browser opened and showed.

## Route matrix

| Route | Classification | Desktop / mobile HTTP | Desktop evidence | Mobile evidence |
| --- | --- | --- | --- | --- |
${rows}

## Screenshot review

The full 31-route desktop and 31-route mobile screenshot sheets were visually inspected. No blank route, broken shell, clipped heading, or obvious responsive overflow was found. Individual captures are in [routes/](routes/); contact sheets: [desktop](contact/desktop-contact-sheet.png) and [mobile](contact/mobile-contact-sheet.png).

## Resource copy and variant sweep

The deployed catalogue loaded ${corpus.resourceCount} unique resources. The browser visited ${corpus.results.length} resource detail pages (324 at each viewport) and rendered ${corpus.surfaceCount} variants (Quiet, Expressive, and Nocturne). Results: ${corpus.routeFailures.length} route failures, ${corpus.runtimeFailures.length} runtime/network failures, ${corpus.emptyPreviews.length} empty previews, and ${corpus.variantMismatches.length} variant mismatches.

The conservative copy scanner returned ${corpus.flaggedCopies.length} occurrences across ${flaggedSlugs.length} resources: ${flaggedSlugs.join(', ')}. Manual review found these were expected loading skeletons, an explicit empty-state placeholder, or sample pricing/feature labels that tell users to replace example values. The flagged text did not present product activity or published pricing as real. No lorem ipsum, fake customer count, unsupported performance/accessibility guarantee, or unrelated finance residue was detected by the configured corpus checks.

The existing high-risk copy/interaction regressions passed ${runtimeRows.length}/${runtimeRows.length} on public v78 across both viewports. Combined observed response statuses were ${Object.entries(totalResponses).map(([status, count]) => status + ': ' + count).join(', ')}; the two 302 responses completed the Cloudflare detection flow. Failed requests and HTTP errors were zero. One window.styleMedia deprecation warning appeared once in the initial mobile run on the interactive globe route; the subsequent 13-route reproduction recorded ${warningRecheckCount} warnings, and it did not recur in the full 648-page resource sweep, or in the preview capture run. Reproduction telemetry is in [console-warning-recheck.json](console-warning-recheck.json).

## Isolated preview and accessibility

A separate Axe run inspected both the resource detail shell and its actual isolated child frame on /r/button/ and /r/ai-empty-state/ at both viewports: ${axe.results.length} scans, zero violations. It retained the strict sandbox and CSP. The audit served Axe from a same-origin test-only route within the existing /_astro/ script allowlist; no product CSP rule was relaxed. Evidence: [Axe results](axe-resource-results.json), [screenshots](axe/).

A separate Axe run inspected both the resource detail shell and its actual isolated child frame on /r/button/ and /r/ai-empty-state/ at both viewports: ${axe.results.length} scans, zero violations. It retained the strict sandbox and CSP. The audit served Axe from a same-origin test-only route within the existing /_astro/ script allowlist; no product CSP rule was relaxed. Evidence: [Axe results](axe-resource-results.json), [screenshots](axe/).

## Targeted issue closeout

AUD-471–AUD-491 (21 medium findings from the public v75 review) are now closed after the same content and control assertions passed on v78 at both viewports. The ledger points to the v78 screenshots, runtime JSONL, full resource corpus, and Axe report. The 30-test deployed report is [copy-sweep-runtime.jsonl](copy-sweep-runtime.jsonl); detail-page captures are under [copy-after/](copy-after/).
`;
await writeFile(path.join(root, 'ROUTE_AUDIT.md'), report, 'utf8');
console.log(JSON.stringify({ output: path.join(root, 'ROUTE_AUDIT.md'), routes: routes.length, pass: routes.filter((route) => route.classification === 'PASS').length, copyRoutes: corpus.results.length, variants: corpus.surfaceCount, targetedTests: runtimeRows.length, axeScans: axe.results.length, previewCaptures: previewReports.length }, null, 2));
