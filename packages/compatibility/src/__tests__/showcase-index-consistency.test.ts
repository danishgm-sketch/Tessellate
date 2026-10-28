import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHOWCASE_PROJECTS } from '@tessellate/composer';
import { composeShowcase } from '../showcase-composition.js';

const catalogue = JSON.parse(readFileSync('apps/site/public/data/catalog.json', 'utf8')).resources;

function expectedIndex() {
  return SHOWCASE_PROJECTS.map(
    ({ id, name, tagline, archetypeId, navigationModel, dnaPresetName, colorMode }) => ({
      id,
      name,
      tagline,
      archetypeId,
      navigationModel,
      dnaPresetName,
      colorMode,
      screenCount: composeShowcase(id, catalogue).screens.length,
    })
  );
}

describe('public showcase indexes', () => {
  it('matches canonical showcase definitions and composed screen counts in both site and preview assets', () => {
    const expected = expectedIndex();
    const siteIndex = JSON.parse(
      readFileSync('apps/site/public/data/showcases/index.json', 'utf8')
    );
    const previewIndex = JSON.parse(
      readFileSync('apps/preview/public/data/showcases/index.json', 'utf8')
    );

    expect(siteIndex).toEqual(expected);
    expect(previewIndex).toEqual(expected);

    for (const { id } of SHOWCASE_PROJECTS) {
      const manifest = composeShowcase(id, catalogue);
      const siteManifest = JSON.parse(
        readFileSync(`apps/site/public/data/showcases/${id}.json`, 'utf8')
      );
      const previewManifest = JSON.parse(
        readFileSync(`apps/preview/public/data/showcases/${id}.json`, 'utf8')
      );

      expect(siteManifest, `site manifest for ${id}`).toEqual(manifest);
      expect(previewManifest, `preview manifest for ${id}`).toEqual(manifest);
    }
  });
});
