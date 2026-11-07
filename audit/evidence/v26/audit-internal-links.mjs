/* global console */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import { request } from '@playwright/test';

const root = process.cwd();
const outputDirectory = path.resolve(root, 'audit/evidence/v26');
const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const routeAudit = JSON.parse(
  await readFile(path.join(outputDirectory, 'route-audit.json'), 'utf8'),
);

const targets = new Map();
for (const capture of routeAudit.routes) {
  for (const link of capture.page?.links ?? []) {
    let url;
    try {
      url = new URL(link.href, baseUrl);
    } catch {
      continue;
    }
    if (url.origin !== baseUrl) continue;
    url.hash = '';
    const key = url.toString();
    const source = `${capture.route} (${capture.viewport})`;
    const existing = targets.get(key) ?? { url: key, labels: [], sources: [] };
    if (link.text && !existing.labels.includes(link.text)) existing.labels.push(link.text);
    if (!existing.sources.includes(source)) existing.sources.push(source);
    targets.set(key, existing);
  }
}

const context = await request.newContext({ timeout: 20_000, maxRedirects: 5 });
const queue = [...targets.values()];
const results = [];
const workerCount = 8;
await Promise.all(
  Array.from({ length: workerCount }, async () => {
    while (queue.length) {
      const target = queue.shift();
      if (!target) return;
      try {
        const response = await context.get(target.url);
        results.push({ ...target, status: response.status(), finalUrl: response.url() });
      } catch (error) {
        results.push({ ...target, status: null, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }),
);
await context.dispose();
results.sort((left, right) => left.url.localeCompare(right.url));

const report = {
  site: baseUrl,
  version: 26,
  capturedAt: new Date().toISOString(),
  scope: 'Internal links discovered in the 31-route desktop/mobile route sweep. External links are not probed.',
  uniqueInternalTargets: results.length,
  failures: results.filter((item) => item.status === null || item.status >= 400),
  results,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, 'internal-link-audit.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
console.log(`Checked ${results.length} unique internal links; ${report.failures.length} failed.`);
