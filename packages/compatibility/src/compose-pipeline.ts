import {
  type ProductModel,
  type ScreenGraph,
  type DesignDNA,
  type ProjectManifest,
  type ProjectScreen,
  type ProjectNode,
  type ResourceManifest,
  type ResourceRef,
  type ScreenNode,
  ProjectManifestSchema,
  ProductModelSchema,
  ScreenGraphSchema,
} from '@tessellate/schemas';
import {
  interpretProductBrief,
  planScreenGraph,
  designDnaForProductModel,
  resourceFulfilsRole,
  roleLabel,
  SCREEN_CLASS_GRAMMARS,
  type ProductBriefInput,
} from '@tessellate/composer';
import { buildContentProps } from './content.js';
import {
  generateDirections,
  type GeneratedDirection,
  type DirectionGenerationResult,
} from './direction-generator.js';
import { getCompositionGrammar, type CompositionGrammar } from './grammars.js';
import { SeededRandom } from './prng.js';
import { evaluateHardConstraints } from './hard-constraints.js';
import { calculateCompatibilityScore } from './scoring.js';
import {
  isResourceComposerEligible,
  isResourceCompositionCapable,
} from './capabilities.js';
export { isResourceComposerEligible, isResourceCompositionCapable };

export interface RoleResolutionDiagnostic {
  code: 'UNRESOLVED_REQUIRED_ROLE';
  role: string;
  /** Plain-language role name for gap cards. */
  label?: string;
  screenId?: string;
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
  /** Project id for the composed manifest. Callers creating user projects must pass a unique id. */
  projectId?: string;
  /** The client's product name; used for the brand, navigation and copy. Never Tessellate's name. */
  productName?: string;
  /** Runtime capability check: only resources the renderer can mount are placed (when provided). */
  isRenderable?: (slug: string) => boolean;
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

/** Optional sections each direction adds when the catalogue can fill them (directions differ in richness). */
const OPTIONAL_SECTIONS_BY_DIRECTION: Record<GeneratedDirection['type'], number> = {
  conservative: 0,
  'structural-alternative': 1,
  expressive: 2,
};

/**
 * Picks the best resource for one canonical role (Phase 29). Only resources the role taxonomy lists as
 * fulfilling the role are considered — no category bypass, no whole-catalogue fallback — and resources
 * already used on the same screen are excluded. Returns a diagnostic when nothing qualifies.
 */
function resolveBestResourceForRole(
  semanticRole: string,
  targetDna: DesignDNA,
  grammar: CompositionGrammar | undefined,
  catalog: ResourceManifest[],
  productModel: ProductModel,
  surroundingResources: ResourceManifest[] = [],
  isRenderable?: (slug: string) => boolean
): { resource: ResourceManifest | null; ref: ResourceRef | undefined; diagnostic?: RoleResolutionDiagnostic } {
  const label = roleLabel(semanticRole);
  const usedOnScreen = new Set(surroundingResources.map((r) => r.slug));
  const candidates = catalog.filter(
    (res) =>
      resourceFulfilsRole(semanticRole, res) &&
      !usedOnScreen.has(res.slug) &&
      isResourceComposerEligible(res) &&
      (!isRenderable || isRenderable(res.slug))
  );

  if (candidates.length === 0) {
    return {
      resource: null,
      ref: undefined,
      diagnostic: {
        code: 'UNRESOLVED_REQUIRED_ROLE',
        role: semanticRole,
        label,
        reason: `The library has no resource for "${label}" yet. Pick or add one in the Workbench.`,
      },
    };
  }

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
    if (constraintResult.pass) validCandidates.push(candidate);
    else rejectedReasons.push(`${candidate.slug}: ${constraintResult.rejectionReasons.join(', ')}`);
  }

  // Fail closed: never select a resource that violates a hard constraint.
  if (validCandidates.length === 0) {
    return {
      resource: null,
      ref: undefined,
      diagnostic: {
        code: 'UNRESOLVED_REQUIRED_ROLE',
        role: semanticRole,
        label,
        reason: `${candidates.length} library resource${candidates.length === 1 ? '' : 's'} can be "${label}", but none ${candidates.length === 1 ? 'meets' : 'meet'} this product's ${describeConstraints(productModel)}. Lower the requirement in Review, or pick a resource in the Workbench.`,
        rejectedCandidateReasons: rejectedReasons.slice(0, 5),
      },
    };
  }

  const scored = validCandidates
    .map((candidate) => ({
      candidate,
      score: calculateCompatibilityScore({
        candidate,
        targetDna,
        semanticRole,
        grammar,
        surroundingResources,
        currentArchetype: productModel.productArchetypes[0]?.tag,
        accessibilityFloor: productModel.constraints.accessibilityFloor,
      }).totalScore,
    }))
    // Stable tie-break on slug so composition is reproducible.
    .sort((x, y) => y.score - x.score || x.candidate.slug.localeCompare(y.candidate.slug));
  const best = scored[0]!.candidate;
  return { resource: best, ref: { id: best.id, slug: best.slug, version: best.version } };
}

