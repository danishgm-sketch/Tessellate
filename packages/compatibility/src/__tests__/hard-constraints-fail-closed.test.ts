import { describe, it, expect } from 'vitest';
import type { ResourceManifest } from '@tessellate/schemas';
import { composeProjectPipeline } from '../compose-pipeline.js';

describe('Requirement 3: Hard Constraints Fail Closed', () => {
  // A test catalog containing ONLY AA resources with rich performance
  const onlyAaRichCatalog: ResourceManifest[] = [
    {
      schemaVersion: '1.0.0',
      id: 'res_sample_hero',
      slug: 'sample-hero',
      name: 'Sample Heavy Hero',
      version: '1.0.0',
      status: 'verified',
      description: 'A heavy hero section with AA accessibility only.',
      resourceType: 'section',
      categories: ['marketing', 'sections'],
      roles: ['hero', 'editorial-hero'],
      purposes: ['landing-hero'],
      framework: 'react',
      language: 'typescript',
      styling: 'tailwind',
      dependencies: [],
      files: [{ path: 'index.tsx', kind: 'component', required: true }],
      variants: [{ id: 'default', name: 'default', description: 'Default' }],
      slots: [],
      relationships: [],
      tags: ['hero'],
      intent: {
        summary: 'Hero section',
        idealFor: ['marketing'],
        avoidFor: ['dashboards'],
        jobs: ['Introduce product'],
      },
      visualDNA: {
        visualAmbition: 80,
        structuralCreativity: 60,
      },
      interactionDNA: {},
      layoutDNA: {},
      responsive: {
        verifiedWidths: [360, 768, 1440],
        defaultStrategy: 'compress',
      },
      accessibility: {
        levelTarget: 'AA', // Only AA!
        keyboardVerified: true,
        screenReaderSemantics: true,
        reducedMotionVerified: true,
        contrastTokenCompatible: true,
        focusVisible: true,
      },
      performance: {
        jsCost: 'heavy',
        gpuCost: 'high',
        mediaCost: 'heavy',
        runtimeComplexity: 'high',
        lazyRecommended: true,
        continuousAnimation: true,
      },
      quality: {
        overall: 90,
      },
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ] as unknown as ResourceManifest[];

  it('fails closed when all candidates violate accessibilityFloor: AAA', () => {
    const result = composeProjectPipeline(
      {
        description: 'Fintech compliance interface requiring maximum AAA accessibility standards.',
        accessibilityFloor: 'AAA',
      },
      {
        catalogResources: onlyAaRichCatalog,
        seed: 'strict-aaa-test',
      }
    );

    // Assert that NO screen node selected the violating AA resource
    for (const screen of result.directionA.manifest.screens) {
      for (const node of screen.rootNode.children) {
        if (node.resourceRef) {
          expect(node.resourceRef.slug).not.toBe('sample-hero');
          expect(node.resourceRef.id).not.toBe('res_sample_hero');
        }
      }
    }
  });

  it('fails closed when all candidates violate performanceCeiling: lightweight', () => {
    const result = composeProjectPipeline(
      {
        description: 'Ultra-lightweight low-bandwidth field telemetry tool.',
        performanceCeiling: 'lightweight',
      },
      {
        catalogResources: onlyAaRichCatalog,
        seed: 'strict-perf-test',
      }
    );

    // Assert that NO screen node selected the heavy violating resource
    for (const screen of result.directionA.manifest.screens) {
      for (const node of screen.rootNode.children) {
        if (node.resourceRef) {
          expect(node.resourceRef.slug).not.toBe('sample-hero');
          expect(node.resourceRef.id).not.toBe('res_sample_hero');
        }
      }
    }
  });

  it('successfully selects candidate when hard constraints pass', () => {
    const compliantCatalog: ResourceManifest[] = [
      {
        ...onlyAaRichCatalog[0]!,
        id: 'res_sample_accessible',
        slug: 'accessible-hero',
        accessibility: {
          levelTarget: 'AAA', // Compliant!
          keyboardVerified: true,
          screenReaderSemantics: true,
          reducedMotionVerified: true,
          contrastTokenCompatible: true,
          focusVisible: true,
        },
        performance: {
          jsCost: 'tiny',
          gpuCost: 'none',
          mediaCost: 'none',
          runtimeComplexity: 'low',
          lazyRecommended: false,
          continuousAnimation: false,
        },
      },
    ];

    const result = composeProjectPipeline(
      {
        description: 'Government accessibility portal requiring AAA accessibility standard.',
        accessibilityFloor: 'AAA',
        performanceCeiling: 'lightweight',
      },
      {
        catalogResources: compliantCatalog,
        seed: 'compliant-test',
      }
    );

    // Assert the compliant resource WAS selected
    const allRefs = result.directionA.manifest.screens.flatMap((s) =>
      s.rootNode.children.map((c) => c.resourceRef?.slug)
    );
    expect(allRefs).toContain('accessible-hero');
  });
});
