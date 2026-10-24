import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PartialDesignDNASchema, ProjectManifestSchema, type ProjectManifest } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA, DNA_PRESETS, getDNAPreset } from '@tessellate/dna';
import { interpretProductBrief, planScreenGraph } from '@tessellate/composer';
import { composeProjectPipeline } from '@tessellate/compatibility';
import { generateSourceTree } from '@tessellate/exporter';
import { loadMcpCatalogue, findResourceBySlug, getResourceComponentCode } from './catalog-provider.js';

const MAX_MCP_MANIFEST_BYTES = 1024 * 1024;
const boundedSlug = z.string().trim().min(1).max(160).regex(/^(@tess\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/i);
const boundedManifest = z.record(z.string(), z.unknown()).superRefine((manifest, context) => {
  try {
    if (Buffer.byteLength(JSON.stringify(manifest), 'utf8') > MAX_MCP_MANIFEST_BYTES) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'ProjectManifest exceeds the 1 MiB MCP input limit.' });
    }
  } catch {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'ProjectManifest could not be safely serialized.' });
  }
});

function toolError(message: string, details?: unknown) {
  return {
    isError: true,
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message, ...(details === undefined ? {} : { details }) }, null, 2) }],
  };
}

const productBriefControls = {
  archetype: z.string().trim().max(100).optional().describe('Optional archetype override'),
  audience: z.string().trim().max(1200).optional().describe('Optional primary audience'),
  objective: z.string().trim().max(1200).optional().describe('Optional primary product objective'),
  feel: z.string().trim().max(500).optional().describe('Visual feel descriptors, such as "professional but playful"'),
  visualAmbition: z.number().int().min(0).max(100).optional().describe('Visual ambition score from 0 to 100'),
  structuralCreativity: z.number().int().min(0).max(100).optional().describe('Structural creativity score from 0 to 100'),
  requiredScreens: z.array(z.string().trim().min(1).max(120)).max(40).optional().describe('Screens that the product architecture must include'),
  forbiddenScreens: z.array(z.string().trim().min(1).max(120)).max(40).optional().describe('Screens the product architecture must exclude'),
  accessibilityFloor: z.enum(['A', 'AA', 'AAA']).optional().describe('Minimum accessibility target'),
  performanceCeiling: z.enum(['lightweight', 'balanced', 'rich']).optional().describe('Allowed performance cost'),
  targetDevices: z.array(z.enum(['desktop', 'tablet', 'mobile'])).max(3).optional().describe('Target device classes'),
};

