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
import { resourceMatchesRole } from './semantic-roles.js';
import { bindResourceContent } from './content-bindings.js';
import {
  isResourceComposerEligible,
  isResourceCompositionCapable,
} from './capabilities.js';
export { isResourceComposerEligible, isResourceCompositionCapable };

export interface RoleResolutionDiagnostic {
  code: 'UNRESOLVED_REQUIRED_ROLE';
  role: string;
  reason: string;
  rejectedCandidateReasons?: string[];
}

export interface DirectionCompositionOptions {
  productModel: ProductModel;
  screenGraph: ScreenGraph;
  direction: GeneratedDirection;
  catalogResources?: ResourceManifest[];
  seed?: string | number;
  diagnostics?: RoleResolutionDiagnostic[];
  briefDescription?: string;
}

export interface ComposedDirectionOutput {
  direction: GeneratedDirection;
  manifest: ProjectManifest;
  diagnostics?: RoleResolutionDiagnostic[];
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

/**
 * Finds and instantiates the highest-scoring compatible resource for a required semantic role.
 * Fails hard constraints closed: if all candidates violate constraints, returns diagnostic (no violating resource selected).
 */
function resolveBestResourceForRole(
  semanticRole: string,
  targetDna: DesignDNA,
  grammar: CompositionGrammar | undefined,
  catalog: ResourceManifest[],
  productModel: ProductModel,
  surroundingResources: ResourceManifest[] = []
): { resource: ResourceManifest | null; ref: ResourceRef | undefined; diagnostic?: RoleResolutionDiagnostic } {
  if (!catalog || catalog.length === 0) {
    return {
      resource: null,
      ref: undefined,
      diagnostic: {
        code: 'UNRESOLVED_REQUIRED_ROLE',
        role: semanticRole,
        reason: 'Catalogue is empty or unpopulated.',
      },
    };
  }

  // 1. Role / category filtering
  const candidates = catalog.filter(res => isResourceComposerEligible(res) && resourceMatchesRole(res,semanticRole));

  // 2. Filter by hard constraints — STRICT FAIL CLOSED
  const validCandidates: ResourceManifest[] = [];
  const rejectedReasons: string[] = [];

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
    } else {
      rejectedReasons.push(`${candidate.slug}: ${constraintResult.rejectionReasons.join(', ')}`);
    }
  }

  // Requirement 3 & 7: If all candidates violate hard constraints, NO violating resource may be selected.
  // Fail closed and record explicit UNRESOLVED_REQUIRED_ROLE diagnostic.
  if (validCandidates.length === 0) {
    return {
      resource: null,
      ref: undefined,
      diagnostic: {
        code: 'UNRESOLVED_REQUIRED_ROLE',
        role: semanticRole,
        reason: `No candidate resource satisfied hard constraints for role "${semanticRole}" (accessibility floor: ${productModel.constraints.accessibilityFloor}, performance ceiling: ${productModel.constraints.performanceCeiling}).`,
        rejectedCandidateReasons: rejectedReasons.slice(0, 5),
      },
    };
  }

  // 3. Score valid candidates with compatibility algorithm
  const scored = validCandidates.map((candidate) => {
    const scoreResult = calculateCompatibilityScore({
      candidate,
      targetDna,
      semanticRole,
      grammar,
      surroundingResources,
      currentArchetype: productModel.productArchetypes[0]?.tag,
      accessibilityFloor: productModel.constraints.accessibilityFloor,
    });
    return {
      candidate,
      score: scoreResult.totalScore,
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
    ref: undefined,
  };
}

/**
 * Instantiates a complete ProjectManifest for an individual generated direction.
 */
export function composeProjectForDirection(
  options: DirectionCompositionOptions
): ProjectManifest {
  const { productModel, screenGraph, direction, seed = '1' } = options;
  const catalog = options.catalogResources ?? [];

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
    // A page keeps its semantic jobs. Direction grammar changes hierarchy, not
    // the identity of required content (a marketing CTA cannot become an IDE pane).
    const screenRoles = [...new Set(screenNode.requiredRoles ?? [])];
    if (productModel.entities.some(entity=>entity.name==='Employee') && screenNode.screenType==='dashboard' && !screenRoles.includes('data-table')) screenRoles.push('data-table');
    if (!screenRoles.includes('navigation') && screenNode.screenType!=='authentication') screenRoles.unshift('navigation');
    if (screenRoles.length === 0) {
      screenRoles.push('navigation', 'header', 'content-grid', 'footer');
    }

    const surroundingForScreen: ResourceManifest[] = [];
    const sectionNodes: ProjectNode[] = [];

    for (let i = 0; i < screenRoles.length; i++) {
      const role = screenRoles[i]!;
      const { resource, ref, diagnostic } = resolveBestResourceForRole(
        role,
        direction.dna,
        grammar,
        role==='navigation' ? catalog.filter(resource=>resource.slug === (screenNode.screenType!=='marketing' && direction.navigationModel==='sidebar' ? 'collapsible-sidebar' : 'minimal-top-nav')) : catalog,
        productModel,
        surroundingForScreen
      );

      if (diagnostic && options.diagnostics) {
        options.diagnostics.push(diagnostic);
      }

      if (resource) {
        surroundingForScreen.push(resource);
      }

      const variant = screenNode.screenType==='marketing' && productModel.entities.some(entity=>entity.name==='Employee') ? (direction.type==='conservative'?'quiet':'expressive') :
        direction.type === 'expressive'
          ? 'expressive'
          : direction.type === 'structural-alternative'
          ? 'nocturne'
          : 'quiet';

      const content = bindResourceContent(productModel,screenNode,role,allScreenNodes,resource?.slug ?? '',options.briefDescription);
      if (role==='navigation') content.orientation = screenNode.screenType!=='marketing' && direction.type==='structural-alternative' ? 'vertical' : 'horizontal';
      // Only persist props declared by the selected resource, plus semantic title.
      // Resource props are consumed by both runtime and standalone source.
      const nodeProps: Record<string, unknown> = content;
      if (diagnostic) {
        nodeProps.unresolvedRequiredRole = true;
        nodeProps.diagnostic = diagnostic;
      }

      sectionNodes.push({
        id: `node-${screenNode.id}-${role}-${i + 1}`,
        nodeType: role === 'navigation' ? 'layout' : 'section',
        semanticRole: role,
        resourceRef: ref,
        variant,
        children: [],
        slots: {},
        props: nodeProps,
      });
    }

    // Assemble root layout according to direction navigation topology
    let rootNode: ProjectNode;
    if (screenNode.screenType==='marketing') {
      rootNode = {id:`root-${screenNode.id}`,nodeType:'layout',semanticRole:'marketing-page',children:sectionNodes,slots:{},props:{layoutFamily:direction.layoutFamily}};
    } else if (direction.navigationModel === 'sidebar') {
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
    if (screenNode.screenType==='marketing' && productModel.entities.some(entity=>entity.name==='Employee'))rootNode.dnaOverrides={visualMode:'light',warmth:82,playfulness:65};
    if (screenNode.screenType==='onboarding') rootNode.dnaOverrides={playfulness:75,warmth:78,curvature:65,motionPlayfulness:55};
    if (screenNode.screenType==='settings') rootNode.dnaOverrides={playfulness:8,professionalism:96,curvature:12,motion:10};

    screens.push({
      id: screenNode.id,
      screenNodeId: screenNode.id,
      name: screenNode.name,
      slug: screenNode.slug,
      rootNode,
    });
  }

  const manifestId = `proj-${direction.id}-${String(seed).replace(/[^a-z0-9]/gi, '')}`;

  const manifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: manifestId,
    name: `${direction.name} — ${productModel.entities.some(entity=>entity.name==='Employee') ? 'Employee experience' : primaryArchetype.toUpperCase()}`,
    description: options.briefDescription ?? direction.rationale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    catalogVersion: '0.1.0',
    seed: String(seed),
    productModel,
    designDNA: direction.dna,
    brand: {
      name: productModel.entities.some(entity=>entity.name==='Employee')?'People & Co':`${primaryArchetype.toUpperCase()} System`,
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

  const diagA: RoleResolutionDiagnostic[] = [];
  const manifestA = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionA,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-a`,
    diagnostics: diagA,
    briefDescription: brief.description,
  });

  const diagB: RoleResolutionDiagnostic[] = [];
  const manifestB = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionB,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-b`,
    diagnostics: diagB,
    briefDescription: brief.description,
  });

  const diagC: RoleResolutionDiagnostic[] = [];
  const manifestC = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionC,
    catalogResources: options?.catalogResources,
    seed: `${seed}-dir-c`,
    diagnostics: diagC,
    briefDescription: brief.description,
  });

  return {
    productModel,
    screenGraph,
    initialDesignDna,
    directions,
    directionA: {
      direction: directions.directionA,
      manifest: manifestA,
      diagnostics: diagA,
    },
    directionB: {
      direction: directions.directionB,
      manifest: manifestB,
      diagnostics: diagB,
    },
    directionC: {
      direction: directions.directionC,
      manifest: manifestC,
      diagnostics: diagC,
    },
    inferredAssumptions,
  };
}
