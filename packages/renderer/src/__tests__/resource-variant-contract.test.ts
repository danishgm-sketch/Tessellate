import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { discoverResources, loadJsonManifest } from '@tessellate/catalog';
import { RESOURCE_VARIANTS } from '../generated-resource-variants.js';

describe('generated runtime resource variants', () => {
  it('matches canonical variant IDs for every catalogued resource slug and ID', () => {
    const resourcesRoot = path.resolve(process.cwd(), 'resources');
    const resources = discoverResources(resourcesRoot);

    expect(resources).toHaveLength(324);
    for (const resource of resources) {
      const manifest = loadJsonManifest(resource.manifestPath);
      const variantIds = manifest.variants.map((variant) => variant.id);

      expect(RESOURCE_VARIANTS[manifest.slug], `${manifest.slug} variant IDs`).toEqual(variantIds);
      expect(RESOURCE_VARIANTS[manifest.id], `${manifest.id} variant IDs`).toEqual(variantIds);
    }
  });
});
