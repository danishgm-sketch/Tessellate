import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type ProductModel,
  type ScreenGraph,
  type DesignDNA,
  type ProjectManifest,
  type ProjectScreen,
  type ProjectNode,
  type ResourceManifest,
  type ResourceRef,
  ProjectManifestSchema,
} from '@tessellate/schemas';
import {
  interpretProductBrief,
  planScreenGraph,
  type ProductBriefInput,
} from '@tessellate/composer';
import {
  generateDirections,
  type GeneratedDirection,
  type DirectionGenerationResult,
} from './direction-generator.js';
import { getCompositionGrammar, type CompositionGrammar } from './grammars.js';
import { evaluateHardConstraints } from './hard-constraints.js';
import { calculateCompatibilityScore } from './scoring.js';
import { isGoldResource } from '@tessellate/catalog/gold';

export interface DirectionCompositionOptions {
  productModel: ProductModel;
  screenGraph: ScreenGraph;
  direction: GeneratedDirection;
  catalogResources?: ResourceManifest[];
  seed?: string | number;
}

export interface ComposedDirectionOutput {
  direction: GeneratedDirection;
  manifest: ProjectManifest;
}

export interface FullCompositionResult {
  productModel: ProductModel;
  screenGraph: ScreenGraph;
  initialDesignDna: DesignDNA;
  directions: DirectionGenerationResult;
  directionA: ComposedDirectionOutput;
  directionB: ComposedDirectionOutput;
  directionC: ComposedDirectionOutput;
  inferredAssumptions: string[];
}

// In-memory cache of loaded catalog resources
let cachedCatalog: ResourceManifest[] | null = null;

export function getDefaultCatalogResources(): ResourceManifest[] {
  if (cachedCatalog && cachedCatalog.length > 0) {
    return cachedCatalog;
  }

  // Attempt to load from disk in Node / test environment
  try {
    const candidates = [
      path.resolve(process.cwd(), 'apps/site/public/data/catalog.json'),
      path.resolve(process.cwd(), 'public/data/catalog.json'),
      path.resolve(__dirname, '../../../../apps/site/public/data/catalog.json'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.resources)) {
          cachedCatalog = parsed.resources;
          return cachedCatalog!;
        }
      }
    }
  } catch {
    // Non-filesystem or browser environment
  }

  return [];
}

/**
 * Finds and instantiates the highest-scoring compatible resource for a required semantic role.
 */
