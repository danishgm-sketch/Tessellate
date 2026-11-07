/* global process */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, '../../../..');
const deployment = {
  siteVersion: 74,
  siteVersionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_a853aa5b01908191b3321c1de656e6c6',
  canonicalSourceCommit: '75276e8078e908b8258fa3d2cba629d71b85cd60',
  siteSourceCommit: '601d4b4069fdcba6bd57a26e2b625dbd42467602',
  deploymentId: 'appgdep_6ae9e3cf216c8191b1f06c5096e01fdd',
  checkedAt: new Date().toISOString(),
};

const readJson = async (relativePath) => JSON.parse(await readFile(path.join(repository, relativePath), 'utf8'));
const auditPath = path.join(repository, 'audit/runtime-audit.json');
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const workbench = await readJson('audit/evidence/step-48/deployed-v74/workbench-reduced-motion-live.json');
const explore = await readJson('audit/evidence/step-48/deployed-v74/explore-recheck-live.json');
const network = await readJson('audit/evidence/step-48/deployed-v74/explore-network-summary.json');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const runtimeClean = (runtime) =>
  ['consoleErrors', 'consoleWarnings', 'uncaughtExceptions', 'failedRequests', 'httpErrors']
    .every((key) => Array.isArray(runtime[key]) && runtime[key].length === 0);

assert(workbench.deployment === 'v74' && workbench.sourceCommit === deployment.canonicalSourceCommit, 'Workbench evidence does not match v74 source.');
assert(workbench.reducedMotion === true, 'Reduced motion was not enabled in the deployed Workbench run.');
assert(workbench.desktop.renderedNodeCount === 6, 'Expected all six employee Workbench screen nodes to render.');
assert(workbench.desktop.renderedMotion.every((node) => node.transitionProperty === 'none' && node.animationName === 'none'), 'A Workbench node retained a transition or animation.');
assert(workbench.reducedMotionEvents.length === 0, 'A reduced-motion transition or animation event fired in Workbench.');
assert(workbench.mobile.viewportWidth === 390 && workbench.mobile.documentWidth === 390, 'Workbench mobile overflowed at 390px.');
assert(runtimeClean(workbench.runtime) && workbench.runtime.reducedMotionEvents.length === 0, 'The deployed Workbench run recorded browser or network errors.');

assert(explore.deployment === 'v74' && explore.sourceCommit === deployment.canonicalSourceCommit, 'Explore evidence does not match v74 source.');
assert(explore.results.length === 4, 'Expected four constrained public Explore repeats.');
for (const result of explore.results) {
  assert(result.firstPreviewReadyMs < 8000, `Explore repeat ${result.repeat} exceeded its 8s preview budget.`);
  assert(result.routeReadyMs < 10000, `Explore repeat ${result.repeat} exceeded its 10s catalogue-ready budget.`);
  assert(result.browserMetrics.documentWidth <= result.browserMetrics.viewportWidth, `Explore repeat ${result.repeat} overflowed horizontally.`);
  assert(result.browserMetrics.previewErrors.length === 0 && result.browserMetrics.visibleUnavailable.length === 0, `Explore repeat ${result.repeat} showed a failed preview.`);
  assert(runtimeClean(result.runtime), `Explore repeat ${result.repeat} recorded browser or essential network errors.`);
}
assert(network.deployment === 'v74' && network.captures.every((capture) => capture.failedCount === 0), 'Sanitized HAR summary contains a failed request.');

const byId = new Map(audit.entries.map((entry) => [entry.id, entry]));
const reducedMotion = byId.get('AUD-464');
const previewLatency = byId.get('AUD-465');
const canRecordDeployment = (entry) =>
  entry?.status === 'fixed-local-verified' ||
  (entry?.status === 'closed-deployed-verified' &&
    entry.deployedVerification?.siteVersionId === deployment.siteVersionId &&
    entry.deployedVerification?.canonicalSourceCommit === deployment.canonicalSourceCommit);
assert(canRecordDeployment(reducedMotion), 'AUD-464 is neither locally fixed nor already verified against this v74 source.');
assert(canRecordDeployment(previewLatency), 'AUD-465 is neither locally fixed nor already verified against this v74 source.');

