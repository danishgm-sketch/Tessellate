import { describe, it, expect } from 'vitest';
import * as crypto from 'node:crypto';
import type { ProjectNode, ProjectMutation } from '@tessellate/schemas';
import { createSampleProject } from '../store/sample-project.js';
import { recomposeScreenAroundLocks } from '../mutations/recomposition.js';
import { executeMutation } from '../mutations/executor.js';
import { HistoryManager } from '../history/history-manager.js';
import { findNodeById, flattenTree } from '../utils/tree-helpers.js';

function computeNodeHash(node: ProjectNode): string {
  return crypto.createHash('sha256').update(JSON.stringify(node)).digest('hex');
}

describe('Genuine Structural Recomposition & Hash Verification (Req 5)', () => {
  it('divergence 20 makes modest structural changes while locked nodes survive byte-equivalent', () => {
    const manifest = createSampleProject();

    // Lock the navigation header completely
    const navNode = findNodeById(manifest.screens[0]!.rootNode, 'node-header')!;
    const lockMutation: ProjectMutation = {
      id: 'mut-lock-1',
      type: 'LOCK_NODE',
      targetId: navNode.id,
      payload: {
        targetNodeId: navNode.id,
        lockTypes: ['node', 'structure', 'style', 'content'],
      },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    };
    const lockedManifest = executeMutation(manifest, lockMutation).nextManifest;
    const lockedNavNode = findNodeById(lockedManifest.screens[0]!.rootNode, 'node-header')!;
    const originalHash = computeNodeHash(lockedNavNode);

    // Run recomposition at divergence 20
    const result = recomposeScreenAroundLocks(lockedManifest, 'screen-overview', {
      divergenceLevel: 20,
    });

    const historyManager = new HistoryManager();
    const recomposed = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // Verify locked node is byte-for-byte identical (SHA-256 hash match)
    const survivingNavNode = findNodeById(recomposed.screens[0]!.rootNode, 'node-header')!;
    expect(survivingNavNode).toBeDefined();
    expect(computeNodeHash(survivingNavNode)).toBe(originalHash);

    // Verify modest changes occurred on unlocked nodes
    const rootNode = recomposed.screens[0]!.rootNode;
    expect(rootNode.props['recomposed']).toBe(true);
    expect(rootNode.props['layoutVariant']).toBe('modular-grid');
  });

  it('divergence 70 creates a materially different hierarchy while locked nodes survive byte-equivalent', () => {
    const manifest = createSampleProject();

    // Lock chart node
    const chartNode = findNodeById(manifest.screens[0]!.rootNode, 'node-chart-overview')!;
    const lockMutation: ProjectMutation = {
      id: 'mut-lock-2',
      type: 'LOCK_NODE',
      targetId: chartNode.id,
      payload: {
        targetNodeId: chartNode.id,
        lockTypes: ['node', 'structure', 'content'],
      },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    };
    const lockedManifest = executeMutation(manifest, lockMutation).nextManifest;
    const lockedChart = findNodeById(lockedManifest.screens[0]!.rootNode, 'node-chart-overview')!;
    const originalHash = computeNodeHash(lockedChart);

    // Run recomposition at divergence 70
    const result = recomposeScreenAroundLocks(lockedManifest, 'screen-overview', {
      divergenceLevel: 70,
      seed: 'div-70-test',
    });

    const historyManager = new HistoryManager();
    const recomposed = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // Verify locked node hash survived byte-equivalent
    const survivingChart = findNodeById(recomposed.screens[0]!.rootNode, 'node-chart-overview')!;
    expect(survivingChart).toBeDefined();
    expect(computeNodeHash(survivingChart)).toBe(originalHash);

    // Verify hierarchy changed: a new layout container was instantiated
    const allRecomposedNodes = flattenTree(recomposed.screens[0]!.rootNode);
    const newContainer = allRecomposedNodes.find((n) => n.semanticRole === 'grid-dashboard-container');
    expect(newContainer).toBeDefined();
    expect(newContainer?.children.length).toBeGreaterThan(0);
    expect(recomposed.screens[0]!.rootNode.props['layoutVariant']).toBe('split-focus');
  });

  it('divergence 95 creates a radical alternative shell while locked nodes survive byte-equivalent', () => {
    const manifest = createSampleProject();

    // Lock header and chart
    const navNode = findNodeById(manifest.screens[0]!.rootNode, 'node-header')!;
    const chartNode = findNodeById(manifest.screens[0]!.rootNode, 'node-chart-overview')!;

    let currentManifest = executeMutation(manifest, {
      id: 'mut-lock-nav',
      type: 'LOCK_NODE',
      targetId: navNode.id,
      payload: { targetNodeId: navNode.id, lockTypes: ['node'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    }).nextManifest;

    currentManifest = executeMutation(currentManifest, {
      id: 'mut-lock-chart',
      type: 'LOCK_NODE',
      targetId: chartNode.id,
      payload: { targetNodeId: chartNode.id, lockTypes: ['node'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: currentManifest.historyMeta.headRevision,
    }).nextManifest;

    const navHash = computeNodeHash(findNodeById(currentManifest.screens[0]!.rootNode, 'node-header')!);
    const chartHash = computeNodeHash(findNodeById(currentManifest.screens[0]!.rootNode, 'node-chart-overview')!);

    // Run recomposition at divergence 95
    const result = recomposeScreenAroundLocks(currentManifest, 'screen-overview', {
      divergenceLevel: 95,
      seed: 'div-95-radical',
    });

    const historyManager = new HistoryManager();
    const recomposed = historyManager.execute(currentManifest, result.operation).nextManifest;

    // Both locked nodes survived byte-equivalent
    const survivingNav = findNodeById(recomposed.screens[0]!.rootNode, 'node-header')!;
    const survivingChart = findNodeById(recomposed.screens[0]!.rootNode, 'node-chart-overview')!;
    expect(computeNodeHash(survivingNav)).toBe(navHash);
    expect(computeNodeHash(survivingChart)).toBe(chartHash);

    // Root shell transformed to workspace dock
    const rootNode = recomposed.screens[0]!.rootNode;
    expect(rootNode.semanticRole).toBe('workspace-dock-shell');
    expect(rootNode.props['layoutVariant']).toBe('radical-dock-workspace');

    // Either compound block or split column created
    const allNodes = flattenTree(rootNode);
    const hasCompoundOrSplit = allNodes.some(
      (n) => n.semanticRole === 'compound-workspace-pane' || n.semanticRole === 'split-workspace-columns'
    );
    expect(hasCompoundOrSplit).toBe(true);
  });
});
