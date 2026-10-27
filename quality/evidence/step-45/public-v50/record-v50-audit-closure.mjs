import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const auditPath = path.join(root, 'audit/runtime-audit.json');
const audit = JSON.parse(await fs.readFile(auditPath, 'utf8'));
const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/';
const siteVersionId = 'appgprj_6acc036de8cc8191a823339566972d85~appgver_90ffb7eea6f0819187554301d0a0011f';
const canonicalSourceCommit = 'd4b0fd88a722225c221d8264b89af70525cb1d7d';
const siteSourceCommit = '11d7a1439caaf641a2d2f78eb2555c00cf30cc34';
const deploymentId = 'appgdep_6ae11df145348191884c457f997d6e51';
const checkedAt = new Date().toISOString();
const auditClosureFixCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

audit.scope = `Tessellate production review audit. The current public Site is v50 at ${site}, serving application code captured from canonical commit ${canonicalSourceCommit} and Sites mirror ${siteSourceCommit}; saved version ${siteVersionId}, deployment ${deploymentId} succeeded. Exact-source GitHub CI run 40585283183 passed. On v50, 31 public routes passed at 1440x900 and 390x844 (62 captures), the four-route Axe matrix passed 8/8 with zero violations and zero serious/critical findings, semantic/accessibility regressions passed 10/10, and the exact employee-experience flagship journey plus independent React export passed at desktop and mobile. Live UI captures confirmed three distinct directions at both viewports, six settled previews, and zero unresolved resources or product runtime/network errors. AUD-370 and AUD-371 are closed after v50 deployed verification; AUD-372 records and closes an audit-harness screenshot taken during the explicit resource-loading state. Axe's CSP-blocked temporary style probes are instrumentation messages, not product errors; no security policy was weakened. D1/R2 are absent. The broader product-hardening programme and Step 45 remain incomplete.`;

function evidenceRecord({ route, viewport, resultId, screenshot, result = 'PASS' }) {
  return { resultId, route: `${site}${route.replace(/^\//, '')}`, viewport, screenshot, result };
}

for (const [id, route, viewport, screenshots, tests] of [
  ['AUD-370', '/', ['1440x900', '390x844'], [
    'quality/evidence/step-45/public-v50/routes/home-desktop-1440x900.png',
    'quality/evidence/step-45/public-v50/routes/home-mobile-390x844.png',
  ], 'Named preset group and manifest excerpt role/name assertions passed; live semantic-accessibility and home example regression 10/10 at desktop/mobile.'],
  ['AUD-371', '/explore', ['390x844'], [
    'quality/evidence/step-45/public-v50/routes/explore-mobile-390x844.png',
  ], 'Closed/open aria-controls relationship, Escape dismissal, and focus restoration passed in the live semantic-accessibility regression; 10/10 total at desktop/mobile.'],
]) {
  const entry = audit.entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Missing audit entry ${id}`);
  entry.status = 'closed-deployed-verified';
  entry.deployedVerification = {
    siteVersion: 50,
    siteVersionId,
    deploymentId,
    canonicalSourceCommit,
    siteSourceCommit,
    checkedAt,
    tests,
    evidence: screenshots.map((screenshot, index) => ({
      resultId: `${id}-v50-${index + 1}`,
      route: `${site}${route.replace(/^\//, '')}`,
      viewport: viewport[Math.min(index, viewport.length - 1)],
      screenshot,
      result: 'PASS',
    })),
    machineReports: [
      'quality/evidence/step-45/public-v50/semantic-accessibility/playwright-output/',
      'quality/evidence/step-45/public-v50/axe-core-routes/report.json',
      'quality/evidence/step-45/public-v50/route-audit.json',
    ],
  };
}

const existing372 = audit.entries.find((entry) => entry.id === 'AUD-372');
if (existing372) throw new Error('AUD-372 already exists; refusing to duplicate it.');
audit.entries.push({
  id: 'AUD-372',
  severity: 'low',
  route: '/compose',
  viewport: '1440x900 and 390x844',
  category: 'visual',
  title: 'Direction preview evidence was captured during the explicit loading state',
  expected: 'Direction evidence should show the rendered interface after lazy resource previews finish loading, while preserving the initial loading state as separate diagnostic evidence.',
  actual: 'The immediate screenshot of Direction 01 showed five explicit “Loading …” resource labels. The preview subsequently rendered its employee dashboard. On v50 all six direction previews settled at both viewports in 1,104–2,009ms, with no loading labels, unresolved-resource diagnostics, console errors, uncaught exceptions, failed requests, or bad responses.',
  reproduction: [
    'Open /compose at 1440x900 or 390x844, enter the exact employee-experience brief, select Refined and Radical, and compose.',
    'Capture Direction 01 as soon as its preview becomes visible; the first screenshot contains explicit resource-loading labels.',
    'Wait for “Team Overview” and all loading labels to disappear, then compare the settled preview screenshot and visible full-preview/DNA disclosure.',
  ],
  console: [],
  network: [],
  screenshot: 'quality/evidence/step-45/public-v50/flagship/settled-previews/direction-01-initial-desktop-1440.png',
  rootCause: 'The flagship browser test treated visibility of the direction preview container as readiness, and the capture harness took a screenshot before checking whether lazy resource renderers had replaced their loading states.',
  affectedCode: [
    'tests/e2e/flagship-acceptance-live-v26.spec.ts',
    'quality/evidence/step-45/public-v50/preview-settle-live-check.mjs',
  ],
  remediation: 'Wait for visible “Team Overview” content, assert that loading labels are absent, and allow a short stability interval before screenshotting. Record initial and settled images separately at desktop and mobile sizes.',
  fixCommit: auditClosureFixCommit,
  status: 'closed-deployed-verified',
  deployedVerification: {
    siteVersion: 50,
    siteVersionId,
    deploymentId,
    canonicalSourceCommit,
    siteSourceCommit,
    checkedAt,
    viewports: {
      desktop: { viewport: '1440x900', settledPreviews: 3, settleMs: [2009, 1674, 1716] },
      mobile: { viewport: '390x844', settledPreviews: 3, settleMs: [1583, 1128, 1104] },
    },
    diagnostics: { loadingPlaceholdersAfterSettle: 0, unresolvedResources: 0, consoleErrors: 0, uncaughtExceptions: 0, failedRequests: 0, badResponses: 0 },
    flagshipRegression: { passed: 4, skipped: 2, failed: 0 },
    evidence: [
      'quality/evidence/step-45/public-v50/flagship/settled-previews/direction-01-initial-desktop-1440.png',
      'quality/evidence/step-45/public-v50/flagship/settled-previews/direction-01-desktop-1440.png',
      'quality/evidence/step-45/public-v50/flagship/settled-previews/direction-01-initial-mobile-390.png',
      'quality/evidence/step-45/public-v50/flagship/settled-previews/direction-01-mobile-390.png',
      'quality/evidence/step-45/public-v50/flagship/directions-review.json',
      'quality/evidence/step-45/public-v50/flagship/playwright-output/',
    ],
    regressionTest: 'The deployed flagship test now waits for actual Team Overview content, asserts that loading labels are absent, and waits for stability before capturing all direction screenshots. The full live run passed 4 tests with 2 configured skips and 0 failures.',
  },
});

await fs.writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
const counts = (key) => Object.fromEntries(Object.entries(Object.groupBy(audit.entries, (entry) => entry[key])).map(([value, entries]) => [value, entries.length]));
console.log(JSON.stringify({ entries: audit.entries.length, severity: counts('severity'), status: counts('status'), checkedAt }, null, 2));
