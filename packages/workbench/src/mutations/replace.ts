import type {
  ProjectManifest,
  ProjectNode,
  ResourceManifest,
  HistoryOperation,
  ProjectMutation,
} from '@tessellate/schemas';
import { calculateCompatibilityScore } from '@tessellate/compatibility';
import { findNodeById } from '../utils/tree-helpers.js';
import { createHistoryOperation } from '../history/history-manager.js';

export interface ReplaceCandidate {
  resource: ResourceManifest;
  compatibilityScore: number;
  rationale: string;
  performanceDelta: number;
  ambitionDelta: number;
  defaultVariant?: string;
}

export interface AlternativeCandidate {
  resource: ResourceManifest;
  relationType: string;
  compatibilityScore: number;
  variant?: string;
}

/**
 * Curated in-memory catalog resources for the workbench composition and replace flows.
 */
export const SAMPLE_RESOURCES: ResourceManifest[] = [
  {
    schemaVersion: '0.1.0',
    id: 'res-button-01',
    slug: 'button',
    name: 'Command Button',
    version: '1.0.0',
    status: 'verified',
    description: 'Precision typographic button with subtle hairline border and tactile press feedback.',
    resourceType: 'primitive',
    categories: ['primitives', 'buttons'],
    roles: ['action-button', 'primary-action', 'secondary-action'],
    purposes: ['marketing', 'application'],
    productArchetypes: [{ tag: 'fintech', weight: 95 }, { tag: 'saas', weight: 90 }],
    creator: { id: 'tess-core', displayName: 'Tessellate Core', handle: 'tessellate' },
    provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'none' },
    license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [{ path: 'index.tsx', kind: 'component', required: true }],
    registry: { name: '@tess/button', dependencies: [], devDependencies: [], registryDependencies: [] },
    preview: { component: 'ButtonPreview', defaultProps: { label: 'Submit' }, viewport: 360 },
    slots: [{ id: 'label', name: 'Button Label', type: 'text', required: true, defaultValue: 'Execute' }],
    variants: [{ id: 'var-btn-primary', name: 'primary', description: 'Solid primary accent' }, { id: 'var-btn-outline', name: 'outline', description: 'Bordered hairline' }],
    tags: ['button', 'action'],
    intent: { summary: 'Standard interactive button trigger', idealFor: ['fintech', 'saas'], avoidFor: [], jobs: ['action-button', 'execute-action'], contentRequirements: [] },
    visualDNA: { visualAmbition: 40, curvature: 20 },
    interactionDNA: { interactionDensity: 60, motionIntensity: 25, keyboardComplexity: 'low', hoverDependency: 'none', directManipulation: false },
    layoutDNA: { density: 75, whitespace: 40, asymmetry: 0, preferredWidths: ['narrow'], layoutFamilies: ['standard'] },
    responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'compress' },
    accessibility: { levelTarget: 'AA', keyboardVerified: true, screenReaderSemantics: true, reducedMotionVerified: true, contrastTokenCompatible: true, focusVisible: true },
    performance: { jsCost: 'tiny', gpuCost: 'none', mediaCost: 'none', runtimeComplexity: 'low', lazyRecommended: false, continuousAnimation: false },
    complexity: 'low',
    customizability: 'high',
    compatibility: {},
    relationships: [
      { type: 'ALTERNATIVE_TO', target: 'res-button-ghost-02', notes: 'Ghost alternative' },
    ],
    quality: { overall: 92, accessibility: 95, responsive: 95, performance: 98, codeQuality: 95, composability: 95, visualCraft: 90, dependencyCleanliness: 100, documentation: 90 },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    schemaVersion: '0.1.0',
    id: 'res-button-ghost-02',
    slug: 'ghost-button',
    name: 'Ghost Pill Action',
    version: '1.0.0',
    status: 'verified',
    description: 'Subtle transparent button with pill curvature and soft hover state.',
    resourceType: 'primitive',
    categories: ['primitives', 'buttons'],
    roles: ['action-button', 'secondary-action'],
    purposes: ['application'],
    productArchetypes: [{ tag: 'fintech', weight: 80 }, { tag: 'saas', weight: 85 }],
    creator: { id: 'tess-core', displayName: 'Tessellate Core', handle: 'tessellate' },
    provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'none' },
    license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [{ path: 'index.tsx', kind: 'component', required: true }],
    registry: { name: '@tess/ghost-button', dependencies: [], devDependencies: [], registryDependencies: [] },
    preview: { component: 'GhostButtonPreview', defaultProps: { label: 'Cancel' }, viewport: 360 },
    slots: [{ id: 'label', name: 'Button Label', type: 'text', required: true, defaultValue: 'Cancel' }],
    variants: [{ id: 'var-btn-ghost', name: 'ghost', description: 'Transparent with soft border' }],
    tags: ['button', 'ghost'],
    intent: { summary: 'Subtle secondary action trigger', idealFor: ['fintech', 'saas'], avoidFor: [], jobs: ['action-button'], contentRequirements: [] },
    visualDNA: { visualAmbition: 65, curvature: 100 },
    interactionDNA: { interactionDensity: 50, motionIntensity: 20, keyboardComplexity: 'low', hoverDependency: 'none', directManipulation: false },
    layoutDNA: { density: 60, whitespace: 50, asymmetry: 0, preferredWidths: ['narrow'], layoutFamilies: ['standard'] },
    responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'compress' },
    accessibility: { levelTarget: 'AA', keyboardVerified: true, screenReaderSemantics: true, reducedMotionVerified: true, contrastTokenCompatible: true, focusVisible: true },
    performance: { jsCost: 'tiny', gpuCost: 'none', mediaCost: 'none', runtimeComplexity: 'low', lazyRecommended: false, continuousAnimation: false },
    complexity: 'low',
    customizability: 'high',
    compatibility: {},
    relationships: [{ type: 'ALTERNATIVE_TO', target: 'res-button-01' }],
    quality: { overall: 90, accessibility: 92, responsive: 95, performance: 98, codeQuality: 92, composability: 95, visualCraft: 90, dependencyCleanliness: 100, documentation: 90 },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    schemaVersion: '0.1.0',
    id: 'res-metric-card-01',
    slug: 'metric-card',
    name: 'Executive Metric Card',
    version: '1.0.0',
    status: 'verified',
    description: 'High-density numeric KPI card with trend chip and baseline context.',
    resourceType: 'component',
    categories: ['data', 'cards'],
    roles: ['metric-kpi', 'kpi-summary-grid'],
    purposes: ['application', 'dashboard'],
    productArchetypes: [{ tag: 'fintech', weight: 95 }, { tag: 'analytics', weight: 90 }],
    creator: { id: 'tess-core', displayName: 'Tessellate Core', handle: 'tessellate' },
    provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'none' },
    license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [{ path: 'index.tsx', kind: 'component', required: true }],
    registry: { name: '@tess/metric-card', dependencies: [], devDependencies: [], registryDependencies: [] },
    preview: { component: 'MetricCardPreview', defaultProps: { label: 'ARR', value: '$10M' }, viewport: 360 },
    slots: [{ id: 'title', name: 'KPI Title', type: 'text', required: true }, { id: 'value', name: 'Primary Metric', type: 'text', required: true }],
    variants: [{ id: 'var-metric-default', name: 'default', description: 'Standard metric card' }, { id: 'var-metric-dense', name: 'dense', description: 'Ultra-compact terminal view' }],
    tags: ['metric', 'kpi'],
    intent: { summary: 'Display headline metric with delta indicator', idealFor: ['fintech', 'analytics'], avoidFor: [], jobs: ['metric-kpi'], contentRequirements: [] },
    visualDNA: { visualAmbition: 50, curvature: 25 },
    interactionDNA: { interactionDensity: 70, motionIntensity: 20, keyboardComplexity: 'low', hoverDependency: 'none', directManipulation: false },
    layoutDNA: { density: 85, whitespace: 35, asymmetry: 0, preferredWidths: ['narrow', 'content'], layoutFamilies: ['standard'] },
    responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'compress' },
    accessibility: { levelTarget: 'AA', keyboardVerified: true, screenReaderSemantics: true, reducedMotionVerified: true, contrastTokenCompatible: true, focusVisible: true },
    performance: { jsCost: 'low', gpuCost: 'none', mediaCost: 'none', runtimeComplexity: 'low', lazyRecommended: false, continuousAnimation: false },
    complexity: 'medium',
    customizability: 'medium',
    compatibility: {},
    relationships: [{ type: 'SAME_FAMILY', target: 'res-chart-area-01' }],
    quality: { overall: 94, accessibility: 95, responsive: 95, performance: 95, codeQuality: 95, composability: 95, visualCraft: 94, dependencyCleanliness: 100, documentation: 92 },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    schemaVersion: '0.1.0',
    id: 'res-chart-area-01',
    slug: 'area-chart',
    name: 'Sparkline Area Horizon',
    version: '1.0.0',
    status: 'verified',
    description: 'Gradient fill continuous timeline chart with hover tooltip crosshair.',
    resourceType: 'section',
    categories: ['data', 'charts'],
    roles: ['data-chart', 'chart-panel'],
    purposes: ['dashboard', 'analytics'],
    productArchetypes: [{ tag: 'fintech', weight: 95 }, { tag: 'analytics', weight: 95 }],
    creator: { id: 'tess-core', displayName: 'Tessellate Core', handle: 'tessellate' },
    provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'none' },
    license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [{ path: 'index.tsx', kind: 'component', required: true }],
    registry: { name: '@tess/area-chart', dependencies: [], devDependencies: [], registryDependencies: [] },
    preview: { component: 'AreaChartPreview', defaultProps: { title: 'Performance' }, viewport: 768 },
    slots: [{ id: 'title', name: 'Chart Title', type: 'text', required: true }],
    variants: [{ id: 'var-chart-gradient', name: 'gradient-fill', description: 'Smooth gradient fill under curve' }],
    tags: ['chart', 'data', 'area'],
    intent: { summary: 'Historical timeline trend visualization', idealFor: ['fintech', 'analytics'], avoidFor: [], jobs: ['data-chart'], contentRequirements: [] },
    visualDNA: { visualAmbition: 70, curvature: 20 },
    interactionDNA: { interactionDensity: 80, motionIntensity: 35, keyboardComplexity: 'medium', hoverDependency: 'optional', directManipulation: true },
    layoutDNA: { density: 80, whitespace: 40, asymmetry: 0, preferredWidths: ['wide', 'full'], layoutFamilies: ['standard'] },
    responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'compress' },
    accessibility: { levelTarget: 'AA', keyboardVerified: true, screenReaderSemantics: true, reducedMotionVerified: true, contrastTokenCompatible: true, focusVisible: true },
    performance: { jsCost: 'low', gpuCost: 'low', mediaCost: 'none', runtimeComplexity: 'medium', lazyRecommended: true, continuousAnimation: false },
    complexity: 'medium',
    customizability: 'high',
    compatibility: {},
    relationships: [{ type: 'SAME_FAMILY', target: 'res-metric-card-01' }],
    quality: { overall: 91, accessibility: 90, responsive: 92, performance: 90, codeQuality: 92, composability: 92, visualCraft: 94, dependencyCleanliness: 100, documentation: 90 },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
];

