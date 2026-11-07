import { beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';
import {
  createResourceSearchDb,
  executeSearch,
  indexResources,
  type ResourceOramaDb,
} from '../index.js';

describe('search over the canonical catalogue', () => {
  let db: ResourceOramaDb;
  let manifests: ResourceManifest[];

  beforeAll(async () => {
    const catalogPath = path.resolve(__dirname, '../../../../apps/site/public/data/catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as { resources: unknown };
    manifests = ResourceManifestSchema.array().parse(catalog.resources);
    db = await createResourceSearchDb();
    await indexResources(db, manifests);
  });

  it('indexes resource content requirements for payment and checkout searches', async () => {
    const payment = await executeSearch(db, 'payment');
    const checkout = await executeSearch(db, 'checkout');

    expect(payment.items.map((item) => item.slug)).toContain('billing-overview');
    expect(checkout.items.map((item) => item.slug)).toContain('funnel-chart');
  });

  it('does not return results that match only one term of a two-term query', async () => {
    const results = await executeSearch(db, 'luxury checkout');

    expect(results.items).toHaveLength(0);
    expect(results.totalHits).toBe(0);
  });

  it('applies the density facet before returning dashboard matches', async () => {
    const allMatches = await executeSearch(db, 'dashboard');
    const denseMatches = await executeSearch(db, 'dashboard', { density: ['Dense'] });

    expect(allMatches.totalHits).toBeGreaterThan(denseMatches.totalHits);
    expect(denseMatches.items.length).toBeLessThan(allMatches.items.length);
  });

  it('applies dependency facets against actual resource dependencies', async () => {
    const noDependencies = await executeSearch(db, '', { dependencies: ['Zero extra dependency'] });
    const radix = await executeSearch(db, '', { dependencies: ['Radix'] });

    expect(noDependencies.totalHits).toBe(manifests.length);
    expect(radix.totalHits).toBe(0);
  });

  it('applies every visible facet and combines selected facets with AND semantics', async () => {
    const all = await executeSearch(db, '', undefined, manifests.length);
    const facetCases = [
      { key: 'resourceTypes', value: 'primitive', field: 'resourceType' },
      { key: 'purposes', value: 'Marketing', field: 'purposes' },
      { key: 'feel', value: 'editorial', field: 'feel' },
      { key: 'intensity', value: 'Expressive', field: 'intensity' },
      { key: 'motion', value: 'Light', field: 'motion' },
      { key: 'density', value: 'Dense', field: 'density' },
      { key: 'performance', value: 'Lightweight', field: 'performance' },
      { key: 'accessibility', value: 'AA target or higher', field: 'accessibility' },
      { key: 'dependencies', value: 'Zero extra dependency', field: 'dependencies' },
      { key: 'license', value: 'MIT', field: 'license' },
    ] as const;

    for (const { key, value, field } of facetCases) {
      const filtered = await executeSearch(db, '', { [key]: [value] }, manifests.length);
      expect(filtered.totalHits, `${key}=${value} should return matching resources`).toBeGreaterThan(0);
      for (const item of filtered.items) {
        const actual = item.document[field] as string | string[];
        expect(Array.isArray(actual) ? actual : [actual]).toContain(value);
      }
    }

    const combined = await executeSearch(db, 'dashboard', {
      density: ['Dense'],
      performance: ['Lightweight'],
    });
    expect(combined.totalHits).toBeGreaterThan(0);
    expect(combined.totalHits).toBeLessThan(all.totalHits);
    expect(combined.items.every((item) => item.document.density.includes('Dense'))).toBe(true);
    expect(combined.items.every((item) => item.document.performance.includes('Lightweight'))).toBe(true);
  });

  it('applies performance facets against declared resource costs', async () => {
    const lightweight = await executeSearch(db, '', { performance: ['Lightweight'] });
    const heavy = await executeSearch(db, '', { performance: ['Heavy'] });

    expect(lightweight.totalHits).toBe(manifests.length);
    expect(heavy.totalHits).toBe(0);
  });
});
