import { readFile, writeFile } from 'node:fs/promises';

const auditPath = 'audit/runtime-audit.json';
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
if (audit.entries.some((entry) => entry.id === 'AUD-370')) throw new Error('AUD-370 already exists.');

audit.entries.push({
  id: 'AUD-370',
  severity: 'medium',
  route: '/',
  viewport: '1440x900 and 390x844',
  category: 'accessibility',
  title: 'Homepage example groups did not expose their accessible names',
  expected: 'Preset buttons are exposed as a named group, and the ProjectManifest excerpt has a programmatically associated accessible name.',
  actual: 'The preset-label div and the pre element used aria-label without a naming-capable ARIA role. Axe marked aria-prohibited-attr incomplete on both, and role/name queries could not find either group on desktop or mobile.',
  reproduction: [
    'Run the pre-fix public v49 regression: `pnpm exec playwright test --config quality/evidence/step-45/public-v49/accessibility-regression-v49.config.mjs`.',
    'The preset group and manifest excerpt role/name checks fail at 1440x900 and 390x844 (4 failures); the mobile Explore aria-controls/dialog/Escape/focus test passes at both viewports (2 passes).',
    'Inspect the public v49 Axe report for `/` at desktop and mobile: aria-prohibited-attr is incomplete for `.pb-1` and `pre`.',
  ],
  console: [],
  network: [],
  screenshot: 'quality/evidence/step-45/public-v49/routes/home-desktop-1440x900.png',
  rootCause: 'Accessible names were assigned to generic HTML elements whose implicit roles do not support naming from author. Existing tests queried the raw labels, so they did not verify the accessibility tree.',
  affectedCode: [
    'apps/site/src/components/home/HeroComposer.tsx',
    'apps/site/src/components/home/AgentsSection.tsx',
    'tests/e2e/home-agent-example-regression.spec.ts',
    'tests/e2e/accessibility-semantic-labels-step45.spec.ts',
  ],
  remediation: 'Give the preset collection role="group" with its aria-label. Give the pre element role="group" and reference the visible “ProjectManifest excerpt” label with aria-labelledby. Add browser assertions for the accessible roles and names and keep the mobile filter dialog relationship behavior covered.',
  fixCommit: null,
  status: 'fixed-awaiting-deployed-verification',
  deployedVerification: null,
  localVerification: {
    checkedAt: new Date().toISOString(),
    build: 'pnpm --filter @tessellate/site build passed',
    tests: {
      command: 'pnpm exec playwright test tests/e2e/accessibility-semantic-labels-step45.spec.ts tests/e2e/home-agent-example-regression.spec.ts --workers=1',
      passed: 10,
      failed: 0,
      viewports: ['1440x900', '390x844'],
    },
    evidence: [
      'quality/evidence/step-45/public-v49/axe-core-routes/report.json',
      'quality/evidence/step-45/public-v49/semantic-accessibility/playwright-output/',
    ],
  },
});

await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ added: 'AUD-370', count: audit.entries.length, status: 'fixed-awaiting-deployed-verification' }, null, 2));