export function getAvailableResources(): ResourceManifest[] {
  return SAMPLE_RESOURCES;
}

/**
 * Finds compatible replacement resources for a selected node from the catalog.
 */
export function getReplaceCandidates(
  manifest: ProjectManifest,
  nodeId: string,
  catalog: ResourceManifest[] = SAMPLE_RESOURCES
): ReplaceCandidate[] {
  let targetNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      targetNode = found;
      break;
    }
  }

  if (!targetNode) return [];

  const currentResource = catalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const currentAmbition = currentResource?.visualDNA?.visualAmbition ?? manifest.designDNA.visualAmbition;
  const currentPerfScore = currentResource?.quality?.performance ?? 80;

  const candidates: ReplaceCandidate[] = [];

  for (const res of catalog) {
    // Skip if it's the current exact resource
    if (res.id === targetNode.resourceRef?.id) continue;

    // Check role or category match
    const roleMatch =
      res.roles.includes(targetNode.semanticRole) ||
      res.resourceType === targetNode.nodeType ||
      res.roles.some((r: string) => r.toLowerCase().includes(targetNode!.semanticRole.toLowerCase())) ||
      targetNode.semanticRole.toLowerCase().includes(res.resourceType.toLowerCase());

    if (!roleMatch) continue;

    // Calculate score
    const scoreResult = calculateCompatibilityScore({
      candidate: res,
      targetDna: manifest.designDNA,
      semanticRole: targetNode.semanticRole,
      currentArchetype: manifest.productModel.productArchetypes[0]?.tag,
      accessibilityFloor: manifest.constraints.accessibilityFloor,
    });

    const resAmbition = res.visualDNA?.visualAmbition ?? 50;
    const resPerf = res.quality?.performance ?? 80;

    candidates.push({
      resource: res,
      compatibilityScore: scoreResult.totalScore,
      rationale: scoreResult.rationale[0] ?? `Matches role "${targetNode.semanticRole}"`,
      performanceDelta: resPerf - currentPerfScore,
      ambitionDelta: resAmbition - currentAmbition,
      defaultVariant: res.variants[0]?.name ?? 'default',
    });
  }

  return candidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Retrieves explicit alternative resources and variants for a selected node.
 */
