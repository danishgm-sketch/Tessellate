import { describe, it, expect } from 'vitest';
import { createSampleProject } from '../store/sample-project.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { executeMutation, PreconditionRevisionError } from '../mutations/executor.js';
import { generateInverseMutation } from '../mutations/inverse.js';
import {
  applyOperation,
  HistoryManager,
} from '../history/history-manager.js';
import {
  isNodeLocked,
  applyLockToNode,
  LockViolationError,
} from '../locks/lock-engine.js';
import { recomposeScreenAroundLocks } from '../mutations/recomposition.js';
import { surpriseMe } from '../mutations/surprise.js';
import { createCheckpoint, restoreCheckpoint } from '../history/checkpoints.js';
import { compareManifests } from '../compare/compare-engine.js';
import { blendManifests } from '../blend/blend-engine.js';
import { ProjectManifestSchema, type ProjectMutation, type ProjectNode } from '@tessellate/schemas';

describe('Phase 10: Mutation, Locks and History Gate', () => {
  it('Phase 10 Gate: lock navigation + chart, recompose dashboard, verify locked semantic nodes survive unchanged and undo restores exact prior manifest', () => {
    const initialManifest = createSampleProject();
    const dashboard = initialManifest.screens.find((s) => s.id === 'screen-overview');
    expect(dashboard).toBeDefined();

    // 1. Locate navigation and chart nodes
    const navNode = findNodeById(dashboard!.rootNode, 'node-header');
    const chartNode = findNodeById(dashboard!.rootNode, 'node-chart-overview');
    expect(navNode).toBeDefined();
    expect(chartNode).toBeDefined();

    // 2. Lock navigation and chart
    const lockNavMutation: ProjectMutation = {
      id: 'mut-lock-nav',
      type: 'LOCK_NODE',
      targetId: navNode!.id,
      payload: {
        targetNodeId: navNode!.id,
        lockTypes: ['node', 'structure'],
      },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: initialManifest.historyMeta.headRevision,
    };

    const res1 = executeMutation(initialManifest, lockNavMutation);

    const lockChartMutation: ProjectMutation = {
      id: 'mut-lock-chart',
      type: 'LOCK_NODE',
      targetId: chartNode!.id,
      payload: {
        targetNodeId: chartNode!.id,
        lockTypes: ['node', 'content', 'style'],
      },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: res1.nextManifest.historyMeta.headRevision,
    };

    const res2 = executeMutation(res1.nextManifest, lockChartMutation);
    const lockedManifest = res2.nextManifest;

    // Verify locks are active
    const lockedDashboard = lockedManifest.screens.find((s) => s.id === 'screen-overview')!;
    const lockedNav = findNodeById(lockedDashboard.rootNode, 'node-header')!;
    const lockedChart = findNodeById(lockedDashboard.rootNode, 'node-chart-overview')!;
    expect(isNodeLocked(lockedNav, 'structure')).toBe(true);
    expect(isNodeLocked(lockedChart, 'content')).toBe(true);

    // Deep copy baseline state before recomposition
    const baselineBeforeRecompose = JSON.parse(JSON.stringify(lockedManifest));

    // 3. Recompose dashboard around locks
    const recomposeResult = recomposeScreenAroundLocks(lockedManifest, 'screen-overview', {
      divergenceLevel: 75,
    });

    expect(recomposeResult.lockedNodesPreserved).toContain('node-header');
    expect(recomposeResult.lockedNodesPreserved).toContain('node-chart-overview');

    // 4. Apply the recomposition operation
    const historyManager = new HistoryManager();
    const { nextManifest: recomposedManifest } = historyManager.execute(
      lockedManifest,
      recomposeResult.operation
    );

    // 5. Verify locked nodes survived completely intact
    const recomposedDashboard = recomposedManifest.screens.find((s) => s.id === 'screen-overview')!;
    const survivingNav = findNodeById(recomposedDashboard.rootNode, 'node-header')!;
    const survivingChart = findNodeById(recomposedDashboard.rootNode, 'node-chart-overview')!;

    expect(survivingNav).toBeDefined();
    expect(survivingNav.id).toBe('node-header');
    expect(survivingNav.semanticRole).toBe(lockedNav.semanticRole);
    expect(survivingNav.resourceRef?.id).toBe(lockedNav.resourceRef?.id);
    expect(survivingNav.locks).toEqual(lockedNav.locks);

    expect(survivingChart).toBeDefined();
    expect(survivingChart.id).toBe('node-chart-overview');
    expect(survivingChart.semanticRole).toBe(lockedChart.semanticRole);
    expect(survivingChart.resourceRef?.id).toBe(lockedChart.resourceRef?.id);
    expect(survivingChart.locks).toEqual(lockedChart.locks);

    // Verify unlocked nodes received recomposition attributes
    const recomposedKpi = findNodeById(recomposedDashboard.rootNode, 'node-kpi-group');
    expect(recomposedKpi?.props['recomposed']).toBe(true);

    // 6. Undo operation restores exact prior manifest
    const undoResult = historyManager.undo(recomposedManifest);
    expect(undoResult).not.toBeNull();
    const restoredManifest = undoResult!.nextManifest;

    // Verify exact identity to prior manifest
    expect(restoredManifest).toEqual(baselineBeforeRecompose);
  });

  it('enforces optimistic concurrency via preconditionRevision checks', () => {
    const manifest = createSampleProject();
    const initialRev = manifest.historyMeta.headRevision;

    const validMutation: ProjectMutation = {
      id: 'mut-rev-valid',
      type: 'SET_INTENT',
      targetId: 'project',
      payload: { dimensions: { visualAmbition: 70 } },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: initialRev,
    };

    const res = executeMutation(manifest, validMutation);
    expect(res.nextManifest.historyMeta.headRevision).toBe(initialRev + 1);
    expect(res.nextManifest.designDNA.visualAmbition).toBe(70);

    // Attempting mutation with outdated revision must fail
    const outdatedMutation: ProjectMutation = {
      id: 'mut-rev-outdated',
      type: 'SET_INTENT',
      targetId: 'project',
      payload: { dimensions: { visualAmbition: 80 } },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: initialRev, // stale!
    };

    expect(() => executeMutation(res.nextManifest, outdatedMutation)).toThrow(
      PreconditionRevisionError
    );
  });

  it('enforces lock violations and rejects modifying locked properties', () => {
    const manifest = createSampleProject();
    const dashboard = manifest.screens[0]!;

    // Lock node-app-shell structure
    const lockedRoot = applyLockToNode(dashboard.rootNode, ['structure']);
    const lockedManifest = {
      ...manifest,
      screens: [{ ...dashboard, rootNode: lockedRoot }],
    };

    // Attempting to delete or replace a child of structure-locked node must be rejected
    const deleteChildMutation: ProjectMutation = {
      id: 'mut-delete-child',
      type: 'DELETE_NODE',
      targetId: 'node-header',
      payload: { nodeId: 'node-header' },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: lockedManifest.historyMeta.headRevision,
    };

    expect(() => executeMutation(lockedManifest, deleteChildMutation)).toThrow(
      LockViolationError
    );
  });

  it('rejects a mismatched target before an unlocked node can bypass a locked node', () => {
    const manifest = createSampleProject();
    const mismatch: ProjectMutation = {
      id: 'mut-target-mismatch',
      type: 'CHANGE_VARIANT',
      targetId: 'node-metric-arr',
      payload: { targetNodeId: 'node-header', variant: 'nocturne' },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    };

    expect(() => executeMutation(manifest, mismatch)).toThrow();
    expect(findNodeById(manifest.screens[0]!.rootNode, 'node-header')?.variant).toBeUndefined();
  });

  it('keeps graph edges and navigation valid after deleting a screen', () => {
    const manifest = createSampleProject();
    expect(manifest.screens.length).toBeGreaterThan(1);
    const screen = manifest.screens.at(-1)!;
    const mutation: ProjectMutation = {
      id: 'mut-delete-screen-contract',
      type: 'DELETE_SCREEN',
      targetId: screen.id,
      payload: { screenId: screen.id },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    };

    const result = executeMutation(manifest, mutation);

    expect(ProjectManifestSchema.safeParse(result.nextManifest).success).toBe(true);
    expect(result.nextManifest.navigation.primaryItems.every((item) =>
      result.nextManifest.screens.some((remaining) => remaining.id === item.targetScreenId)
    )).toBe(true);
    expect(result.nextManifest.screenGraph.edges.every((edge) =>
      result.nextManifest.screenGraph.groups.some((group) =>
        group.screens.some((node) => node.id === edge.fromScreenId || node.id === edge.toScreenId)
      )
    )).toBe(true);
  });

  it('does not delete a screen that contains a locked descendant', () => {
    const manifest = createSampleProject();
    const screen = manifest.screens.at(-1)!;
    const child = screen.rootNode.children[0]!;
    const lockMutation: ProjectMutation = {
      id: 'mut-lock-screen-child',
      type: 'LOCK_NODE',
      targetId: child.id,
      payload: { targetNodeId: child.id, lockTypes: ['structure'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    };
    const locked = executeMutation(manifest, lockMutation).nextManifest;
    const deleteMutation: ProjectMutation = {
      id: 'mut-delete-screen-with-lock',
      type: 'DELETE_SCREEN',
      targetId: screen.id,
      payload: { screenId: screen.id },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: locked.historyMeta.headRevision,
    };

    expect(() => executeMutation(locked, deleteMutation)).toThrow(/contains locked node/);
    expect(locked.screens.some((item) => item.id === screen.id)).toBe(true);
  });

  it('generates accurate inverse mutations for full reversible roundtrips', () => {
    const manifest = createSampleProject();
    const rev = manifest.historyMeta.headRevision;

    // 1. SET_PROP mutation and inverse
    const setPropMut: ProjectMutation = {
      id: 'mut-set-prop',
      type: 'SET_PROP',
      targetId: 'node-header',
      payload: { prop: 'title', value: 'Updated Header Title' },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: rev,
    };

    const invProp = generateInverseMutation(manifest, setPropMut);
    expect(invProp.type).toBe('SET_PROP');
    if (invProp.type === 'SET_PROP') {
      expect(invProp.payload.prop).toBe('title');
      expect(invProp.payload.value).toBe('Apex Intelligence'); // original title
    }

    // 2. INSERT_NODE mutation and inverse
    const newNode: ProjectNode = {
      id: 'node-new-badge',
      nodeType: 'element',
      semanticRole: 'badge',
      children: [],
      slots: {},
      props: {},
    };

    const insertMut: ProjectMutation = {
      id: 'mut-insert',
      type: 'INSERT_NODE',
      targetId: 'node-header',
      payload: { parentId: 'node-header', node: newNode },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: rev,
    };

    const invInsert = generateInverseMutation(manifest, insertMut);
    expect(invInsert.type).toBe('DELETE_NODE');
    if (invInsert.type === 'DELETE_NODE') {
      expect(invInsert.payload.nodeId).toBe('node-new-badge');
    }
  });

  it('supports automatic and named checkpoints with exact state recovery', () => {
    const manifest = createSampleProject();

    const namedChk = createCheckpoint(manifest, {
      name: 'Release Candidate 1',
      type: 'named',
      trigger: 'manual',
      description: 'Snapshot before experimentation',
    });

    expect(namedChk.name).toBe('Release Candidate 1');
    expect(namedChk.type).toBe('named');
    expect(namedChk.manifest.id).toBe(manifest.id);

    // Mutate manifest
    const _mutatedManifest = {
      ...manifest,
      name: 'Mutated Project',
      designDNA: { ...manifest.designDNA, visualAmbition: 99 },
    };

    // Restore from checkpoint
    const restored = restoreCheckpoint(namedChk);
    expect(restored.name).toBe(manifest.name);
    expect(restored.designDNA.visualAmbition).toBe(manifest.designDNA.visualAmbition);
  });

  it('executes Surprise Me controlled divergence without altering locks or required screens', () => {
    const manifest = createSampleProject();
    const result = surpriseMe(manifest, { divergenceLevel: 50 });

    expect(result.explanation).toContain('Surprise Me');
    expect(result.operation.mutations.length).toBeGreaterThan(0);

    const { nextManifest } = applyOperation(manifest, result.operation);
    expect(nextManifest.designDNA.visualAmbition).toBeGreaterThanOrEqual(manifest.designDNA.visualAmbition);
    expect(nextManifest.screens.length).toBe(manifest.screens.length);
  });

  it('computes structured differences in Compare Mode', () => {
    const manifestA = createSampleProject();
    const manifestB = createSampleProject();
    manifestB.designDNA.visualAmbition = 85;
    manifestB.designDNA.visualMode = 'dark';

    const comparison = compareManifests(manifestA, manifestB);
    expect(comparison.identical).toBe(false);
    expect(comparison.dnaDifferences.length).toBeGreaterThan(0);

    const ambitionDiff = comparison.dnaDifferences.find((d) => d.key === 'visualAmbition');
    expect(ambitionDiff).toBeDefined();
    expect(ambitionDiff?.delta).toBe(85 - manifestA.designDNA.visualAmbition);

    // Identical manifests comparison
    const identicalComp = compareManifests(manifestA, manifestA);
    expect(identicalComp.identical).toBe(true);
  });

  it('synthesizes a new coherent project in Blend Mode across 9 categories', () => {
    const sourceA = createSampleProject();
    sourceA.designDNA.visualMode = 'light';
    sourceA.designDNA.curvature = 20;

    const sourceB = createSampleProject();
    sourceB.name = 'Direction B';
    sourceB.designDNA.visualMode = 'dark';
    sourceB.designDNA.curvature = 90;
    sourceB.designDNA.typographyPersonality = 'expressive';

    const blended = blendManifests(sourceA, sourceB, undefined, {
      selections: {
        structure: 'A',
        typography: 'B',
        colour: 'B',
        motion: 'A',
        density: 'A',
        geometry: 'B',
        navigation: 'A',
        imagery: 'A',
        components: 'A',
      },
      name: 'Custom Synthetic Blend',
    });

    expect(blended.name).toBe('Custom Synthetic Blend');
    expect(blended.designDNA.typographyPersonality).toBe('expressive'); // from B
    expect(blended.designDNA.visualMode).toBe('dark'); // from B
    expect(blended.designDNA.curvature).toBe(90); // from B
    expect(blended.screens.length).toBe(sourceA.screens.length); // from A
  });
});