function resolveBestResourceForRole(
  semanticRole: string,
  targetDna: DesignDNA,
  grammar: CompositionGrammar | undefined,
  catalog: ResourceManifest[],
  productModel: ProductModel,
  surroundingResources: ResourceManifest[] = []
): { resource: ResourceManifest | null; ref: ResourceRef | undefined } {
  if (catalog.length === 0) {
    return {
      resource: null,
      ref: {
        id: `res_synth_${semanticRole.replace(/[^a-z0-9]/gi, '_')}`,
        slug: semanticRole,
        version: '1.0.0',
      },
    };
  }

  const roleNorm = semanticRole.toLowerCase();

  // 1. Role / category filtering
  let candidates = catalog.filter((res) => {
    const hasRole = (res.roles ?? []).some((r) => r.toLowerCase().includes(roleNorm) || roleNorm.includes(r.toLowerCase()));
    const hasCategory = grammar?.candidateCategories.some((c) => (res.categories ?? []).includes(c));
    const hasTag = (res.tags ?? []).some((t) => t.toLowerCase() === roleNorm);
    return hasRole || hasCategory || hasTag;
  });

  if (candidates.length === 0) {
    candidates = catalog;
  }

  // 2. Filter by hard constraints
  const validCandidates: ResourceManifest[] = [];
  for (const candidate of candidates) {
    const constraintResult = evaluateHardConstraints({
      resource: candidate,
      targetFramework: 'react',
      targetStyling: 'tailwind-v4',
      requiredAccessibilityFloor: productModel.constraints.accessibilityFloor,
      performanceCeiling: productModel.constraints.performanceCeiling,
      targetDevices: productModel.constraints.targetDevices,
      currentArchetype: productModel.productArchetypes[0]?.tag,
    });
    if (constraintResult.pass) {
      validCandidates.push(candidate);
    }
  }

  const evaluationPool = validCandidates.length > 0 ? validCandidates : candidates;

  // 3. Score candidates with compatibility algorithm
  const scored = evaluationPool.map((candidate) => {
    const scoreResult = calculateCompatibilityScore({
      candidate,
      targetDna,
      semanticRole,
      grammar,
      surroundingResources,
      currentArchetype: productModel.productArchetypes[0]?.tag,
      accessibilityFloor: productModel.constraints.accessibilityFloor,
    });
    const goldBonus = isGoldResource(candidate.slug) ? 15 : 0;
    return {
      candidate,
      score: scoreResult.totalScore + goldBonus,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.candidate;

  if (best) {
    return {
      resource: best,
      ref: {
        id: best.id,
        slug: best.slug,
        version: best.version,
      },
    };
  }

  return {
    resource: null,
    ref: {
      id: `res_${semanticRole.replace(/[^a-z0-9]/gi, '_')}`,
      slug: semanticRole,
      version: '1.0.0',
    },
  };
}

/**
 * Instantiates a complete ProjectManifest for an individual generated direction.
 */
export function composeProjectForDirection(
  options: DirectionCompositionOptions
): ProjectManifest {
  const { productModel, screenGraph, direction, seed = '1' } = options;
  const catalog = (options.catalogResources && options.catalogResources.length > 0)
    ? options.catalogResources
    : getDefaultCatalogResources();

  const grammar = getCompositionGrammar(direction.primaryGrammarId);
  const screens: ProjectScreen[] = [];
  const primaryArchetype = productModel.productArchetypes[0]?.tag ?? 'saas';

  // Instantiate each screen defined in the ScreenGraph
  const allScreenNodes = screenGraph.groups.flatMap((g) => g.screens);
  const screensToInstantiate = allScreenNodes.length > 0
    ? allScreenNodes
    : [
        {
          id: 'screen-overview',
          name: 'Overview Dashboard',
          slug: '/overview',
          screenType: 'dashboard',
          purpose: 'Operational overview and metrics',
          required: true,
          jobs: ['Monitor telemetry', 'Triage alerts'],
          importance: 90,
          navigationVisibility: 'primary' as const,
          expectedData: [],
          requiredRoles: ['navigation', 'hero', 'overview-header', 'data-table'],
          optionalRoles: ['activity-feed'],
        },
      ];

  for (const screenNode of screensToInstantiate) {
    // Role requirements: combine screen required roles with grammar role ordering
    const screenRoles = [...new Set([...(screenNode.requiredRoles ?? []), ...(grammar?.requiredRoles ?? [])])];
    if (screenRoles.length === 0) {
      screenRoles.push('navigation', 'header', 'content-grid', 'footer');
    }

    const surroundingForScreen: ResourceManifest[] = [];
    const sectionNodes: ProjectNode[] = [];

    for (let i = 0; i < screenRoles.length; i++) {
      const role = screenRoles[i]!;
      const { resource, ref } = resolveBestResourceForRole(
        role,
        direction.dna,
        grammar,
        catalog,
        productModel,
        surroundingForScreen
      );

      if (resource) {
        surroundingForScreen.push(resource);
      }

      const variant =
        direction.type === 'expressive'
          ? 'expressive'
          : direction.type === 'structural-alternative'
          ? 'nocturne'
          : 'quiet';

      sectionNodes.push({
        id: `node-${screenNode.id}-${role}-${i + 1}`,
        nodeType: role === 'navigation' ? 'layout' : 'section',
        semanticRole: role,
        resourceRef: ref,
        variant,
        children: [],
        slots: {},
        props: {
          title: `${screenNode.name} ${role}`,
        },
      });
    }

    // Assemble root layout according to direction navigation topology
    let rootNode: ProjectNode;
    if (direction.navigationModel === 'sidebar') {
      const navNode = sectionNodes.find((n) => n.semanticRole === 'navigation') ?? sectionNodes[0]!;
      const contentNodes = sectionNodes.filter((n) => n.id !== navNode.id);
      rootNode = {
        id: `root-${screenNode.id}`,
        nodeType: 'layout',
        semanticRole: 'sidebar-shell',
        children: [
          navNode,
          {
            id: `container-${screenNode.id}-main`,
            nodeType: 'layout',
            semanticRole: 'main-content-scroll',
            children: contentNodes,
            slots: {},
            props: { layoutFamily: grammar?.layoutFamily ?? 'standard-sidebar' },
          },
        ],
        slots: {},
        props: { layoutVariant: 'sidebar' },
      };
    } else if (direction.navigationModel === 'command-palette' || direction.navigationModel === 'rail') {
      const navNode = sectionNodes.find((n) => n.semanticRole === 'navigation') ?? sectionNodes[0]!;
      const contentNodes = sectionNodes.filter((n) => n.id !== navNode.id);
      rootNode = {
        id: `root-${screenNode.id}`,
        nodeType: 'layout',
        semanticRole: 'workspace-dock-shell',
        children: [
          navNode,
          {
            id: `container-${screenNode.id}-canvas`,
            nodeType: 'layout',
            semanticRole: 'workspace-multi-pane',
            children: contentNodes,
            slots: {},
            props: { layoutFamily: grammar?.layoutFamily ?? 'three-pane' },
          },
        ],
        slots: {},
        props: { layoutVariant: 'split-dock' },
      };
    } else {
      // Top nav or standard stacked
      rootNode = {
        id: `root-${screenNode.id}`,
        nodeType: 'layout',
        semanticRole: 'top-nav-page-canvas',
        children: sectionNodes,
        slots: {},
        props: { layoutVariant: 'vertical-flow' },
      };
    }

    screens.push({
      id: screenNode.id,
      screenNodeId: `node-${screenNode.id}`,
      name: screenNode.name,
      slug: screenNode.slug,
      rootNode,
    });
  }

  const manifestId = `proj-${direction.id}-${String(seed).replace(/[^a-z0-9]/gi, '')}`;

  const manifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: manifestId,
    name: `${direction.name} — ${primaryArchetype.toUpperCase()}`,
    description: direction.rationale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    catalogVersion: '0.1.0',
    seed: String(seed),
    productModel,
    designDNA: direction.dna,
    brand: {
      name: `${primaryArchetype.toUpperCase()} System`,
    },
    constraints: productModel.constraints,
    screenGraph,
    screens,
    navigation: {
      model: direction.navigationModel,
      primaryItems: screens.map((s) => ({
        label: s.name,
        targetScreenId: s.id,
      })),
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 0,
      headRevision: 0,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };

  return ProjectManifestSchema.parse(manifest);
}

/**
 * End-to-end composer pipeline:
 * ProductBrief → ProductModel → initial DesignDNA → ScreenGraph
 * → 3 GeneratedDirections → per-direction CompositionGrammar → complete ProjectManifest per direction.
 */
export function composeProjectPipeline(
  brief: ProductBriefInput,
  options?: {
    catalogResources?: ResourceManifest[];
    seed?: string | number;
  }
): FullCompositionResult {
  const seed = options?.seed ?? 'tessellate-seed-v1';
  const { productModel, inferredAssumptions, initialDesignDna } = interpretProductBrief(brief);
  const { screenGraph } = planScreenGraph(productModel);

  const directions = generateDirections({
    productModel,
    screenGraph,
    baseDna: initialDesignDna,
    seed,
  });

  const manifestA = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionA,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-a`,
  });

  const manifestB = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionB,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-b`,
  });

  const manifestC = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionC,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-c`,
  });

  return {
    productModel,
    screenGraph,
    initialDesignDna,
    directions,
    directionA: {
      direction: directions.directionA,
      manifest: manifestA,
    },
    directionB: {
      direction: directions.directionB,
      manifest: manifestB,
    },
    directionC: {
      direction: directions.directionC,
      manifest: manifestC,
    },
    inferredAssumptions,
  };
}