function describeConstraints(productModel: ProductModel): string {
  const { accessibilityFloor, performanceCeiling } = productModel.constraints;
  return performanceCeiling ? `WCAG ${accessibilityFloor} and ${performanceCeiling} performance limits` : `WCAG ${accessibilityFloor} requirement`;
}

/** Section roles for one screen: its own screen-class grammar plus the navigation its group needs. */
export function rolesForScreen(screenNode: ScreenNode, optionalCount: number): { required: string[]; optional: string[] } {
  const grammar = SCREEN_CLASS_GRAMMARS[screenNode.screenType];
  const group = grammar?.defaultGroup ?? 'app';
  const shell = group === 'app' || group === 'settings' ? ['app-navigation'] : group === 'utility' ? ['navigation'] : [];
  const required = [...new Set([...shell, ...(grammar?.requiredRoles ?? ['page-header']), ...(screenNode.requiredRoles ?? [])])];
  const optional = [...(grammar?.optionalRoles ?? []), ...(screenNode.optionalRoles ?? [])]
    .filter((r) => !required.includes(r))
    .slice(0, optionalCount);
  return { required, optional };
}

function isAppScreen(screenNode: ScreenNode): boolean {
  const group = SCREEN_CLASS_GRAMMARS[screenNode.screenType]?.defaultGroup ?? 'app';
  return group === 'app' || group === 'settings';
}

/**
 * Instantiates a complete ProjectManifest for an individual generated direction.
 */
