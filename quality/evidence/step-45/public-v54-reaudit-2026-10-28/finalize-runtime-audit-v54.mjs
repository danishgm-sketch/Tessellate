import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const versionId = 'appgprj_6acc036de8cc8191a823339566972d85~appgver_6d382d94d1508191af1aabf265d808c2';
const deploymentId = 'appgdep_6ae1d0ad04a48191953b0eb2703b59d1';
const canonicalSourceCommit = 'e3eff775b9db83fa240b937f3697d52cebcde8c6';
const siteSourceCommit = '9270888d16f69d765d7069b3aa9eb7e17af6892a';
const evidenceRoot = 'quality/evidence/step-45/public-v54-reaudit-2026-10-28';
const checkedAt = '2026-10-28T10:48:43.526Z';

const auditPath = path.resolve('audit/runtime-audit.json');
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
audit.scope = `Tessellate production review audit. Latest public checkpoint: Sites v54 at ${site}/ (version ${versionId}; deployment ${deploymentId}), serving canonical application commit ${canonicalSourceCommit} from Sites mirror commit ${siteSourceCommit}. The Site is public and has no D1/R2 bindings. Exact-head PR and push CI plus the Component Quality Gate passed. The 2026-10-28 v54 deployed re-audit passed 31 routes at desktop/mobile (62/62), eight showcase details at desktop/mobile (16/16), the 8-record public showcase index, Explore preview loading, WebKit CSP checks, responsive tests at eight widths, 12 Axe route scans and two generated-product Workbench scans. The exact employee-experience flagship passed desktop and mobile, including independent React ZIP install/build/browser smoke. Four findings (AUD-176, AUD-375, AUD-376, AUD-377) now have deployed verification. The system-wide ledger contains ${audit.entries.length} records: 0 critical, 69 high, 285 medium, 23 low. This is an evidence checkpoint; the broader Step 45 and product-hardening release programme remain incomplete. Laptop-host inference remains unavailable when its Docker runtime is not connected.`;

const common = {
  siteVersion: 54,
  siteVersionId: versionId,
  deploymentId,
  canonicalSourceCommit,
  siteSourceCommit,
  checkedAt,
  siteUrl: site,
};

const evidence = (resultId, route, viewport, screenshot, result, evidenceFile) => ({
  resultId,
  route: `${site}${route}`,
  viewport,
  screenshot: screenshot ? `${evidenceRoot}/${screenshot}` : null,
  result,
  evidenceFile: `${evidenceRoot}/${evidenceFile}`,
});

const replacements = {
  'AUD-176': {
    fixCommit: canonicalSourceCommit,
    status: 'closed-deployed-verified',
    deployedVerification: {
      ...common,
      evidence: [
        evidence('AUD-176', '/explore?q=onboarding', { width: 1440, height: 900 }, 'webkit/explore-onboarding-desktop-1440x900-v54.png', 'PASS: 0 CSP events, console errors, page errors, failed requests, or bad responses; six resource screens rendered.', 'webkit-explore-csp-v54.json'),
        evidence('AUD-176', '/explore?q=onboarding', { width: 390, height: 844 }, 'webkit/explore-onboarding-mobile-390x844-v54.png', 'PASS: 0 CSP events, console errors, page errors, failed requests, or bad responses; two resource screens rendered.', 'webkit-explore-csp-v54.json'),
      ],
    },
  },
  'AUD-375': {
    status: 'closed-deployed-verified',
    deployedVerification: {
      ...common,
      evidence: [
        evidence('AUD-375', '/showcase/showcase-playful-hr/', { width: 1440, height: 900 }, 'interactive/showcase-cta-after-desktop-1440x900.png', 'PASS: one hero H1 occurrence and a distinct, useful conversion CTA heading.', 'capture-issue-fixes-v54.mjs'),
        evidence('AUD-375', '/showcase/showcase-playful-hr/', { width: 390, height: 844 }, 'interactive/showcase-cta-after-mobile-390x844.png', 'PASS: one hero H1 occurrence and a distinct, useful conversion CTA heading.', 'capture-issue-fixes-v54.mjs'),
      ],
    },
  },
  'AUD-376': {
    status: 'closed-deployed-verified',
    deployedVerification: {
      ...common,
      evidence: [
        evidence('AUD-376', '/tools/section-planner/', { width: 1440, height: 900 }, 'interactive/section-planner-after-desktop-1440x900.png', 'PASS: the custom-title field has id=custom-section-title and name=customSectionTitle; adding the entered section updates the visible plan.', 'capture-issue-fixes-v54.mjs'),
        evidence('AUD-376', '/tools/section-planner/', { width: 390, height: 844 }, 'interactive/section-planner-after-mobile-390x844.png', 'PASS: the custom-title field has id=custom-section-title and name=customSectionTitle; adding the entered section updates the visible plan.', 'capture-issue-fixes-v54.mjs'),
      ],
    },
  },
  'AUD-377': {
    status: 'closed-deployed-verified',
    deployedVerification: {
      ...common,
      evidence: [
        evidence('AUD-377', '/showcase/', { width: 1440, height: 900 }, 'routes/_showcase-desktop-1440x900.png', 'PASS: the public showcase gallery index has eight unique records and every index field matches the canonical definitions; all eight manifests match screen counts.', 'public-index-verification-v54.json'),
        evidence('AUD-377', '/showcase/', { width: 390, height: 844 }, 'routes/_showcase-mobile-390x844.png', 'PASS: the mobile gallery and its public eight-record index agree with the canonical definitions.', 'public-index-verification-v54.json'),
      ],
    },
  },
};

for (const [id, replacement] of Object.entries(replacements)) {
  const entry = audit.entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Missing audit entry ${id}`);
  Object.assign(entry, replacement);
}

audit.generatedAt = checkedAt;
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ updated: Object.keys(replacements), generatedAt: audit.generatedAt }));
