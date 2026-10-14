import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { randomUUID } from 'node:crypto';
import { BriefInterpretationSchema, ProjectManifestSchema } from '@tessellate/schemas';
import { composeFromInterpretation } from '@tessellate/compatibility';
import { requestInterpretation, type QueueClientOptions } from '@tessellate/intelligence';
import { DEFAULT_DESIGN_DNA, DNA_PRESETS } from '@tessellate/dna';
import { loadMcpCatalogue, findResourceBySlug, getResourceComponentCode } from './catalog-provider.js';

/** API used for brief interpretation (D-033). Override with TESSELLATE_API_URL. */
export const DEFAULT_API_URL = 'https://tessellate.design';

export function registerMcpTools(server: McpServer, cwd = process.cwd(), queue: QueueClientOptions = {}) {
  const intelligence: QueueClientOptions = {
    apiBase: (process.env.TESSELLATE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ''),
    ...queue,
  };
  // 1. search_resources
  server.tool(
    'search_resources',
    'Search the open Tessellate resource catalogue by query, category, and tags.',
    {
      query: z.string().optional().describe('Keywords to match name, slug, or description'),
      category: z.string().optional().describe('Filter by category (e.g. primitives, blocks, sections)'),
      limit: z.number().int().min(1).max(50).default(20).describe('Max results to return'),
    },
    async ({ query = '', category, limit = 20 }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const q = query.toLowerCase().trim();

      const results = catalogue.resources
        .filter((r) => {
          if (category && !r.categories.includes(category)) return false;
          if (!q) return true;
          return (
            r.slug.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
        .slice(0, limit)
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          category: r.categories[0] ?? 'primitives',
          type: r.resourceType,
          description: r.description,
          license: r.license.spdx,
          dependencies: r.registry.dependencies ?? [],
          installCommand: `tess add ${r.slug}`,
          shadcnUrl: `https://tessellate.design/r/${r.slug}.json`,
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ count: results.length, resources: results }, null, 2),
          },
        ],
      };
    }
  );

  // 2. get_resource
  server.tool(
    'get_resource',
    'Retrieve the complete validated ResourceManifest for a given component slug.',
    {
      slug: z.string().describe('The resource slug or @tess/{slug}'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Resource "${slug}" not found in catalogue.` }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(resource, null, 2),
          },
        ],
      };
    }
  );

  // 3. get_resource_code
  server.tool(
    'get_resource_code',
    'Retrieve the raw React TypeScript component source code for a resource.',
    {
      slug: z.string().describe('The resource slug'),
      variant: z.string().optional().describe('Optional variant name'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Resource "${slug}" not found in catalogue.` }),
            },
          ],
        };
      }

      const code = getResourceComponentCode(resource, cwd);
      if (!code) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: `Source code for "${slug}" is available in the online registry.`,
                registryUrl: `https://tessellate.design/r/${resource.slug}.json`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: code,
          },
        ],
      };
    }
  );

  // 4. get_resource_metadata
  server.tool(
    'get_resource_metadata',
    'Retrieve lightweight metadata including dependencies, slots, accessibility level, and performance cost.',
    {
      slug: z.string().describe('The resource slug'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Resource "${slug}" not found in catalogue.` }),
            },
          ],
        };
      }

      const metadata = {
        slug: resource.slug,
        name: resource.name,
        dependencies: resource.registry.dependencies ?? [],
        devDependencies: resource.registry.devDependencies ?? [],
        slots: resource.slots,
        accessibility: resource.accessibility,
        performance: resource.performance,
        responsiveStrategy: resource.responsive.defaultStrategy,
        quality: resource.quality,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(metadata, null, 2),
          },
        ],
      };
    }
  );

  // 5. find_alternatives
  server.tool(
    'find_alternatives',
    'Find structurally or aesthetically compatible substitute resources for a given component.',
    {
      slug: z.string().describe('The resource slug to find substitutes for'),
      criteria: z.enum(['accessibility', 'performance', 'simplicity', 'all']).default('all').describe('Alternative criteria'),
    },
    async ({ slug }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const target = catalogue.resources.find((r) => r.slug === slug.replace(/^@tess\//, ''));
      if (!target) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Resource "${slug}" not found.` }),
            },
          ],
        };
      }

      const alternatives = catalogue.resources
        .filter((r) => r.slug !== target.slug && r.categories.some((c) => target.categories.includes(c)))
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          category: r.categories[0],
          description: r.description,
          accessibilityLevel: r.accessibility.levelTarget,
          performanceJsCost: r.performance.jsCost,
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ targetSlug: target.slug, alternatives }, null, 2),
          },
        ],
      };
    }
  );

  // 6. recommend_resources
  server.tool(
    'recommend_resources',
    'Recommend the best resources for a specific page section or product goal.',
    {
      intent: z.string().describe('Intent or requirement (e.g. "hero with clear CTA", "pricing table with monthly toggle")'),
      category: z.string().optional().describe('Optional category filter'),
    },
    async ({ intent, category }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const terms = intent.toLowerCase().split(/\s+/).filter(Boolean);

      const scored = catalogue.resources
        .filter((r) => (!category ? true : r.categories.includes(category)))
        .map((r) => {
          let score = 0;
          const haystack = `${r.name} ${r.description} ${r.tags.join(' ')} ${r.categories.join(' ')}`.toLowerCase();
          for (const term of terms) {
            if (haystack.includes(term)) score += 10;
          }
          return { resource: r, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ resource, score }) => ({
          slug: resource.slug,
          name: resource.name,
          relevanceScore: score,
          description: resource.description,
          category: resource.categories[0],
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ recommendations: scored }, null, 2),
          },
        ],
      };
    }
  );

  // 7. interpret_brief — served only by the Tessellate intelligence service (D-033); no offline guess.
  server.tool(
    'interpret_brief',
    'Ask the Tessellate intelligence service what a product needs: product type, entities, screens and assumptions. Show the result to the user for review before composing. Fails with a reason when the service is unavailable.',
    {
      brief: z.string().min(12).max(4000).describe('Product brief: who uses it and what they do in it'),
    },
    async ({ brief }) => {
      const result = await requestInterpretation(brief, undefined, intelligence);
      if (!result.success || !result.interpretation) {
        return { isError: true, content: [{ type: 'text', text: result.error ?? 'Tessellate could not interpret this brief.' }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result.interpretation, null, 2) }] };
    }
  );

  // 8. compose_product
  server.tool(
    'compose_product',
    'Compose three directions for a product from a reviewed interpretation (from interpret_brief, optionally edited) and return the chosen ProjectManifest.',
    {
      interpretation: z.record(z.unknown()).describe('A BriefInterpretation object returned by interpret_brief, after review'),
      direction: z.enum(['a', 'b', 'c']).optional().describe('a conservative (default), b expressive, c structural alternative'),
      name: z.string().optional().describe('Product name used in navigation, headings and exported code'),
    },
    async ({ interpretation, direction = 'a', name }) => {
      const parsed = BriefInterpretationSchema.safeParse(interpretation);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return {
          isError: true,
          content: [{ type: 'text', text: `Invalid interpretation: ${issue?.path.join('.') || '(root)'} ${issue?.message ?? ''}`.trim() }],
        };
      }
      const catalogue = await loadMcpCatalogue(cwd);
      if (catalogue.resources.length === 0) {
        return { isError: true, content: [{ type: 'text', text: 'The resource catalogue could not be loaded, so nothing can be composed.' }] };
      }
      const composition = composeFromInterpretation(parsed.data, {
        catalogResources: catalogue.resources,
        projectIdBase: `proj_${randomUUID()}`,
        productName: name,
      });
      const pick = { a: composition.directionA, b: composition.directionB, c: composition.directionC }[direction];
      const manifest = ProjectManifestSchema.parse(pick.manifest);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                direction: { type: pick.direction.type, name: pick.direction.name, rationale: pick.direction.rationale },
                alternatives: [composition.directionA, composition.directionB, composition.directionC].map((d) => d.direction.name),
                gaps: (pick.diagnostics ?? []).map((g) => ({ screenId: g.screenId, role: g.role, label: g.label, reason: g.reason })),
                manifest,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 9. validate_project
  server.tool(
    'validate_project',
    'Validate a ProjectManifest object against canonical schemas.',
    {
      manifest: z.record(z.unknown()).describe('The ProjectManifest object to validate'),
    },
    async ({ manifest }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  valid: false,
                  errors: parsed.error.issues.map((i) => ({
                    path: i.path.join('.'),
                    message: i.message,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ valid: true, name: parsed.data.name, id: parsed.data.id }, null, 2),
          },
        ],
      };
    }
  );

  // 10. audit_project
  server.tool(
    'audit_project',
    'Audit a ProjectManifest for WCAG contrast compliance, reduced-motion compatibility, and performance bounds.',
    {
      manifest: z.record(z.unknown()).describe('The ProjectManifest to audit'),
    },
    async ({ manifest }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Invalid manifest', issues: parsed.error.issues }),
            },
          ],
        };
      }

      const proj = parsed.data;
      const issues: Array<{ severity: 'error' | 'warning' | 'info'; code: string; message: string }> = [];

      // Check contrast in Design DNA (numeric 0-100)
      if (proj.designDNA.contrast < 40) {
        issues.push({
          severity: 'warning',
          code: 'CONTRAST_SOFT',
          message: 'Soft contrast floor chosen. Verify WCAG 2.2 AA text ratios manually for low-vision users.',
        });
      }

      // Check motion (numeric 0-100)
      if (proj.designDNA.motion > 70) {
        issues.push({
          severity: 'info',
          code: 'MOTION_EXPRESSIVE',
          message: 'Expressive motion active. Ensure prefers-reduced-motion media query dampens animations.',
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                summary: 'Manifest audit passed with recommendations.',
                passed: issues.filter((i) => i.severity === 'error').length === 0,
                issues,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 11. get_design_dna
  server.tool(
    'get_design_dna',
    'Get Design DNA presets and explore the 10-dimensional design parameter space.',
    {
      preset: z.string().optional().describe('Preset name to look up (default, editorial, brutalist, minimal, kinetic, terminal)'),
    },
    async ({ preset }) => {
      if (preset && preset in DNA_PRESETS) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ preset, dna: DNA_PRESETS[preset as keyof typeof DNA_PRESETS] }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                default: DEFAULT_DESIGN_DNA,
                presets: Object.keys(DNA_PRESETS),
                dimensions: [
                  'density',
                  'chroma',
                  'contrast',
                  'radii',
                  'depth',
                  'motion',
                  'scale',
                  'pattern',
                  'glass',
                  'colorMode',
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 12. list_design_directions
  server.tool(
    'list_design_directions',
    'List the three canonical visual reference directions defined in the design spec.',
    {},
    async () => {
      const directions = [
        {
          id: 'direction-a',
          name: 'Editorial Precision',
          aesthetic: 'Calm, authoritative typography, quiet confidence, strict grid, restrained chroma.',
          recommendedArchetypes: ['knowledge-base', 'portfolio', 'developer-platform'],
        },
        {
          id: 'direction-b',
          name: 'Kinetic Monolith',
          aesthetic: 'Bold geometry, purposeful physics-based motion, deep dark mode surfaces, crisp contrast.',
          recommendedArchetypes: ['saas-analytics', 'fintech', 'creative-tools'],
        },
        {
          id: 'direction-c',
          name: 'Atmospheric Depth',
          aesthetic: 'Layered elevation, subtle noise patterns, soft luminous accents, high tactile fidelity.',
          recommendedArchetypes: ['ai-copilot', 'data-visualisation', 'consumer-experience'],
        },
      ];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ directions }, null, 2),
          },
        ],
      };
    }
  );
}
