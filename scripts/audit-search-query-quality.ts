import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ResourceManifestSchema } from '../packages/schemas/src/index.ts';
import { createResourceSearchDb, executeSearch, indexResources } from '../packages/search/src/index.ts';

const adjudicatedQueries = [
  'pricing',
  'sidebar',
  'dashboard',
  'command palette',
  'data table',
  'empty state',
  'onboarding',
  'AI answer',
  'checkout',
  'payment',
  'settings',
  'navigation',
  'hero',
  'luxury checkout',
];
const suggestedQueries = [
  'Bloomberg-style analytics',
  'cinematic product hero',
  'AI research sidebar',
  'mobile navigation',
  'onboarding',
  'billing overview',
  'data table',
  'empty state',
];
const queries = [...new Set([...adjudicatedQueries, ...suggestedQueries])];

const catalogPath = path.resolve('apps/site/public/data/catalog.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8')) as { resources: unknown };
const manifests = ResourceManifestSchema.array().parse(catalog.resources);
const db = await createResourceSearchDb();
await indexResources(db, manifests);

const results = [];
for (const query of queries) {
  const response = await executeSearch(db, query, undefined, 50);
  results.push({
    query,
    suggested: suggestedQueries.includes(query),
    totalHits: response.totalHits,
    leadingResults: response.items.slice(0, 10).map(({ slug, document, score }) => ({ slug, name: document.name, score })),
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  source: catalogPath,
  catalogueResourceCount: manifests.length,
  method: 'executeSearch over canonical ResourceManifest-derived Orama index; 50-result page size',
  results,
};
const outputPath = path.resolve('quality/STEP_08_SEARCH_RESULTS.json');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${outputPath}\n`);