reducedMotion.actual = 'Public v73 exposed transition-property all and a 1 microsecond transition under system reduced motion. On public v74, the exact employee flagship rendered all six project nodes with transitions and animations disabled at desktop and mobile; no transition/animation events fired, with zero runtime/network errors. The v74 trace recorded LCP 1,409ms at 1x CPU and 4,416ms at 4x CPU, and CLS 0.06 in both profiles.';
reducedMotion.status = 'closed-deployed-verified';
reducedMotion.afterScreenshot = 'audit/evidence/step-48/deployed-v74/workbench-mobile-390x844.png';
reducedMotion.deployedVerification = {
  ...deployment,
  route: workbench.route,
  case: 'Compose the exact employee brief, select Direction C, open Workbench with prefers-reduced-motion: reduce, inspect node styles and motion events at desktop/mobile, then compare the cold Chrome trace.',
  result: 'PASS: six Workbench screen nodes have transition:none and animation:none; no transitionrun, transitionstart or animationstart event fired; mobile width is 390px with no overflow; runtime and network errors are zero. Mobile Lighthouse Accessibility, Best Practices, SEO and Agentic Browsing each scored 100 (33 passed, 0 failed).',
  performance: {
    viewport: '412x823, DPR 1.75, prefers-reduced-motion: reduce, Fast 4G',
    cpu4x: { lcpMs: 4416, ttfbMs: 94, cls: 0.06 },
    cpu1x: { lcpMs: 1409, ttfbMs: 121, cls: 0.06 },
    renderBlockingEstimatedSavingsMs: { fcp: 0, lcp: 0 },
  },
  screenshots: [
    'audit/evidence/step-48/deployed-v74/workbench-desktop-1440x900.png',
    'audit/evidence/step-48/deployed-v74/workbench-mobile-390x844.png',
  ],
  report: 'audit/evidence/step-48/deployed-v74/workbench-reduced-motion-live.json',
};
reducedMotion.evidence.deployedVerificationPending = false;
reducedMotion.evidence.deployedV74 = reducedMotion.deployedVerification;

previewLatency.actual = `Local before-fix first-preview latency reached 9,250ms against the 8,000ms budget. Public v74 produced four fresh constrained runs with first-preview times ${explore.results.map((result) => result.firstPreviewReadyMs).join(', ')}ms and catalogue-ready times ${explore.results.map((result) => result.routeReadyMs).join(', ')}ms. All six filtered onboarding previews emitted READY in every run, with no visible unavailable state, PREVIEW_ERROR, console error, uncaught exception, failed request, HTTP error, or overflow. One earlier 15,582ms route-ready exploratory outlier did not recur in the four-run repeat.`;
previewLatency.status = 'closed-deployed-verified';
previewLatency.afterScreenshot = 'audit/evidence/step-48/deployed-v74/explore-recheck-1-1440x900.png';
previewLatency.deployedVerification = {
  ...deployment,
  route: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/explore',
  case: 'Open Explore, wait for 50/324 catalogue results, enter onboarding in Search catalogue, and time until the actual Onboarding Role Select iframe renders under the recorded constrained profile.',
  throttle: { latencyMs: 150, downloadBitsPerSecond: 1600000, uploadBitsPerSecond: 750000, cpuSlowdownFactor: 4 },
  firstPreviewReadyMs: explore.results.map((result) => result.firstPreviewReadyMs),
  catalogueReadyMs: explore.results.map((result) => result.routeReadyMs),
  result: 'PASS: all four first-preview measurements are below 8,000ms; six resource previews emitted READY each run; zero preview errors, visible unavailable states, console errors, uncaught exceptions, failed requests, HTTP errors or overflow. Intentional ERR_ABORTED module requests after filtering are separately recorded as browser cancellations.',
  networkSummary: 'audit/evidence/step-48/deployed-v74/explore-network-summary.json',
  report: 'audit/evidence/step-48/deployed-v74/explore-recheck-live.json',
  screenshots: explore.results.map((result) => `audit/evidence/step-48/deployed-v74/${result.screenshot}`),
};
previewLatency.evidence.deployedVerificationPending = false;
previewLatency.evidence.deployedV74 = previewLatency.deployedVerification;

if (!audit.scope.includes('Public Sites v74 issue-specific verification closed AUD-464 and AUD-465')) {
  audit.scope += ' Public Sites v74 issue-specific verification closed AUD-464 and AUD-465 from canonical commit 75276e8078e908b8258fa3d2cba629d71b85cd60; this does not repeat the full v71 route/flagship audit or close the broader hardening gate.';
}
audit.generatedAt = deployment.checkedAt;
audit.latestDeploymentEvidence = 'audit/evidence/step-48/deployed-v74/workbench-reduced-motion-live.json';
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ checkedAt: deployment.checkedAt, closed: ['AUD-464', 'AUD-465'], entries: audit.entries.length, latestDeploymentEvidence: audit.latestDeploymentEvidence }, null, 2)}\n`);
