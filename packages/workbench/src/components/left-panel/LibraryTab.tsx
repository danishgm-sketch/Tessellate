import React, { useEffect, useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { getAvailableResources, getReplaceCandidates } from '../../mutations/replace.js';
import { loadActiveCatalog } from '../../mutations/runtime-catalog.js';
import { useRuntimeCatalogStatus } from '../useRuntimeCatalogStatus.js';
import { isScopeLocked } from '../../utils/dna-helpers.js';

export function LibraryTab() {
  const manifest = useWorkbenchStore(state=>state.manifest);
  const screenId = useWorkbenchStore(state=>state.activeScreenId);
  const nodeId = useWorkbenchStore(state=>state.selectedNodeId);
  const replace = useWorkbenchStore(state=>state.replaceNodeWithResource);
  const [query,setQuery] = useState('');
  const [error,setError] = useState('');
  const catalogStatus = useRuntimeCatalogStatus();
  useEffect(() => { void loadActiveCatalog().catch(() => undefined); }, []);
  const locked = isScopeLocked(manifest,screenId,nodeId,'structure');
  const candidates = nodeId ? getReplaceCandidates(manifest,nodeId) : [];
  const resources = nodeId ? candidates.map(candidate=>candidate.resource) : getAvailableResources();
  const filtered = resources.filter(resource=>`${resource.name} ${resource.slug} ${resource.description}`.toLowerCase().includes(query.toLowerCase()));
  return <div data-testid="library-tab" className="p-4 space-y-4 text-xs">
    <label className="block space-y-2"><span>Search runtime resources</span><input aria-label="Search runtime resources" value={query} onChange={event=>setQuery(event.target.value)} className="w-full border border-[#272C34] bg-[#171B21] rounded p-2" /></label>
    <p className="text-[var(--text-muted)]">{nodeId ? 'Alternatives for this semantic role, filtered against project constraints.' : 'Select a resource node to see compatible replacements.'}</p>
    {catalogStatus === 'loading' && <p role="status">Loading the verified runtime catalogue…</p>}
    {catalogStatus === 'error' && <div role="alert" className="space-y-2"><p>The catalogue could not be loaded. Resource discovery and replacement are unavailable until it is ready.</p><button type="button" className="underline" onClick={() => { setError(''); void loadActiveCatalog().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause))); }}>Retry catalogue</button>{error && <p>{error}</p>}</div>}
    {locked && <p role="status">Replacement is disabled by the selected node or ancestor lock.</p>}
    {error && <p role="alert">{error}</p>}
    {catalogStatus === 'ready' && filtered.length===0 && <p>No compatible alternatives found. Try another selection or search.</p>}
    {filtered.map(resource=><article key={resource.id} className="border border-[#272C34] p-3 space-y-2">
      <h3 className="font-semibold">{resource.name}</h3><p className="font-mono text-[var(--text-muted)]">{resource.slug} · v{resource.version} · Gold runtime</p><p>{resource.description}</p>
      <div className="flex justify-between gap-2"><a className="underline" href={`/r/${resource.slug}/`} target="_blank" rel="noreferrer">Resource details</a>
      {nodeId && <button disabled={locked} className="border border-[#6782FF] rounded px-2 py-1 disabled:opacity-50" onClick={()=>{try { replace(nodeId,resource);setError(''); } catch(cause){setError(String(cause));}}}>Apply replacement</button>}</div>
    </article>)}
  </div>;
}