export function registerMcpTools(server: McpServer, cwd = process.cwd()) {
  // 1. search_resources
  server.tool(
    'search_resources',
    'Search the open Tessellate resource catalogue by query, category, and tags.',
    {
      query: z.string().max(200).optional().describe('Keywords to match name, slug, or description (up to 200 characters)'),
      category: z.string().trim().max(80).optional().describe('Filter by category (e.g. primitives, blocks, sections)'),
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
      slug: boundedSlug.describe('The resource slug or @tess/{slug}'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return toolError(`Resource "${slug}" not found in catalogue.`);
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
      slug: boundedSlug.describe('The resource slug'),
      variant: z.string().trim().max(80).optional().describe('Optional variant name'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return toolError(`Resource "${slug}" not found in catalogue.`);
      }

      const code = getResourceComponentCode(resource, cwd);
      if (!code) {
        return toolError(`Source code for "${slug}" is not present in the local checkout.`, {
          registryUrl: `https://tessellate.design/r/${resource.slug}.json`,
        });
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
      slug: boundedSlug.describe('The resource slug'),
    },
    async ({ slug }) => {
      const resource = await findResourceBySlug(slug, cwd);
      if (!resource) {
        return toolError(`Resource "${slug}" not found in catalogue.`);
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
    'List same-type resources that share categories with a resource, ranked against accessibility, runtime cost, or composability metadata. These are candidates, not guaranteed drop-in replacements.',
    {
      slug: boundedSlug.describe('The resource slug to find substitutes for'),
      criteria: z.enum(['accessibility', 'performance', 'simplicity', 'all']).default('all').describe('Alternative criteria'),
    },
    async ({ slug, criteria = 'all' }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const target = catalogue.resources.find((r) => r.slug === slug.replace(/^@tess\//, ''));
      if (!target) {
        return toolError(`Resource "${slug}" not found.`);
      }

      const costRank: Record<string, number> = { none: 0, tiny: 1, low: 2, medium: 3, high: 4 };
      const alternatives = catalogue.resources
        .filter((resource) => resource.slug !== target.slug && resource.resourceType === target.resourceType && resource.categories.some((category) => target.categories.includes(category)))
        .map((resource) => {
          const sharedCategories = resource.categories.filter((category) => target.categories.includes(category));
          const sharedTags = resource.tags.filter((tag) => target.tags.some((targetTag) => targetTag.toLowerCase() === tag.toLowerCase()));
          const accessibilityScore = Number(resource.accessibility.levelTarget === 'AAA') * 3 + Number(resource.accessibility.levelTarget === 'AA') * 2 + Number(resource.accessibility.keyboardVerified) + Number(resource.accessibility.focusVisible);
          const performanceScore = 4 - (costRank[resource.performance.jsCost] ?? 4);
          const composabilityScore = resource.quality.composability;
          const score = criteria === 'accessibility'
            ? accessibilityScore
            : criteria === 'performance'
              ? performanceScore
              : criteria === 'simplicity'
                ? performanceScore + (resource.performance.runtimeComplexity === 'low' ? 2 : 0)
                : sharedTags.length * 3 + sharedCategories.length * 2 + composabilityScore / 100;
          return {
            slug: resource.slug,
            name: resource.name,
            category: resource.categories[0],
            description: resource.description,
            resourceType: resource.resourceType,
            sharedCategories,
            sharedTagCount: sharedTags.length,
            accessibilityLevel: resource.accessibility.levelTarget,
            performanceJsCost: resource.performance.jsCost,
            score,
          };
        })
        .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
        .slice(0, 10);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ targetSlug: target.slug, criteria, basis: 'same resource type and at least one shared category', alternatives }, null, 2),
          },
        ],
      };
    }
  );

  // 6. recommend_resources
  server.tool(
    'recommend_resources',
    'Return resource candidates with lexical token overlap against a page section or product goal. This is not semantic ranking or a guarantee of fit.',
    {
      intent: z.string().trim().min(1).max(2000).describe('Intent or requirement, up to 2,000 characters'),
      category: z.string().trim().max(80).optional().describe('Optional category filter'),
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
        .filter(({ score }) => score > 0)
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
              text: JSON.stringify({ method: 'lexical-token-overlap', recommendations: scored }, null, 2),
          },
        ],
      };
    }
  );

  // 7. compose_screen
  server.tool(
    'compose_screen',
    'Compose a ProjectManifest through the shared Tessellate product pipeline. The optional brief controls match Compose; provide a seed to reproduce a GUI or CLI composition.',
    {
      prompt: z.string().trim().min(1).max(10_000).describe('Product brief or screen requirement, up to 10,000 characters'),
      name: z.string().trim().max(160).optional().describe('Project name'),
      ...productBriefControls,
      seed: z.union([z.string().max(120), z.number()]).optional().describe('Reproducible generation seed; defaults to tessellate-seed-v1'),
      direction: z.enum(['A', 'B', 'C']).default('A').describe('Composition approach (A: conservative, B: expressive, C: structural alternative)'),
    },
    async ({ prompt, name = 'Composed Screen', archetype, audience, objective, feel, visualAmbition, structuralCreativity, requiredScreens, forbiddenScreens, accessibilityFloor, performanceCeiling, targetDevices, seed = 'tessellate-seed-v1', direction = 'A' }) => {
      const catalogue = await loadMcpCatalogue(cwd);
      const pipelineResult = composeProjectPipeline(
        {
          description: prompt,
          archetypeOverride: archetype,
          audience,
          objective,
          feel,
          visualAmbition,
          structuralCreativity,
          requiredScreens,
          forbiddenScreens,
          accessibilityFloor,
          performanceCeiling,
          targetDevices,
        },
        {
          catalogResources: catalogue.resources,
          seed,
        }
      );

      const selectedOutput =
        direction === 'B'
          ? pipelineResult.directionB
          : direction === 'C'
            ? pipelineResult.directionC
            : pipelineResult.directionA;

      if (selectedOutput.diagnostics?.length) {
        return toolError('Composition could not resolve every required role. No incomplete project was returned.', selectedOutput.diagnostics);
      }

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
    'Interpret a product brief into the shared ProductModel, initial Design DNA, and planned screen hierarchy without generating code.',
    {
      description: z.string().trim().min(1).max(10_000).describe('Product description, up to 10,000 characters'),
      ...productBriefControls,
    },
    async ({ description, archetype, audience, objective, feel, visualAmbition, structuralCreativity, requiredScreens, forbiddenScreens, accessibilityFloor, performanceCeiling, targetDevices }) => {
      const interpreted = interpretProductBrief({
        description,
        archetypeOverride: archetype,
        audience,
        objective,
        feel,
        visualAmbition,
        structuralCreativity,
        requiredScreens,
        forbiddenScreens,
        accessibilityFloor,
        performanceCeiling,
        targetDevices,
      });
      const plan = planScreenGraph(interpreted.productModel);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                productModel: interpreted.productModel,
                initialDesignDNA: interpreted.initialDesignDna,
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
      manifest: boundedManifest.describe('The ProjectManifest object to validate (up to 1 MiB)'),
    },
    async ({ manifest }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return toolError('ProjectManifest validation failed.', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
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
    'Run manifest-level heuristics for contrast preference and motion intent. This does not measure rendered WCAG contrast, reduced-motion behavior, or performance.',
    {
      manifest: boundedManifest.describe('The ProjectManifest to audit (up to 1 MiB)'),
    },
    async ({ manifest }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return toolError('ProjectManifest validation failed.', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
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
                status: 'heuristics_complete_browser_review_required',
                scope: ['Design DNA contrast preference', 'Design DNA motion intent'],
                notAssessed: ['Rendered color contrast ratios', 'prefers-reduced-motion behavior', 'Runtime performance'],
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
    'Get the current Design DNA defaults, all canonical presets, or one preset by its canonical ID.',
    {
      preset: z.string().trim().max(80).optional().describe('Preset name to look up (default, editorial, brutalist, minimal, kinetic, terminal)'),
    },
    async ({ preset }) => {
      if (preset) {
        const selected = getDNAPreset(preset);
        if (!selected) return toolError(`Unknown Design DNA preset "${preset}".`, { availablePresets: DNA_PRESETS.map((item) => item.id) });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ preset: selected.id, name: selected.name, description: selected.description, dna: selected.dna }, null, 2),
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
                presets: DNA_PRESETS.map(({ id, name, category, description }) => ({ id, name, category, description })),
                dimensions: Object.keys(DEFAULT_DESIGN_DNA),
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
    'Describe the three composition approaches. Names and visual details are generated for each brief; the returned labels describe the stable A/B/C approach.',
    {},
    async () => {
      const directions = [
        {
          id: 'direction-a',
          label: 'A',
          approach: 'conservative',
          structure: 'Familiar navigation and predictable hierarchy with stronger accessibility and performance priorities.',
        },
        {
          id: 'direction-b',
          label: 'B',
          approach: 'expressive',
          structure: 'Familiar workflow structure with more expressive typography, motion, imagery and visual ambition.',
        },
        {
          id: 'direction-c',
          label: 'C',
          approach: 'structural-alternative',
          structure: 'An alternate navigation topology and composition grammar with higher structural creativity.',
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
    'Generate a source tree for the selected Vite or Beta Next.js target. This tool returns files; it does not install, build, or runtime-test the export.',
    {
      manifest: boundedManifest.describe('The ProjectManifest object to compile (up to 1 MiB)'),
      target: z.enum(['vite', 'nextjs']).default('vite').describe('Export target framework (vite SPA or nextjs 15 App Router)'),
    },
    async ({ manifest, target = 'vite' }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return toolError('ProjectManifest validation failed.', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
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
        return toolError(`Export compilation failed: ${message}`);
      }
    }
  );

  // 14. audit_project_accessibility
  server.tool(
    'audit_project_accessibility',
    'Check manifest structure for semantic navigation landmarks. This heuristic does not test rendered contrast, keyboard behavior, screen readers, or reduced motion, so it cannot certify a WCAG level.',
    {
      manifest: boundedManifest.describe('The ProjectManifest to audit (up to 1 MiB)'),
    },
    async ({ manifest }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return toolError('ProjectManifest validation failed.', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
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
        const visit = (node: ProjectManifest['screens'][number]['rootNode']) => {
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

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                summary: 'Manifest landmark heuristic complete; browser accessibility review required.',
                status: 'heuristic_only',
                levelAchieved: 'not-assessed',
                notAssessed: ['Rendered color contrast', 'Keyboard interaction', 'Screen-reader announcements', 'Reduced-motion runtime behavior'],
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
    'Apply one validated lock, DNA-value, or navigation mutation to a ProjectManifest. Required fields depend on the selected action; unknown node IDs and invalid Design DNA values fail explicitly.',
    {
      manifest: boundedManifest.describe('The ProjectManifest object to mutate (up to 1 MiB)'),
      action: z.enum(['lock_node', 'unlock_node', 'adjust_dna', 'set_navigation_model']).describe('Mutation action'),
      nodeId: z.string().trim().min(1).max(200).optional().describe('Existing node ID for lock/unlock actions'),
      dnaDelta: PartialDesignDNASchema.optional().describe('Partial Design DNA values to apply (numeric scores are 0–100)'),
      navigationModel: z.enum(['sidebar-fixed', 'top-nav', 'bottom-dock', 'minimal']).optional().describe('New navigation model'),
    },
    async ({ manifest, action, nodeId, dnaDelta, navigationModel }) => {
      const parsed = ProjectManifestSchema.safeParse(manifest);
      if (!parsed.success) {
        return toolError('ProjectManifest validation failed.', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
      }

      const proj = JSON.parse(JSON.stringify(parsed.data)) as ProjectManifest;
      const nodeIds = new Set<string>();
      const visit = (node: ProjectManifest['screens'][number]['rootNode']) => {
        nodeIds.add(node.id);
        node.children.forEach(visit);
      };
      proj.screens.forEach((screen) => visit(screen.rootNode));

      if ((action === 'lock_node' || action === 'unlock_node') && !nodeId) {
        return toolError(`nodeId is required for ${action}.`);
      }
      if ((action === 'lock_node' || action === 'unlock_node') && nodeId && !nodeIds.has(nodeId)) {
        return toolError(`Node "${nodeId}" does not exist in this project.`);
      }
      if (action === 'adjust_dna' && (!dnaDelta || Object.keys(dnaDelta).length === 0)) {
        return toolError('dnaDelta must contain at least one Design DNA value for adjust_dna.');
      }
      if (action === 'set_navigation_model' && !navigationModel) {
        return toolError('navigationModel is required for set_navigation_model.');
      }

      let changed = false;
      if (action === 'lock_node' && nodeId) {
        if (!proj.locks.some((l) => l.targetNodeId === nodeId)) {
          proj.locks.push({ targetNodeId: nodeId, lockTypes: ['node', 'structure'] });
          changed = true;
        }
      } else if (action === 'unlock_node' && nodeId) {
        const existingLockCount = proj.locks.length;
        proj.locks = proj.locks.filter((l) => l.targetNodeId !== nodeId);
        changed = proj.locks.length !== existingLockCount;
      } else if (action === 'adjust_dna' && dnaDelta) {
        changed = Object.entries(dnaDelta).some(([key, value]) => proj.designDNA[key as keyof typeof proj.designDNA] !== value);
        proj.designDNA = {
          ...proj.designDNA,
          ...dnaDelta,
        };
      } else if (action === 'set_navigation_model' && navigationModel) {
        changed = proj.navigation.model !== navigationModel;
        proj.navigation.model = navigationModel;
      }

      if (!changed) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, changed: false, manifest: proj }, null, 2) }],
        };
      }
      proj.updatedAt = new Date().toISOString();
      proj.historyMeta.totalOperations = (proj.historyMeta.totalOperations ?? 0) + 1;
      proj.historyMeta.headRevision = (proj.historyMeta.headRevision ?? 1) + 1;

      const validated = ProjectManifestSchema.safeParse(proj);
      if (!validated.success) {
        return toolError('Mutation would produce an invalid ProjectManifest.', validated.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, changed, manifest: validated.data }, null, 2),
          },
        ],
      };
    }
  );
}

