import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ResourceManifest } from '@tessellate/schemas';
import { composeShowcase } from '../showcase-composition.js';

const catalogue: ResourceManifest[] = JSON.parse(readFileSync('apps/site/public/data/catalog.json', 'utf8')).resources;

describe('showcase composition stability', () => {
  it('keeps the same graph identity and example timestamps across identical builds', () => {
    const first = composeShowcase('showcase-playful-hr', catalogue);
    const second = composeShowcase('showcase-playful-hr', catalogue);

    expect(second.screenGraph.id).toBe(first.screenGraph.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).toBe(first.updatedAt);
    expect(second).toEqual(first);
  });
});
