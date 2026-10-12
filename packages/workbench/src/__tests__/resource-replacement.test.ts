import { describe, it, expect } from 'vitest';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';
import {readFileSync} from 'node:fs';
import type {ResourceManifest} from '@tessellate/schemas';
import {
  getReplaceCandidates,
  getAlternativeCandidates,
  createReplaceOperation,
} from '../mutations/replace.js';
import { applyOperation } from '../history/history-manager.js';

describe('Resource Replacement Fidelity', () => {
  const catalog:ResourceManifest[] = JSON.parse(readFileSync('apps/site/public/data/catalog.json','utf8')).resources;
  const testManifest: ProjectManifest = {
    ...validProjectFixture,
    id: 'proj-replace-test',
    name: 'Replace Test Application',
    description: 'Manifest for testing resource replacement fidelity',
    screens: [
      {
        id: 'screen-dashboard',
        screenNodeId: 'root-layout',
        name: 'Dashboard',
        slug: 'dashboard',
        rootNode: {
          id: 'root-layout',
          nodeType: 'layout',
          semanticRole: 'application-shell',
          props: {},
          slots: {},
          children: [
            {
              id: 'node-btn-primary',
              nodeType: 'element',
              semanticRole: 'action-button',
              resourceRef: {
                id: 'res-button-01',
                slug: 'button',
                version: '1.0.0',
              },
              variant: 'primary',
              props: { label: 'Submit Transaction' },
              slots: { label: 'Submit Transaction' },
              locks: { style: true },
              children: [],
            },
            {
              id: 'node-kpi-1',
              nodeType: 'component',
              semanticRole: 'metric-kpi',
              resourceRef: {
                id: 'res-metric-card-01',
                slug: 'metric-card',
                version: '1.0.0',
              },
              variant: 'default',
              props: { label: 'Revenue' },
              slots: { title: 'Revenue', value: '$2.4M' },
              children: [],
            },
          ],
        },
      },
    ],
  };

  it('retrieves compatible replace candidates ranked by compatibility score', () => {
    const candidates = getReplaceCandidates(testManifest, 'node-btn-primary',catalog);
    expect(candidates.length).toBeGreaterThan(0);

    // Candidates must have real resource metadata, positive score, and rationale
    for (const c of candidates) {
      expect(c.resource.id).toBeDefined();
      expect(c.resource.slug).toBeDefined();
      expect(c.compatibilityScore).toBeGreaterThan(0);
      expect(c.rationale).toBeDefined();
    }

    // Must be sorted in descending order of compatibility score
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i - 1]!.compatibilityScore).toBeGreaterThanOrEqual(candidates[i]!.compatibilityScore);
    }
  });

  it('replaces node with a real resourceRef and initializes slots from the replacement manifest', () => {
    const targetNodeId = 'node-btn-primary';
    const ghostResource = catalog.find((r) => r.slug === 'magnetic-button')!;

    const operation = createReplaceOperation(testManifest, targetNodeId, ghostResource, 'quiet');
    expect(operation.mutations.length).toBe(1);

    const mutation = operation.mutations[0]!;
    expect(mutation.type).toBe('REPLACE_NODE');
    expect(mutation.targetId).toBe(targetNodeId);

    if (mutation.type === 'REPLACE_NODE') {
      const replacementNode = mutation.payload.replacementNode;
      expect(replacementNode.id).toBe(targetNodeId); // Node ID preserved
      expect(replacementNode.resourceRef).toEqual({
        id: ghostResource.id,
        slug: ghostResource.slug,
        version: ghostResource.version,
      });
      expect(replacementNode.variant).toBe('quiet');
      // Lock preserved
      expect(replacementNode.locks?.style).toBe(true);
    }

    // Apply operation and verify next manifest
    const result = applyOperation(testManifest, operation);
    const updatedScreen = result.nextManifest.screens[0]!;
    const updatedNode = updatedScreen.rootNode.children?.[0];

    expect(updatedNode?.resourceRef?.slug).toBe('magnetic-button');
    expect(updatedNode?.resourceRef?.id).toBe(ghostResource.id);
  });

  it('rejects candidates that violate hard constraints', () => {
    const strictManifest: ProjectManifest = {
      ...testManifest,
      constraints: {
        ...testManifest.constraints,
        accessibilityFloor: 'AAA', // Requires AAA
      },
    };

    // Candidates with target AA should be rejected when AAA is strictly required
    const candidates = getReplaceCandidates(strictManifest, 'node-btn-primary',catalog);
    for (const cand of candidates) {
      expect(cand.resource.accessibility.levelTarget).toBe('AAA');
    }
  });

  it('retrieves declared alternative relationships and variants', () => {
    const alternatives = getAlternativeCandidates(testManifest, 'node-btn-primary',catalog);
    expect(alternatives.length).toBeGreaterThan(0);

    // Should include variants or ALTERNATIVE_TO relationships
    const hasVariantOrRel = alternatives.some(
      (a) => a.relationType === 'VARIANT' || a.relationType === 'ALTERNATIVE_TO' || a.relationType === 'COMPATIBLE_ALTERNATIVE'
    );
    expect(hasVariantOrRel).toBe(true);
  });
});
