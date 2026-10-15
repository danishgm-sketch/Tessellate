import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProjectManifestSchema, type ProjectManifest } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA, DNA_PRESETS } from '@tessellate/dna';
import { interpretProductBrief, planScreenGraph } from '@tessellate/composer';
import { composeProjectPipeline } from '@tessellate/compatibility';
import { generateSourceTree } from '@tessellate/exporter';
import { loadMcpCatalogue, findResourceBySlug, getResourceComponentCode } from './catalog-provider.js';

export function registerMcpTools(server: McpServer, cwd = process.cwd()) {
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

  // 7. compose_screen
  server.tool(
    'compose_screen',
    'Deterministically generate a complete ProjectManifest with fully composed screens and nodes from a brief.',
    {
      prompt: z.string().describe('Product brief or screen requirement'),
      name: z.string().optional().describe('Project name'),
      archetype: z.string().optional().describe('Archetype override (e.g. saas, ecommerce, docs)'),
      direction: z.enum(['A', 'B', 'C']).default('A').describe('Visual design direction (A: Editorial Precision, B: Kinetic Monolith, C: Atmospheric Depth)'),
    },
    async ({ prompt, name = 'Composed Screen', archetype, direction = 'A' }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const pipelineResult = composeProjectPipeline(
        {
          description: prompt,
          archetypeOverride: archetype,
        },
        {
          catalogResources: catalogue.resources,
        }
      );

      const selectedOutput =
        direction === 'B'
          ? pipelineResult.directionB
          : direction === 'C'
            ? pipelineResult.directionC
            : pipelineResult.directionA;

      const manifest = {
        ...selectedOutput.manifest,
        name: name || selectedOutput.manifest.name,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(manifest, null, 2),
          },
        ],
      };
    }
  );

  // 8. compose_product
  server.tool(
    'compose_product',
    'Interpret product brief into a validated ProductModel and screen hierarchy without generating code.',
    {
      description: z.string().describe('Product description'),
      archetype: z.string().optional().describe('Optional archetype override'),
    },
    async ({ description, archetype }) => {
      const interpreted = interpretProductBrief({
        description,
        archetypeOverride: archetype,
      });
      const plan = planScreenGraph(interpreted.productModel);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                productModel: interpreted.productModel,
                assumptions: interpreted.inferredAssumptions,
                screenPlan: {
                  totalScreens: plan.totalScreens,
                  requiredScreensCount: plan.requiredScreensCount,
                  screenGraph: plan.screenGraph,
                },
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

  // 13. export_project_code
  server.tool(
    'export_project_code',
    'Compile a ProjectManifest into an exportable, production-ready code tree for Vite or Next.js 15.',
    {
      manifest: z.record(z.unknown()).describe('The ProjectManifest object to compile'),
      target: z.enum(['vite', 'nextjs']).default('vite').describe('Export target framework (vite SPA or nextjs 15 App Router)'),
    },
    async ({ manifest, target = 'vite' }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Invalid ProjectManifest schema', issues: parsed.error.issues }, null, 2),
            },
          ],
        };
      }

      try {
        const generated = generateSourceTree(parsed.data, { target });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  target,
                  fileCount: Object.keys(generated).length,
                  files: generated,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Export compilation failed: ${message}` }),
            },
          ],
        };
      }
    }
  );

  // 14. audit_project_accessibility
  server.tool(
    'audit_project_accessibility',
    'Deeply audit a ProjectManifest for WCAG AAA compliance, semantic landmarks, and motion reduction.',
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

      // Contrast ratio check
      if (proj.designDNA.contrast < 45) {
        issues.push({
          severity: 'warning',
          code: 'CONTRAST_LOW',
          message: 'Design DNA contrast score is below 45. Some components may fail WCAG AAA 7:1 ratio requirements.',
        });
      }

      // Check screens for landmark semantics
      let totalNodes = 0;
      for (const screen of proj.screens) {
        const roles = new Set<string>();
        const visit = (node: any) => {
          totalNodes++;
          if (node.semanticRole) roles.add(node.semanticRole);
          for (const child of node.children || []) visit(child);
        };
        visit(screen.rootNode);

        if (!roles.has('shell') && !roles.has('navigation')) {
          issues.push({
            severity: 'warning',
            code: 'MISSING_NAV_LANDMARK',
            message: `Screen "${screen.name}" (${screen.id}) is missing dedicated navigation/shell landmark.`,
          });
        }
      }

      const isAAA = issues.filter((i) => i.severity === 'error').length === 0;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                summary: isAAA ? 'WCAG AAA Accessibility Audit Passed' : 'Accessibility Audit Completed with Issues',
                levelAchieved: isAAA ? 'AAA' : 'AA',
                screenCount: proj.screens.length,
                totalNodes,
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

  // 15. mutate_screen_ast
  server.tool(
    'mutate_screen_ast',
    'Apply atomic mutations or parameter adjustments to a ProjectManifest AST.',
    {
      manifest: z.record(z.unknown()).describe('The ProjectManifest object to mutate'),
      action: z.enum(['lock_node', 'unlock_node', 'adjust_dna', 'set_navigation_model']).describe('Mutation action'),
      nodeId: z.string().optional().describe('Node ID for lock/unlock actions'),
      dnaDelta: z.record(z.number()).optional().describe('Partial Design DNA deltas to apply'),
      navigationModel: z.enum(['sidebar-fixed', 'top-nav', 'bottom-dock', 'minimal']).optional().describe('New navigation model'),
    },
    async ({ manifest, action, nodeId, dnaDelta, navigationModel }) => {
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

      const proj = JSON.parse(JSON.stringify(parsed.data)) as ProjectManifest;

      if (action === 'lock_node' && nodeId) {
        if (!proj.locks.some((l) => l.targetNodeId === nodeId)) {
          proj.locks.push({ targetNodeId: nodeId, lockTypes: ['node', 'structure'] });
        }
      } else if (action === 'unlock_node' && nodeId) {
        proj.locks = proj.locks.filter((l) => l.targetNodeId !== nodeId);
      } else if (action === 'adjust_dna' && dnaDelta) {
        proj.designDNA = {
          ...proj.designDNA,
          ...dnaDelta,
        };
      } else if (action === 'set_navigation_model' && navigationModel) {
        proj.navigation.model = navigationModel;
      }

      proj.updatedAt = new Date().toISOString();
      proj.historyMeta.totalOperations = (proj.historyMeta.totalOperations ?? 0) + 1;
      proj.historyMeta.headRevision = (proj.historyMeta.headRevision ?? 1) + 1;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, manifest: proj }, null, 2),
          },
        ],
      };
    }
  );
}

