import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ManifestRenderer } from '@tessellate/renderer';
import { composeProjectPipeline } from '../compose-pipeline.js';
import { loadTestCatalog } from './test-catalog-loader.js';

describe('Requirement 5: Real Direction Previews Fidelity', () => {
  const catalog = loadTestCatalog();

  it('renders actual resources in all three direction previews without unresolved placeholders', () => {
    const result = composeProjectPipeline(
      {
        description: 'Collaborative product analytics platform with funnel analysis, user cohorts, and team workspaces.',
        feel: 'deliberate, analytical and modern',
        visualAmbition: 65,
        structuralCreativity: 55,
      },
      {
        catalogResources: catalog,
        seed: 'preview-fidelity-test',
      }
    );

    const { directionA, directionB, directionC } = result;

    // Render Direction A
    const htmlA = renderToString(
      <ManifestRenderer
        manifest={directionA.manifest}
        activeScreenId={directionA.manifest.screens[0]?.id}
      />
    );
    expect(htmlA).not.toContain('missing-resource-recovery');
    expect(htmlA).not.toContain('Unresolved resource');
    expect(htmlA.length).toBeGreaterThan(200);

    // Render Direction B
    const htmlB = renderToString(
      <ManifestRenderer
        manifest={directionB.manifest}
        activeScreenId={directionB.manifest.screens[0]?.id}
      />
    );
    expect(htmlB).not.toContain('missing-resource-recovery');
    expect(htmlB).not.toContain('Unresolved resource');
    expect(htmlB.length).toBeGreaterThan(200);

    // Render Direction C
    const htmlC = renderToString(
      <ManifestRenderer
        manifest={directionC.manifest}
        activeScreenId={directionC.manifest.screens[0]?.id}
      />
    );
    expect(htmlC).not.toContain('missing-resource-recovery');
    expect(htmlC).not.toContain('Unresolved resource');
    expect(htmlC.length).toBeGreaterThan(200);

    // Directions A, B, and C must differ materially in DesignDNA, structure, or resources
    const _slugsA = directionA.manifest.screens.flatMap((s) =>
      s.rootNode.children.map((c) => c.resourceRef?.slug).filter(Boolean)
    );
    const _slugsB = directionB.manifest.screens.flatMap((s) =>
      s.rootNode.children.map((c) => c.resourceRef?.slug).filter(Boolean)
    );
    const _slugsC = directionC.manifest.screens.flatMap((s) =>
      s.rootNode.children.map((c) => c.resourceRef?.slug).filter(Boolean)
    );

    // Assert that the three directions are distinct
    expect(directionA.direction.name).not.toBe(directionB.direction.name);
    expect(directionB.direction.name).not.toBe(directionC.direction.name);
    expect(directionA.manifest.designDNA).not.toEqual(directionB.manifest.designDNA);
    expect(directionB.manifest.designDNA).not.toEqual(directionC.manifest.designDNA);

    // HTML representations must differ
    expect(htmlA).not.toEqual(htmlB);
    expect(htmlB).not.toEqual(htmlC);
  });
});
