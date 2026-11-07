import { readFileSync, writeFileSync } from 'node:fs';

const path = 'audit/runtime-audit.json';
const audit = JSON.parse(readFileSync(path, 'utf8'));
if (audit.entries.some((entry) => entry.id === 'AUD-511')) {
  throw new Error('AUD-511 is already present; refusing to duplicate it.');
}

audit.entries.push({
  id: 'AUD-511',
  severity: 'medium',
  route: '/compose',
  viewport: '1440x900 and 390x844',
  category: 'content',
  title: 'Renderer loading statuses expose internal resource slugs',
  expected: 'While a resource is loading, preview feedback should stay accessible without exposing implementation slugs to product users.',
  actual: 'The first paint of Direction A displayed statuses such as “Loading collapsible-sidebar…” and “Loading dashboard-kpi-grid…” in both viewports. The five resource modules resolved in about 319–329 ms in the recorded run and the real preview then rendered.',
  reproduction: [
    'Open /compose at 1440x900 or 390x844 and wait for Catalogue ready.',
    'Enter the flagship employee-experience brief and compose with Feel professional but playful, Refined ambition, and Radical structural creativity.',
    'Capture Direction A immediately after the card appears, before its lazy resource modules resolve.',
  ],
  console: [],
  network: [],
  screenshot: 'quality/evidence/step-45/public-v81-followup-2026-11-06/directions-settled/direction-01-desktop-chrome-initial.png',
  rootCause: 'The shared renderer used resource manifest slugs in both its React Suspense fallback and its offscreen deferred-resource status.',
  affectedCode: [
    'packages/renderer/src/node-renderer-core.tsx',
    'packages/renderer/src/__tests__/renderer.test.tsx',
  ],
  fixCommit: null,
  status: 'fixed-local-verified',
  localVerification: {
    regressionTest: 'packages/renderer/src/__tests__/renderer.test.tsx — keeps lazy-load feedback accessible without showing internal resource slugs',
    red: 'Failed before the fix: the server-rendered status contained “Loading collapsible-sidebar…” and no neutral loading message.',
    green: 'Passed after the fix: the status remains role=status, uses “Loading interface element…”, and contains no resource slug.',
    focusedCommand: 'pnpm exec vitest run packages/renderer/src/__tests__/renderer.test.tsx -t "keeps lazy-load feedback"',
    fullQualitySuite: 'Pending',
    deploymentVerification: 'Pending public review Site deployment; v81 still contains the original loading copy.',
  },
  deployedVerification: null,
});

audit.scope += ' Public v81 full route/flagship/tool re-audit completed 2026-11-06. AUD-511 was found in the first-paint Direction A preview and is fixed locally pending full quality gates and deployed verification.';
audit.generatedAt = new Date().toISOString();
writeFileSync(path, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ id: 'AUD-511', totalFindings: audit.entries.length, scopeUpdated: true }));
