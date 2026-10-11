import { describe, it, expect } from 'vitest';
import { composeProjectPipeline } from '../compose-pipeline.js';
import { loadTestCatalog } from './test-catalog-loader.js';
import { DEFAULT_RESOURCE_RENDERERS } from '@tessellate/renderer';
import { GENERATED_GOLD_SOURCES } from '@tessellate/exporter';
import { isGoldResource } from '@tessellate/catalog/gold';
import type { ProjectNode } from '@tessellate/schemas';

const SUPPORTED_ARCHETYPES = [
  'saas',
  'ai',
  'developer-tools',
  'fintech',
  'ecommerce',
  'marketplace',
  'analytics',
  'intelligence-research',
  'crm',
  'erp-operations',
  'productivity',
  'education',
  'creator',
  'media',
  'travel',
  'real-estate',
  'recruitment',
  'consumer',
];

describe('Composer Runtime/Export Capability Invariant', () => {
  const catalog = loadTestCatalog();
  const catalogSlugs = new Set(catalog.map((r) => r.slug));

  it('loaded a valid catalogue with Gold resources', () => {
    expect(catalog.length).toBeGreaterThan(0);
  });

  for (const archetype of SUPPORTED_ARCHETYPES) {
    it(`enforces capabilities invariant for archetype "${archetype}" across all 3 directions`, () => {
      const result = composeProjectPipeline(
        {
          description: `Build a modern, scalable ${archetype} product for teams and professionals.`,
          archetypeOverride: archetype,
        },
        {
          catalogResources: catalog,
          seed: `seed-${archetype}`,
        }
      );

      const directions = [
        { label: 'Direction A', data: result.directionA },
        { label: 'Direction B', data: result.directionB },
        { label: 'Direction C', data: result.directionC },
      ];

      for (const { label, data } of directions) {
        expect(data.manifest).toBeDefined();
        expect(data.manifest.screens.length).toBeGreaterThan(0);

        const collectedNodes: ProjectNode[] = [];
        function collect(node: ProjectNode) {
          collectedNodes.push(node);
          if (node.children) {
            for (const c of node.children) collect(c);
          }
        }

        for (const screen of data.manifest.screens) {
          collect(screen.rootNode);
        }

        const nodesWithRef = collectedNodes.filter((n) => n.resourceRef);
        expect(
          nodesWithRef.length,
          `${label} for ${archetype} should have composed real resource nodes`
        ).toBeGreaterThan(0);

        for (const node of nodesWithRef) {
          const ref = node.resourceRef!;
          const slug = ref.slug;

          // 1. Catalogue valid
          expect(
            catalogSlugs.has(slug),
            `Node ${node.id} references slug "${slug}" which must exist in catalogue`
          ).toBe(true);

          // 2. Runtime registered
          expect(
            Boolean(DEFAULT_RESOURCE_RENDERERS[slug] || isGoldResource(slug)),
            `Node ${node.id} references slug "${slug}" which must be registered in renderer registry`
          ).toBe(true);

          // 3. Exporter resolvable
          expect(
            Boolean(GENERATED_GOLD_SOURCES[slug] || isGoldResource(slug)),
            `Node ${node.id} references slug "${slug}" which must be resolvable in exporter sources`
          ).toBe(true);

          // 4. Variant valid
          expect(['quiet', 'expressive', 'nocturne']).toContain(node.variant);

          // 5. No synthetic fallback ID
          expect(ref.id.startsWith('res_synth_')).toBe(false);
          expect(ref.slug.startsWith('synth-')).toBe(false);
        }
      }
    });
  }
});
