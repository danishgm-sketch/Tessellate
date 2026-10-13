import { readFile, writeFile } from 'node:fs/promises';

const path = 'audit/runtime-audit.json';
const audit = JSON.parse(await readFile(path, 'utf8'));
const id = 'AUD-130';
if (!audit.issues.some((issue) => issue.id === id)) {
  audit.issues.push({
    id,
    severity: 'high',
    route: '/compose',
    viewport: '1440x900',
    category: 'accessibility',
    title: 'The disabled Compose action becomes hard to read while catalogue intelligence loads',
    expected: 'The primary Compose action remains legible while disabled, with at least 4.5:1 text contrast in light and dark presentation modes.',
    actual: 'On deployed version 6 the disabled button renders white text over a 50%-opacity cobalt fill. The user-visible contrast calculation is 2.4:1; the instrumented route scan also reported a serious color-contrast violation at 2.39:1.',
    reproduction: [
      'Open /compose at 1440x900 and let the catalogue remain in its initial loading state, or block /data/catalog.json and wait for Catalogue unavailable.',
      'Scroll the disabled Compose Interface System button into view.',
      'Measure the composed foreground/background contrast or run the Compose contrast regression test; version 6 reports 2.4:1 and fails the 4.5:1 threshold.'
    ],
    console: [],
    network: [],
    httpStatus: [200],
    screenshot: 'audit/evidence/deployed-version-6/compose-contrast/disabled-submit-1440.png',
    evidence: 'audit/evidence/deployed-version-6/compose-contrast/result.json',
    rootCause: 'ComposeView uses disabled:opacity-50 on a cobalt background while retaining white button text, reducing the visible fill contrast during catalogue loading and error states.',
    affectedCode: ['apps/site/src/components/ComposeView.tsx'],
    remediation: 'Keep the native catalogue-ready disabled gate and use an opaque neutral disabled fill with a readable foreground in both themes.',
    fixCommit: null,
    status: 'open'
  });
}
audit.sourceCommit = 'a34e0581e3d10df47e6b0205cfa08f32f794db64';
audit.deployedVersion = 6;
audit.phase = 'version 6 deployed audit; Compose contrast remediation pending';
await writeFile(path, JSON.stringify(audit, null, 2) + String.fromCharCode(10));
