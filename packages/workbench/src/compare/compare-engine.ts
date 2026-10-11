import type { ProjectManifest } from '@tessellate/schemas';
import { flattenTree } from '../utils/tree-helpers.js';

export interface DnaDifference {
  key: string;
  valueA: unknown;
  valueB: unknown;
  delta?: number;
}

export interface NodeDifference {
  screenId: string;
  nodeId: string;
  type: 'added' | 'removed' | 'modified';
  changeDetails: string;
}

export interface ManifestComparison {
  identical: boolean;
  summary: string[];
  dnaDifferences: DnaDifference[];
  addedScreenIds: string[];
  removedScreenIds: string[];
  nodeDifferences: NodeDifference[];
}

/**
 * Compares two ProjectManifests and computes structured differences across
 * Design DNA, screen structure, and semantic node contents.
 */
export function compareManifests(
  manifestA: ProjectManifest,
  manifestB: ProjectManifest
): ManifestComparison {
  const summary: string[] = [];
  const dnaDifferences: DnaDifference[] = [];
  const nodeDifferences: NodeDifference[] = [];

  // 1. Compare Design DNA
  const dnaA = manifestA.designDNA as Record<string, unknown>;
  const dnaB = manifestB.designDNA as Record<string, unknown>;
  const allDnaKeys = new Set([...Object.keys(dnaA), ...Object.keys(dnaB)]);

  for (const key of allDnaKeys) {
    const valA = dnaA[key];
    const valB = dnaB[key];

    if (valA !== valB) {
      const isNum = typeof valA === 'number' && typeof valB === 'number';
      const delta = isNum ? (valB as number) - (valA as number) : undefined;
      dnaDifferences.push({
        key,
        valueA: valA,
        valueB: valB,
        delta,
      });

      if (isNum && delta !== undefined) {
        const sign = delta > 0 ? `+${delta}` : `${delta}`;
        summary.push(`DNA ${key}: ${valA} → ${valB} (${sign})`);
      } else {
        summary.push(`DNA ${key}: "${valA}" → "${valB}"`);
      }
    }
  }

  // 2. Compare Screens
  const screensA = new Map(manifestA.screens.map((s) => [s.id, s]));
  const screensB = new Map(manifestB.screens.map((s) => [s.id, s]));

  const addedScreenIds: string[] = [];
  const removedScreenIds: string[] = [];

  for (const [id, screenB] of screensB) {
    if (!screensA.has(id)) {
      addedScreenIds.push(id);
      summary.push(`Added screen: ${screenB.name} (${screenB.slug})`);
    }
  }

  for (const [id, screenA] of screensA) {
    if (!screensB.has(id)) {
      removedScreenIds.push(id);
      summary.push(`Removed screen: ${screenA.name} (${screenA.slug})`);
    }
  }

  // 3. Compare Nodes for common screens
  for (const [id, screenA] of screensA) {
    const screenB = screensB.get(id);
    if (!screenB) continue;

    const nodesA = new Map(flattenTree(screenA.rootNode).map((n) => [n.id, n]));
    const nodesB = new Map(flattenTree(screenB.rootNode).map((n) => [n.id, n]));

    // Check added in B
    for (const [nodeId, nB] of nodesB) {
      if (!nodesA.has(nodeId)) {
        nodeDifferences.push({
          screenId: id,
          nodeId,
          type: 'added',
          changeDetails: `Added node ${nB.semanticRole}`,
        });
      }
    }

    // Check removed in B
    for (const [nodeId, nA] of nodesA) {
      if (!nodesB.has(nodeId)) {
        nodeDifferences.push({
          screenId: id,
          nodeId,
          type: 'removed',
          changeDetails: `Removed node ${nA.semanticRole}`,
        });
      }
    }

    // Check modified
    for (const [nodeId, nA] of nodesA) {
      const nB = nodesB.get(nodeId);
      if (!nB) continue;

      const resChanged = nA.resourceRef?.id !== nB.resourceRef?.id;
      const variantChanged = nA.variant !== nB.variant;
      const propsDiff = JSON.stringify(nA.props) !== JSON.stringify(nB.props);

      if (resChanged) {
        nodeDifferences.push({
          screenId: id,
          nodeId,
          type: 'modified',
          changeDetails: `Changed resource to "${nB.resourceRef?.id ?? 'none'}"`,
        });
        summary.push(`Screen "${screenA.name}": Changed resource on ${nA.semanticRole}`);
      } else if (variantChanged) {
        nodeDifferences.push({
          screenId: id,
          nodeId,
          type: 'modified',
          changeDetails: `Changed variant to "${nB.variant}"`,
        });
      } else if (propsDiff) {
        nodeDifferences.push({
          screenId: id,
          nodeId,
          type: 'modified',
          changeDetails: `Updated properties`,
        });
      }
    }
  }

  const identical =
    dnaDifferences.length === 0 &&
    addedScreenIds.length === 0 &&
    removedScreenIds.length === 0 &&
    nodeDifferences.length === 0;

  if (identical) {
    summary.push('Manifests are identical in structure and DNA.');
  }

  return {
    identical,
    summary,
    dnaDifferences,
    addedScreenIds,
    removedScreenIds,
    nodeDifferences,
  };
}
