import { describe, it, expect } from 'vitest';
import { createSampleProject } from '../store/sample-project.js';
import { surpriseMe } from '../mutations/surprise.js';
import { HistoryManager } from '../history/history-manager.js';
import { executeMutation } from '../mutations/executor.js';
import { findNodeById } from '../utils/tree-helpers.js';

describe('Controlled Intelligent Divergence: Surprise Me (Req 6)', () => {
  it('modifies DNA, personalities, navigation, and hierarchy at elevated divergence', () => {
    const manifest = createSampleProject();

    // Lock the header node
    const lockedManifest = executeMutation(manifest, {
      id: 'mut-lock-hdr',
      type: 'LOCK_NODE',
      targetId: 'node-header',
      payload: { targetNodeId: 'node-header', lockTypes: ['node'] },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    }).nextManifest;

    const result = surpriseMe(lockedManifest, {
      divergenceLevel: 75,
      seed: 'test-surprise-deterministic',
    });

    expect(result.explanation).toContain('Surprise Me (divergence: 75%)');
    expect(result.lockedNodesPreserved).toBeGreaterThanOrEqual(1);

    // Apply the operation
    const historyManager = new HistoryManager();
    const nextManifest = historyManager.execute(lockedManifest, result.operation).nextManifest;

    // 1. Design DNA modified
    expect(nextManifest.designDNA.visualAmbition).toBeGreaterThan(manifest.designDNA.visualAmbition);
    expect(nextManifest.designDNA.structuralCreativity).toBeGreaterThan(
      manifest.designDNA.structuralCreativity
    );

    // 2. Navigation model modified
    expect(result.explanation).toContain('Switched navigation model to');

    // 3. Hierarchy recomposed
    expect(result.explanation).toContain('Recomposed layout and hierarchy of screen');

    // 4. Locked node survived intact
    const survivingHeader = findNodeById(nextManifest.screens[0]!.rootNode, 'node-header');
    expect(survivingHeader).toBeDefined();
    expect(survivingHeader?.locks?.node).toBe(true);
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

  it('only mentions changes that were actually applied in the returned explanation', () => {
    const manifest = createSampleProject();

    const result = surpriseMe(manifest, { divergenceLevel: 25, seed: 'low-div-test' });

    // At divergence 25, navigation model is NOT modified (requires >= 60)
    expect(result.explanation).not.toContain('Switched navigation model');

    // But surface personality is modified (requires >= 20)
    expect(result.explanation).toContain('Shifted surface personality');
  });
});
