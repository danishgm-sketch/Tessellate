import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.join(evidenceDir, 'report.json');
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const grouped = new Map();

for (const result of report.results) {
  const captures = grouped.get(result.route) ?? [];
  captures.push(result);
  grouped.set(result.route, captures);
}

const routeRows = [];
for (const [route, captures] of grouped) {
  const runtimeClean = captures.every((capture) =>
    capture.status === 200 &&
    !capture.navigationError &&
    Boolean(capture.h1) &&
    capture.mainTextLength >= 300 &&
    !capture.horizontalOverflow &&
    capture.consoleErrors.length === 0 &&
    capture.consoleWarnings.length === 0 &&
    capture.uncaught.length === 0 &&
    capture.failedRequests.length === 0 &&
    capture.httpErrors.length === 0
  );
  if (captures.length !== 2 || !runtimeClean) {
    throw new Error(`Route shell acceptance failed for ${route}`);
  }

  const classificationNote = 'PASS is scoped to populated route shell/content, runtime/network health, and responsive overflow at the recorded viewports. It does not certify every control on this route.';
  for (const capture of captures) {
    capture.classification = 'PASS';
    capture.classificationNote = classificationNote;
  }
  routeRows.push({
    route,
    classification: 'PASS',
    captures: captures
      .sort((a, b) => a.viewport.localeCompare(b.viewport))
      .map((capture) => ({
        viewport: capture.viewport,
        status: capture.status,
        title: capture.title,
        h1: capture.h1,
        mainTextLength: capture.mainTextLength,
        horizontalOverflow: capture.horizontalOverflow,
        consoleErrors: capture.consoleErrors.length,
        consoleWarnings: capture.consoleWarnings.length,
        uncaughtExceptions: capture.uncaught.length,
        failedRequests: capture.failedRequests.length,
        httpErrors: capture.httpErrors.length,
        screenshot: capture.screenshot.replaceAll('\\', '/'),
      })),
    note: classificationNote,
  });
}

if (routeRows.length !== 31 || report.results.length !== 62) {
  throw new Error(`Expected 31 routes and 62 captures; got ${routeRows.length} and ${report.results.length}`);
}

report.manualReview = {
  reviewedAt: '2026-11-07',
  classificationMeaning: 'PASS means both viewport captures returned HTTP 200, contained a visible H1 and at least 300 characters of main content, had no observed browser/network errors, and had no horizontal overflow. It is a route-shell/content classification, not a claim that every route control or all WCAG checks passed.',
  contentReview: 'Reviewed the captured title, H1, and up to the first 5,000 characters of main content for each route at both viewports. The extracted content showed no empty shell or obvious placeholder copy. This does not replace a full copy review of long pages, nor does the route sweep exhaustively validate resource-render state.',
  screenshotReview: 'Visually inspected the homepage, Explore, Compose, Workbench, mobile Blocks, and a representative resource-detail capture. The remaining route screenshots are retained for review; they were not all individually inspected at full visual detail in this continuation.',
  supplementalInteractionEvidence: [
    'The desktop and mobile flagship acceptance test passed against the public Site; both selected Direction C and exercised the mutation, undo/redo, Preview, manifest, and ZIP workflow.',
    'The desktop acceptance test independently installed and built the downloaded ZIP outside repository dependencies, then opened the exported application at 1440x900 and 390x844.',
    'The deployed Step 39 claims/control suite passed 48 browser cases across desktop and mobile. It covers the tested sample disclosures and controls, not every visible control on every route.',
  ],
  limitations: [
    'Axe was not rerun in this v87 continuation. Refer to the dated v81 route and flagship evidence for its route/mode scans and contrast limitations.',
    'This continuation does not close the remaining runtime ledger or complete Steps 39 and 45.',
  ],
};

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
const classificationReport = {
  site: report.site,
  siteVersion: report.version,
  canonicalCommit: report.canonicalCommit,
  sitesMirrorCommit: report.sitesMirrorCommit,
  capturedAt: report.generatedAt,
  viewports: ['1440x900', '390x844'],
  classificationMeaning: report.manualReview.classificationMeaning,
  counts: { PASS: routeRows.length },
  routes: routeRows,
};
await fs.writeFile(path.join(evidenceDir, 'route-classifications.json'), `${JSON.stringify(classificationReport, null, 2)}\n`);

const markdownRows = routeRows.map((row) => {
  const desktop = row.captures.find((capture) => capture.viewport.includes('1440'));
  const mobile = row.captures.find((capture) => capture.viewport.includes('390'));
  const headings = [desktop?.h1, mobile?.h1].filter(Boolean).join(' / ').replaceAll('|', '\\|');
  return `| \`${row.route}\` | PASS | ${desktop?.mainTextLength} / ${mobile?.mainTextLength} | ${headings} |`;
}).join('\n');
const markdown = `# Public Sites v87 route audit\n\n` +
  `Site: [Tessellate V1 Review](${report.site}/) <br>\n` +
  `Canonical source: \`${report.canonicalCommit}\`; Sites mirror: \`${report.sitesMirrorCommit}\`.\n\n` +
  `## Scope and result\n\n` +
  `The browser sweep captured all 31 requested public routes at 1440×900 and 390×844 (62 captures). All returned HTTP 200. There were zero navigation failures, console errors or warnings, uncaught exceptions, failed requests, HTTP errors, or horizontal-overflow captures. Each captured route had a visible H1 and at least 300 characters of main content.\n\n` +
  `PASS is limited to the visible route shell/content, runtime/network health, and horizontal overflow at those two widths. The content review examined the captured title, H1, and up to 5,000 characters of main content per capture. It does not assert that every button or secondary control on every page was activated. Six representative screenshots were visually inspected; the full 62-image set is retained under [screenshots](screenshots/).\n\n` +
  `| Route | Result | Main text characters (desktop / mobile) | Visible heading |\n|---|---:|---:|---|\n${markdownRows}\n\n` +
  `## Flagship and targeted interaction evidence\n\n` +
  `The exact employee-experience brief passed the public-UI acceptance journey at desktop and mobile. Direction C opened in Workbench. The dashboard KPI subtree stayed locked through Recompose, Replace, and Surprise Me; the replaced activity component became \`notification-centre\`; Undo/Redo restored the recorded manifests exactly. The independent React ZIP was clean-installed and built outside the repository, then browsed at 1440×900 and 390×844. The two viewport workflow records and exported ZIPs are beside this report.\n\n` +
  `The separate deployed Step 39 sample-claims/control suite passed 48 browser cases across desktop and mobile. It is targeted evidence, not a blanket statement that all route controls were tested.\n\n` +
  `## Limits\n\n` +
  `Axe was not rerun during this v87 continuation; see the v81 evidence linked from [Step 45 evidence](../../../../quality/STEP_45_EVIDENCE.md) for its scope and the incomplete contrast checks. The broader runtime ledger, Step 39 language review, and Step 45 release gate remain open.\n`;
await fs.writeFile(path.join(evidenceDir, 'ROUTE_AUDIT.md'), markdown);
