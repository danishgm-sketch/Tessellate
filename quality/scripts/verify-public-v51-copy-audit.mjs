import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const auditId = process.env.PUBLIC_COPY_AUDIT_ID ?? 'v51-copy-2026-10-28';
if (!/^v\d+-copy-\d{4}-\d{2}-\d{2}$/.test(auditId)) {
  throw new Error('PUBLIC_COPY_AUDIT_ID must use the format v<number>-copy-YYYY-MM-DD.');
}
const version = auditId.split('-')[0];
const evidenceRoot = `quality/evidence/step-39/public-${auditId}`;
const runnerRoot = path.join(repositoryRoot, evidenceRoot, 'runner');
const publicUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const sourceSpecs = [
  {
    source: 'tests/e2e/copy-quality-step-39.spec.ts',
    runner: `copy-quality.public-${version}.spec.ts`,
    replacements: [['quality/evidence/step-39', evidenceRoot]],
  },
  {
    source: 'tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    runner: `resource-copy.public-${version}.spec.ts`,
    replacements: [['quality/evidence/step-39', evidenceRoot]],
  },
  {
    source: 'tests/e2e/gold-resource-state-certification.spec.ts',
    runner: `gold-resource-state.public-${version}.spec.ts`,
    replacements: [['audit/evidence/step-06', `${evidenceRoot}/resource-states`]],
  },
  {
    source: 'tests/e2e/preview-form-interactions.spec.ts',
    runner: `preview-form-interactions.public-${version}.spec.ts`,
    replacements: [
      ['audit/evidence/step-06', `${evidenceRoot}/form-interactions`],
      ['quality/evidence/step-14/manual-review/after', `${evidenceRoot}/filter-builder`],
      ['quality/evidence/step-38', `${evidenceRoot}/reduced-motion`],
    ],
  },
  {
    source: 'tests/e2e/composition-quality-smoke.spec.ts',
    runner: `composition-quality.public-${version}.spec.ts`,
    replacements: [
      ['quality/evidence/composition-quality', `${evidenceRoot}/composition-quality`],
      ['quality/evidence/step-14/manual-review/after', `${evidenceRoot}/composition-after`],
    ],
  },
];

await mkdir(runnerRoot, { recursive: true });
await mkdir(path.join(repositoryRoot, evidenceRoot, 'resource-states/results'), { recursive: true });
for (const { source, runner, replacements } of sourceSpecs) {
  let contents = await readFile(path.join(repositoryRoot, source), 'utf8');
  for (const [from, to] of replacements) contents = contents.replaceAll(from, to);
  await writeFile(path.join(runnerRoot, runner), contents, 'utf8');
}

const config = `
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const root = ${JSON.stringify(runnerRoot)};
export default defineConfig({
  testDir: root,
  testMatch: [${JSON.stringify(`*.public-${version}.spec.ts`)}],
  outputDir: path.join(root, 'test-results'),
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: path.join(root, 'report.json') }]],
  use: {
    baseURL: ${JSON.stringify(publicUrl)},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'sites-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'sites-mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
`;
await writeFile(path.join(runnerRoot, 'playwright.config.mjs'), config, 'utf8');