export function composeProjectForDirection(options: DirectionCompositionOptions): ProjectManifest {
  const { productModel, screenGraph, direction, seed = '1' } = options;
  const catalog = options.catalogResources ?? [];
  const productName = options.productName?.trim() || 'Your product';

  const directionGrammar = getCompositionGrammar(direction.primaryGrammarId);
  const screens: ProjectScreen[] = [];
  const allScreenNodes = screenGraph.groups.flatMap((g) => g.screens);
  const navItems = allScreenNodes
    .filter((s) => s.navigationVisibility === 'primary')
    .map((s) => ({ label: s.name, href: s.slug }));
  const variant = direction.type === 'expressive' ? 'expressive' : direction.type === 'structural-alternative' ? 'nocturne' : 'quiet';

  for (const screenNode of allScreenNodes) {
    // The direction's grammar shapes application screens only; marketing, auth and public journeys keep
    // their own screen-class grammar (Phase 29).
    const grammar = isAppScreen(screenNode) ? directionGrammar : undefined;
    const { required, optional } = rolesForScreen(screenNode, OPTIONAL_SECTIONS_BY_DIRECTION[direction.type]);
    const surroundingForScreen: ResourceManifest[] = [];
    const sectionNodes: ProjectNode[] = [];
    const contentContext = { productName, productModel, screen: screenNode, navItems };

    const place = (role: string, isRequired: boolean) => {
      const { resource, ref, diagnostic } = resolveBestResourceForRole(
        role,
        direction.dna,
        grammar,
        catalog,
        productModel,
        surroundingForScreen,
        options.isRenderable
      );
      if (!resource && !isRequired) return; // optional sections are only added when the library can fill them
      if (resource) surroundingForScreen.push(resource);
      if (diagnostic && options.diagnostics) options.diagnostics.push({ ...diagnostic, screenId: screenNode.id });

      const props: Record<string, unknown> = buildContentProps(role, contentContext);
      if (diagnostic) {
        props.unresolvedRequiredRole = true;
        props.diagnostic = { ...diagnostic, screenId: screenNode.id };
      }
      sectionNodes.push({
        id: `node-${screenNode.id}-${role}`,
        nodeType: role === 'navigation' || role === 'app-navigation' ? 'layout' : 'section',
        semanticRole: role,
        resourceRef: ref,
        variant: resource ? variant : undefined,
        children: [],
        slots: {},
        props,
      });
    };
    for (const role of required) place(role, true);
    for (const role of optional) place(role, false);

    const navNode = sectionNodes.find((n) => n.semanticRole === 'app-navigation');
    let rootNode: ProjectNode;
    if (navNode) {
      const contentNodes = sectionNodes.filter((n) => n !== navNode);
      const dock = direction.navigationModel === 'command-palette' || direction.navigationModel === 'rail';
      rootNode = {
        id: `root-${screenNode.id}`,
        nodeType: 'layout',
        semanticRole: dock ? 'workspace-dock-shell' : 'sidebar-shell',
        children: [
          navNode,
          {
            id: `container-${screenNode.id}-main`,
            nodeType: 'layout',
            semanticRole: dock ? 'workspace-multi-pane' : 'main-content-scroll',
            children: contentNodes,
            slots: {},
            props: { layoutFamily: grammar?.layoutFamily ?? 'standard-sidebar' },
          },
        ],
        slots: {},
        props: { layoutVariant: dock ? 'split-dock' : 'sidebar' },
      };
    } else {
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

  // Deterministic fallback for tests/tooling; user-facing callers pass a unique projectId (Phase 25).
  const manifestId =
    options.projectId ??
    `proj-${direction.id}-${SeededRandom.hashString(`${seed}|${JSON.stringify(productModel)}`).toString(36)}`;
  const now = new Date().toISOString();

  const manifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: manifestId,
    name: `${productName} — ${direction.name}`,
    description: direction.rationale,
    createdAt: now,
    updatedAt: now,
    catalogVersion: '0.1.0',
    seed: String(seed),
    productModel,
    designDNA: direction.dna,
    brand: { name: productName },
    constraints: productModel.constraints,
    screenGraph,
    screens,
    navigation: {
      model: direction.navigationModel,
      primaryItems: allScreenNodes
        .filter((s) => s.navigationVisibility === 'primary')
        .map((s) => ({ label: s.name, targetScreenId: s.id })),
    },
    assets: [],
    locks: [],
    historyMeta: { totalOperations: 0, headRevision: 0 },
    exportSettings: { framework: 'react', styling: 'tailwind', includeTypes: true, target: 'vite-react-tailwind' },
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
  /**
   * `projectIdBase`: base for the three direction project ids. Pass a fresh unique value for every user
   * compose so a new composition can never overwrite an existing project. When omitted, ids are derived
   * from the brief and seed, so different briefs never collide.
   */
  options?: CompositionOptions
): FullCompositionResult {
  const seed = options?.seed ?? 'tessellate-seed-v1';
  const idBase =
    options?.projectIdBase ?? `proj-${SeededRandom.hashString(`${seed}|${JSON.stringify(brief)}`).toString(36)}`;
  const { productModel, inferredAssumptions, initialDesignDna } = interpretProductBrief(brief);
  const { screenGraph } = planScreenGraph(productModel);
  return composeDirections({ productModel, screenGraph, initialDesignDna, inferredAssumptions }, { ...options, seed, projectIdBase: idBase });
}

export interface CompositionOptions {
  catalogResources?: ResourceManifest[];
  seed?: string | number;
  projectIdBase?: string;
  productName?: string;
  isRenderable?: (slug: string) => boolean;
}

/**
 * Mechanical composition (not intelligence, D-033): given an interpreted product, generate the three
 * directions and compose a manifest for each.
 */
export function composeDirections(
  input: { productModel: ProductModel; screenGraph: ScreenGraph; initialDesignDna: DesignDNA; inferredAssumptions: string[] },
  options?: CompositionOptions
): FullCompositionResult {
  const { productModel, screenGraph, initialDesignDna, inferredAssumptions } = input;
  const seed = options?.seed ?? 'tessellate-seed-v1';
  const idBase =
    options?.projectIdBase ?? `proj-${SeededRandom.hashString(`${seed}|${JSON.stringify(productModel)}`).toString(36)}`;

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
    productName: options?.productName,
    isRenderable: options?.isRenderable,
    seed: `${seed}-dir-a`,
    diagnostics: diagA,
    projectId: `${idBase}-${directions.directionA.id}`,
  });

  const diagB: RoleResolutionDiagnostic[] = [];
  const manifestB = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionB,
    catalogResources: options?.catalogResources,
    productName: options?.productName,
    isRenderable: options?.isRenderable,
    seed: `${seed}-dir-b`,
    diagnostics: diagB,
    projectId: `${idBase}-${directions.directionB.id}`,
  });

  const diagC: RoleResolutionDiagnostic[] = [];
  const manifestC = composeProjectForDirection({
    productModel,
    screenGraph,
    direction: directions.directionC,
    catalogResources: options?.catalogResources,
    productName: options?.productName,
    isRenderable: options?.isRenderable,
    seed: `${seed}-dir-c`,
    diagnostics: diagC,
    projectId: `${idBase}-${directions.directionC.id}`,
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

/** Interpretation produced by the host daemon (D-033) after the user has reviewed it. */
export interface ReviewedInterpretation {
  productModel: ProductModel;
  screenGraph: ScreenGraph;
  feel?: string;
  assumptions?: string[];
}

/**
 * Composes three directions from a daemon interpretation. Design DNA is derived mechanically from the
 * ProductModel priors, the feel and the creativity controls.
 */
export function composeFromInterpretation(
  interpretation: ReviewedInterpretation,
  options?: CompositionOptions & { visualAmbition?: number; structuralCreativity?: number; feel?: string }
): FullCompositionResult {
  const productModel = ProductModelSchema.parse(interpretation.productModel);
  const screenGraph = ScreenGraphSchema.parse(interpretation.screenGraph);
  const initialDesignDna = designDnaForProductModel(productModel, {
    feel: options?.feel ?? interpretation.feel,
    visualAmbition: options?.visualAmbition,
    structuralCreativity: options?.structuralCreativity,
    accessibilityFloor: productModel.constraints.accessibilityFloor,
    performanceCeiling: productModel.constraints.performanceCeiling,
  });
  return composeDirections(
    { productModel, screenGraph, initialDesignDna, inferredAssumptions: interpretation.assumptions ?? [] },
    options
  );
}
