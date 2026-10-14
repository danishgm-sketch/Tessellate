import type { ProjectManifest, ProjectMutation } from '@tessellate/schemas';
import { findNodeById } from '../utils/tree-helpers.js';

function nodeName(manifest: ProjectManifest, id: string | undefined): string {
  if (!id) return 'the project';
  for (const screen of manifest.screens) {
    if (screen.id === id) return `the "${screen.name}" screen`;
    const node = findNodeById(screen.rootNode, id);
    if (node) return `the ${node.semanticRole.replace(/-/g, ' ')} section on "${screen.name}"`;
  }
  return id;
}

/** Plain-language description of a planned change, shown before the user applies it. */
export function describeMutation(mutation: ProjectMutation, manifest: ProjectManifest): string {
  const target = nodeName(manifest, mutation.targetId);
  const payload = (mutation as { payload?: Record<string, unknown> }).payload ?? {};
  switch (mutation.type) {
    case 'SET_DESIGN_TOKEN':
      return `Adjust Design DNA for ${target}${payload.dnaChanges ? `: ${Object.entries(payload.dnaChanges as Record<string, unknown>).map(([k, v]) => `${k} → ${String(v)}`).join(', ')}` : ''}`;
    case 'LOCK_NODE':
      return `Lock ${target}`;
    case 'UNLOCK_NODE':
      return `Unlock ${target}`;
    case 'REPLACE_NODE':
    case 'CHANGE_RESOURCE':
      return `Replace the resource in ${target}`;
    case 'CHANGE_VARIANT':
      return `Change the variant of ${target}`;
    case 'CHANGE_LAYOUT':
      return `Change the layout of ${target}`;
    case 'INSERT_NODE':
      return `Add a section to ${target}`;
    case 'DELETE_NODE':
      return `Remove ${target}`;
    case 'MOVE_NODE':
      return `Move ${target}`;
    case 'SET_MOTION':
      return `Change motion on ${target}`;
    case 'SET_CONTENT':
    case 'SET_PROP':
      return `Edit content of ${target}`;
    default:
      return `${mutation.type.replace(/_/g, ' ').toLowerCase()} on ${target}`;
  }
}
