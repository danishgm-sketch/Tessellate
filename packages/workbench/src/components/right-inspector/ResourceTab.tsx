import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { getAvailableResources, getReplaceCandidates } from '../../mutations/replace.js';
import { isScopeLocked } from '../../utils/dna-helpers.js';

export function ResourceTab() {
  const manifest = useWorkbenchStore(state=>state.manifest);
  const screenId = useWorkbenchStore(state=>state.activeScreenId);
  const nodeId = useWorkbenchStore(state=>state.selectedNodeId);
  const openReplace = useWorkbenchStore(state=>state.openReplaceDrawer);
  const screen = manifest.screens.find(item=>item.id===screenId);
  const node = screen && nodeId ? findNodeById(screen.rootNode,nodeId) : null;
  const resource = getAvailableResources().find(item=>item.id===node?.resourceRef?.id);
  const locked = isScopeLocked(manifest,screenId,nodeId,'structure');
  const candidates = nodeId ? getReplaceCandidates(manifest,nodeId) : [];
  return <div data-testid="resource-tab" className="p-4 space-y-4 text-xs">
    {!node ? <p>Select a node to inspect its source resource.</p> : !node.resourceRef ? <p>This is a semantic layout container. Select a resource child to replace it.</p> : !resource ? <p role="alert">Unresolved resource: {node.resourceRef.slug}. Export the manifest and inspect the catalogue.</p> : <>
      <h3 className="font-semibold text-sm">{resource.name}</h3><p className="font-mono">{resource.slug} · v{resource.version} · variant {node.variant}</p>
      <p>{resource.description}</p><p>Creator: {resource.creator.displayName}</p><p>Licence: {resource.license.spdx}</p>
      {resource.quality.assessment.status === 'reviewed' ? <p>Reviewed quality assessment: {resource.quality.overall}/100. Evidence: {resource.quality.assessment.evidence.join(', ')}</p> : <p>Quality assessment: Not assessed.</p>}
      <p>Declared dependencies: {resource.dependencies.map(item=>typeof item==='string'?item:JSON.stringify(item)).join(', ') || 'None'}</p>
      <a className="block underline" href={`/r/${resource.slug}/`} target="_blank" rel="noreferrer">Open provenance and resource details</a>
      <button data-testid="open-replace-drawer-btn" disabled={locked || candidates.length===0} onClick={openReplace} className="w-full border border-[#6782FF] rounded p-2 disabled:opacity-50">Open Replace Drawer ({candidates.length} alternatives)</button>
      {locked ? <p>Unlock this node or its ancestor to replace it.</p> : candidates.length===0 && <p>No other Gold runtime resource matches this role and the current hard constraints.</p>}
    </>}
  </div>;
}
