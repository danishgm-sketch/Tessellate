import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'node:path';
import { loadJsonManifest } from '@tessellate/catalog';
import {
  createResourceSearchDb,
  indexResource,
  executeSearch,
  cosineSimilarity,
  LocalSemanticAdapter,
  type ResourceOramaDb,
} from '../index.js';

describe('Catalogue Browsing and Search', () => {
  let db: ResourceOramaDb;
  const rootResourcesDir = path.resolve(__dirname, '../../../../resources');
  const buttonDir = path.join(rootResourcesDir, 'primitives', 'button');
  const buttonManifest = loadJsonManifest(path.join(buttonDir, 'manifest.json'));

  beforeEach(async () => {
    db = await createResourceSearchDb();
    await indexResource(db, buttonManifest);
  });

  it('finds button by exact name keyword', async () => {
    const res = await executeSearch(db, 'button');
    expect(res.totalHits).toBe(1);
    expect(res.items[0]?.slug).toBe('button');
  });

  it('finds button by intent keyword', async () => {
    const res = await executeSearch(db, 'action trigger');
    expect(res.totalHits).toBe(1);
    expect(res.items[0]?.slug).toBe('button');
  });

  it('applies resourceType filter strictly', async () => {
    const primitiveResult = await executeSearch(db, 'button', {
      resourceTypes: ['primitive'],
    });
    expect(primitiveResult.totalHits).toBe(1);

    const sectionResult = await executeSearch(db, 'button', {
      resourceTypes: ['section'],
    });
    expect(sectionResult.totalHits).toBe(0);
  });

  it('filters by minimum quality score threshold', async () => {
    const passResult = await executeSearch(db, 'button', {
      minQuality: 90,
    });
    expect(passResult.totalHits).toBe(1);

    const failResult = await executeSearch(db, 'button', {
      minQuality: 99,
    });
    expect(failResult.totalHits).toBe(0);
  });

  it('groups search results by resource category / type', async () => {
    const res = await executeSearch(db, '');
    expect(res.groups.length).toBeGreaterThanOrEqual(1);
    expect(res.groups[0]?.groupName).toBe('primitive');
    expect(res.groups[0]?.items[0]?.slug).toBe('button');
  });

  it('cosineSimilarity accurately scores identical and orthogonal vectors', () => {
    const vecA = new Float32Array([1, 0, 0]);
    const vecB = new Float32Array([1, 0, 0]);
    const vecC = new Float32Array([0, 1, 0]);

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
  });

  it('semantic Lab stays unavailable until a real embedding model is installed', async () => {
    const adapter = new LocalSemanticAdapter();
    expect(adapter.isAvailable()).toBe(false);

    const loaded = await adapter.loadModel();
    expect(loaded).toBe(false);
    expect(adapter.isAvailable()).toBe(false);
    expect(adapter.getBackend()).toBe('none');
    await expect(adapter.embedText('employee onboarding')).resolves.toBeNull();
  });
});