export function getAlternativeCandidates(
  manifest: ProjectManifest,
  nodeId: string,
  catalog: ResourceManifest[] = SAMPLE_RESOURCES
): AlternativeCandidate[] {
  let targetNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      targetNode = found;
      break;
    }
  }

  if (!targetNode) return [];

  const currentResource = catalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const results: AlternativeCandidate[] = [];

  if (currentResource) {
    // 1. Other variants of the current resource
    for (const v of currentResource.variants) {
      if (v.name !== targetNode.variant) {
        results.push({
          resource: currentResource,
          relationType: 'VARIANT',
          compatibilityScore: 95,
          variant: v.name,
        });
      }
    }

    // 2. Direct relationships declared in resource manifest
    for (const rel of currentResource.relationships) {
      const related = catalog.find((r: ResourceManifest) => r.id === rel.target || r.slug === rel.target);
      if (related) {
        results.push({
          resource: related,
          relationType: rel.type,
          compatibilityScore: 85,
          variant: related.variants[0]?.name ?? 'default',
        });
      }
    }
  }

  // 3. Fallback to top replace candidates if no direct relationships declared
  if (results.length === 0) {
    const topReplacements = getReplaceCandidates(manifest, nodeId, catalog).slice(0, 3);
    for (const rep of topReplacements) {
      results.push({
        resource: rep.resource,
        relationType: 'COMPATIBLE_ALTERNATIVE',
        compatibilityScore: rep.compatibilityScore,
        variant: rep.defaultVariant,
      });
    }
  }

  return results;
}

