import { describe, it, expect } from 'vitest';
import * as crypto from 'node:crypto';
import type { ProjectNode } from '@tessellate/schemas';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { createSampleProject } from '../store/sample-project.js';
import { surpriseMe } from '../mutations/surprise.js';
import { HistoryManager } from '../history/history-manager.js';
import { executeMutation } from '../mutations/executor.js';
import { findNodeById } from '../utils/tree-helpers.js';

function computeCanonicalSubtreeHash(node: ProjectNode): string {
  function canonicalize(val: unknown): unknown {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(canonicalize);
    const sortedObj: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sortedObj[key] = canonicalize((val as Record<string, unknown>)[key]);
    }
    return sortedObj;
  }
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(node))).digest('hex');
}

describe('Requirement 7: True Surprise Me Execution & Lock Preservation', () => {
  it('keeps Surprise Me typography relevant to the employee product archetype', () => {
    const manifest = createSampleProject();
    manifest.seed = '22c8a6fd-24fb-4be2-80cc-457350c086b6-dir-c';
    manifest.name = 'Employee experience';
    manifest.productModel.productArchetypes = [{ tag: 'saas', weight: 100 }];
    manifest.designDNA.primaryArchetype = 'saas';
    manifest.designDNA.typographyPersonality = 'geist-system';

    const result = surpriseMe(manifest, { divergenceLevel: 60 });
    const typographyMutation = result.operation.mutations.find(
      (mutation) => mutation.type === 'SET_DESIGN_TOKEN' && mutation.payload.key === 'typographyPersonality'
    );

    expect(typographyMutation).toBeDefined();
    expect(typographyMutation?.payload).not.toMatchObject({ value: 'financial-sans-tabular-mono' });
  });

  it('keeps the financial typography option available to fintech projects', () => {
    const manifest = createSampleProject();
    manifest.seed = '22c8a6fd-24fb-4be2-80cc-457350c086b6-dir-c';
    manifest.designDNA.typographyPersonality = 'geist-system';

    const result = surpriseMe(manifest, { divergenceLevel: 60 });
    const typographyMutation = result.operation.mutations.find(
      (mutation) => mutation.type === 'SET_DESIGN_TOKEN' && mutation.payload.key === 'typographyPersonality'
    );

    expect(typographyMutation?.payload).toMatchObject({ value: 'financial-sans-tabular-mono' });
  });

  it('divergenceLevel: 20 performs minor styling/palette variation while preserving locked nodes', () => {
    const manifest = createSampleProject();

    // Lock header node
    const lockedManifest = executeMutation(manifest, {
      id: 'mut-lock-hdr',
      type: 'LOCK_NODE',
      targetId: 'node-header',
      payload: { targetNodeId: 'node-header', lockTypes: ['node', 'structure', 'style'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    }).nextManifest;

    const originalHeader = findNodeById(lockedManifest.screens[0]!.rootNode, 'node-header')!;
    const originalHeaderHash = computeCanonicalSubtreeHash(originalHeader);

    const result = surpriseMe(lockedManifest, {
      divergenceLevel: 20,
      seed: 'test-surprise-20',
    });

    expect(result.explanation).toContain('Surprise Me (divergence: 20%)');
    expect(result.lockedNodesPreserved).toBeGreaterThanOrEqual(1);

    const historyManager = new HistoryManager();
    const nextManifest = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // Locked node must be byte-preserved using deep subtree hashing
    const survivingHeader = findNodeById(nextManifest.screens[0]!.rootNode, 'node-header')!;
    expect(survivingHeader).toBeDefined();
    expect(computeCanonicalSubtreeHash(survivingHeader)).toBe(originalHeaderHash);

    // Minor DNA / styling adjustments
    expect(result.explanation).toContain('Shifted surface personality');
    expect(result.explanation).not.toContain('Switched navigation model');
  });

  it('divergenceLevel: 60 performs moderate resource, layout and navigation variation while preserving locked nodes', () => {
    const manifest = createSampleProject();

    // Lock header and chart nodes
    let lockedManifest = executeMutation(manifest, {
      id: 'mut-lock-hdr',
      type: 'LOCK_NODE',
      targetId: 'node-header',
      payload: { targetNodeId: 'node-header', lockTypes: ['node'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    }).nextManifest;

    lockedManifest = executeMutation(lockedManifest, {
      id: 'mut-lock-chart',
      type: 'LOCK_NODE',
      targetId: 'node-chart-overview',
      payload: { targetNodeId: 'node-chart-overview', lockTypes: ['node', 'content'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: lockedManifest.historyMeta.headRevision,
    }).nextManifest;

    const originalHeaderHash = computeCanonicalSubtreeHash(findNodeById(lockedManifest.screens[0]!.rootNode, 'node-header')!);
    const originalChartHash = computeCanonicalSubtreeHash(findNodeById(lockedManifest.screens[0]!.rootNode, 'node-chart-overview')!);

    const result = surpriseMe(lockedManifest, {
      divergenceLevel: 60,
      seed: 'test-surprise-60',
    });

    expect(result.explanation).toContain('Surprise Me (divergence: 60%)');
    expect(result.lockedNodesPreserved).toBeGreaterThanOrEqual(2);

    const historyManager = new HistoryManager();
    const nextManifest = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // Both locked nodes survive byte-equivalent
    const survivingHeader = findNodeById(nextManifest.screens[0]!.rootNode, 'node-header')!;
    const survivingChart = findNodeById(nextManifest.screens[0]!.rootNode, 'node-chart-overview')!;
    expect(computeCanonicalSubtreeHash(survivingHeader)).toBe(originalHeaderHash);
    expect(computeCanonicalSubtreeHash(survivingChart)).toBe(originalChartHash);

    // Navigation and hierarchy modified at divergence 60
    expect(result.explanation).toContain('Switched navigation model');
    expect(result.explanation).toContain('Recomposed layout and hierarchy of screen');
  });

  it('divergenceLevel: 90 performs radical structural and aesthetic variation while preserving locked nodes', () => {
    const manifest = createSampleProject();

    // Lock chart node
    const lockedManifest = executeMutation(manifest, {
      id: 'mut-lock-chart',
      type: 'LOCK_NODE',
      targetId: 'node-chart-overview',
      payload: { targetNodeId: 'node-chart-overview', lockTypes: ['node', 'structure'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    }).nextManifest;

    const originalChartHash = computeCanonicalSubtreeHash(findNodeById(lockedManifest.screens[0]!.rootNode, 'node-chart-overview')!);

    const result = surpriseMe(lockedManifest, {
      divergenceLevel: 90,
      seed: 'test-surprise-90-radical',
    });

    expect(result.explanation).toContain('Surprise Me (divergence: 90%)');

    const historyManager = new HistoryManager();
    const nextManifest = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // Locked chart survives byte-equivalent with deep subtree hash
    const survivingChart = findNodeById(nextManifest.screens[0]!.rootNode, 'node-chart-overview')!;
    expect(survivingChart).toBeDefined();
    expect(computeCanonicalSubtreeHash(survivingChart)).toBe(originalChartHash);

    // Radical DNA jump
    expect(nextManifest.designDNA.visualAmbition).toBeGreaterThanOrEqual(50);
    expect(nextManifest.designDNA.structuralCreativity).toBeGreaterThanOrEqual(50);
  });

  it('preserves a locked content container when Surprise Me switches to top navigation', () => {
    const manifest = createSampleProject();
    const screen = manifest.screens[0]!;
    const [header, main] = screen.rootNode.children;
    if (!header || !main) throw new Error('Sample screen is missing its navigation or content node.');
    const navigation = { ...header, semanticRole: 'navigation', locks: undefined };
    const content = {
      ...main,
      id: 'locked-main-content',
      semanticRole: 'main-content-scroll',
      locks: undefined,
    };
    const layoutManifest = {
      ...manifest,
      navigation: { ...manifest.navigation, model: 'sidebar' as const },
      screens: manifest.screens.map((candidate) => candidate.id === screen.id
        ? { ...candidate, rootNode: { ...candidate.rootNode, children: [navigation, content] } }
        : candidate),
    };
    const lockedManifest = executeMutation(layoutManifest, {
      id: 'lock-content-pane',
      type: 'LOCK_NODE',
      targetId: 'locked-main-content',
      payload: { targetNodeId: 'locked-main-content', lockTypes: ['structure'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: layoutManifest.historyMeta.headRevision,
    }).nextManifest;

    const lockedPane = findNodeById(lockedManifest.screens.find((candidate) => candidate.id === screen.id)!.rootNode, 'locked-main-content')!;
    const lockedPaneHash = computeCanonicalSubtreeHash(lockedPane);
    const result = surpriseMe(lockedManifest, {
      screenId: screen.id,
      divergenceLevel: 95,
      seed: 'locked-pane-2',
    });
    expect(result.operation.mutations).toContainEqual(expect.objectContaining({
      type: 'SET_DESIGN_TOKEN',
      payload: expect.objectContaining({ key: 'navigationModel', value: 'top-nav' }),
    }));

    const nextManifest = new HistoryManager().execute(lockedManifest, result.operation).nextManifest;
    const nextRoot = nextManifest.screens.find((candidate) => candidate.id === screen.id)!.rootNode;
    const preservedContent = findNodeById(nextRoot, 'locked-main-content');
    expect(preservedContent?.locks?.structure).toBe(true);
    expect(computeCanonicalSubtreeHash(preservedContent!)).toBe(lockedPaneHash);
    expect(ProjectManifestSchema.safeParse(nextManifest).success).toBe(true);
  });

  it('guarantees deterministic repeatability using seed and divergence level', () => {
    const manifest = createSampleProject();

    const run1 = surpriseMe(manifest, { divergenceLevel: 65, seed: 'repeatable-seed-abc' });
    const run2 = surpriseMe(manifest, { divergenceLevel: 65, seed: 'repeatable-seed-abc' });

    expect(run1.explanation).toBe(run2.explanation);
    expect(run1.operation.mutations.length).toBe(run2.operation.mutations.length);

    for (let i = 0; i < run1.operation.mutations.length; i++) {
      expect(run1.operation.mutations[i]!.type).toBe(run2.operation.mutations[i]!.type);
      expect(run1.operation.mutations[i]!.payload).toEqual(run2.operation.mutations[i]!.payload);
    }
  });
});
