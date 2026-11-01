import {assertContentShape} from '../../utils/content-shape.js';
import React, { useEffect, useRef, useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { isScopeLocked } from '../../utils/dna-helpers.js';
import { getAvailableResources, loadActiveCatalog } from '../../mutations/runtime-catalog.js';
import { useRuntimeCatalogStatus } from '../useRuntimeCatalogStatus.js';

function StructuredField({name,value,shapeTemplate,onApply,disabled}:{name:string;value:unknown;shapeTemplate:unknown;onApply:(value:unknown)=>void;disabled:boolean}) {
  const committedValue = JSON.stringify(value,null,2);
  const [draft,setDraft] = useState(committedValue);
  const [error,setError] = useState('');
  const shapeContract = useRef(shapeTemplate);
  if (!Array.isArray(shapeTemplate) || shapeTemplate.length > 0 || !Array.isArray(shapeContract.current)) shapeContract.current = shapeTemplate;
  useEffect(()=>{setDraft(committedValue);setError('');},[committedValue]);
  return <div className="space-y-2"><label className="block space-y-1"><span>{name} (JSON)</span><textarea aria-label={`${name} JSON`} value={draft} disabled={disabled} onChange={event=>setDraft(event.target.value)} rows={7} className="w-full font-mono border border-[#272C34] bg-[#171B21] rounded p-2" /></label><button disabled={disabled} className="border border-[#6782FF] rounded px-2 py-1" onClick={()=>{try {const parsed:unknown=JSON.parse(draft);assertContentShape(shapeContract.current,parsed,name);onApply(parsed);setError('');} catch(cause){setError(String(cause));}}}>Apply {name}</button>{error && <p role="alert">{error}</p>}</div>;
}

export function ContentTab() {
  const manifest = useWorkbenchStore(state=>state.manifest);
  const screenId = useWorkbenchStore(state=>state.activeScreenId);
  const nodeId = useWorkbenchStore(state=>state.selectedNodeId);
  const update = useWorkbenchStore(state=>state.updateNodeProps);
  useRuntimeCatalogStatus();
  const screen = manifest.screens.find(item=>item.id===screenId);
  const node = screen && nodeId ? findNodeById(screen.rootNode,nodeId) : null;
  const resource = getAvailableResources().find(item=>item.id===node?.resourceRef?.id);
  useEffect(()=>{if(node?.resourceRef)void loadActiveCatalog().catch(()=>undefined);},[node?.resourceRef?.id]);
  if(!node) return <div data-testid="content-tab" className="p-4 text-sm">Select a resource in Layers to edit its content.</div>;
  const locked = isScopeLocked(manifest,screenId,nodeId,'content');
  const entries = Object.entries(node.props ?? {}).filter(([key])=>!['layoutFamily','navigationModel','divergenceLevel'].includes(key));
  return <div data-testid="content-tab" className="p-4 space-y-4 text-xs">
    <h3 className="font-semibold">Content: {node.semanticRole}</h3>
    {locked && <p role="status">Content is locked. Unlock this node or its ancestor to edit.</p>}
    {entries.length===0 && <p>This layout container has no content fields. Select one of its resource children.</p>}
    {entries.map(([name,value])=>typeof value==='object' && value!==null ? <StructuredField key={`${node.id}-${node.resourceRef?.slug ?? 'layout'}-${name}`} name={name} value={value} shapeTemplate={resource?.preview.defaultProps?.[name] ?? value} disabled={locked} onApply={changed=>update(node.id,{[name]:changed})}/> :
      <label key={name} className="block space-y-1"><span>{name}</span>{typeof value==='boolean' ? <input aria-label={name} type="checkbox" checked={value} disabled={locked} onChange={event=>update(node.id,{[name]:event.target.checked})}/> : <input aria-label={name} type={typeof value==='number'?'number':'text'} disabled={locked} value={String(value ?? '')} onChange={event=>update(node.id,{[name]:typeof value==='number'?Number(event.target.value):event.target.value})} className="w-full border border-[#272C34] bg-[#171B21] rounded p-2"/>}</label>)}
  </div>;
}