/**
 * Constructs a HistoryOperation to replace a target node with a new resource.
 */
export function createReplaceOperation(
  manifest: ProjectManifest,
  nodeId: string,
  replacementResource: ResourceManifest,
  variant?: string
): HistoryOperation {
  let originalNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      originalNode = found;
      break;
    }
  }

  const defaultSlots: Record<string, unknown> = {};
  for (const slot of replacementResource.slots) {
    if (slot.defaultValue !== undefined) {
      defaultSlots[slot.id] = slot.defaultValue;
    }
  }

  const replacementNode: ProjectNode = {
    id: nodeId, // preserve ID so tree references and locks stay stable
    nodeType: replacementResource.resourceType === 'primitive' ? 'element' : (replacementResource.resourceType as ProjectNode['nodeType']),
    semanticRole: originalNode?.semanticRole ?? replacementResource.roles[0] ?? 'component',
    resourceRef: {
      id: replacementResource.id,
      slug: replacementResource.slug,
      version: replacementResource.version,
    },
    variant: variant ?? replacementResource.variants[0]?.name ?? 'default',
    slots: {
      ...defaultSlots,
      ...(originalNode?.slots ?? {}),
    },
    props: {
      ...(originalNode?.props ?? {}),
    },
    children: originalNode?.children ?? [],
    locks: originalNode?.locks,
    dnaOverrides: originalNode?.dnaOverrides,
  };

  const mutation: ProjectMutation = {
    id: `mut-replace-${Date.now()}`,
    type: 'REPLACE_NODE',
    targetId: nodeId,
    payload: {
      targetNodeId: nodeId,
      replacementNode,
    },
    actor: 'user',
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  };

  return createHistoryOperation(
    `Replaced with "${replacementResource.name}"`,
    [mutation],
    'user',
    [nodeId]
  );
}
