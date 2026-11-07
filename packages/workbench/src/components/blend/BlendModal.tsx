import React, {useEffect,useState} from 'react';
import {useDialogFocus} from '@tessellate/ui';
import {ProjectManifestSchema,type ProjectManifest} from '@tessellate/schemas';
import {useWorkbenchStore} from '../../store/workbench-store.js';
import {ALL_BLEND_CATEGORIES,type BlendCategory,type BlendSourceKey} from '../../blend/blend-engine.js';

export function BlendModal() {
 const open=useWorkbenchStore(state=>state.isBlendOpen);
 const close=useWorkbenchStore(state=>state.closeBlend);
 const manifest=useWorkbenchStore(state=>state.manifest);
 const blend=useWorkbenchStore(state=>state.blendWith);
 const ref=useDialogFocus<HTMLDivElement>(open,close);
 const [sources,setSources]=useState<ProjectManifest[]>([]);
 const [error,setError]=useState('');
 const [selections,setSelections]=useState<Record<BlendCategory,BlendSourceKey>>({structure:'A',typography:'B',colour:'B',motion:'A',density:'A',geometry:'B',navigation:'A',imagery:'B',components:'A'});
 useEffect(()=>{
  if(!open) return;
  try {const raw=localStorage.getItem(`tessellate_directions_${manifest.id}`);setSources(raw ? ProjectManifestSchema.array().parse(JSON.parse(raw)).filter(source=>source.id!==manifest.id) : []);setError('');}
  catch(cause){setError(`Stored directions could not be validated: ${String(cause)}`);setSources([]);}
 },[open,manifest.id]);
 if(!open) return null;
 const b=sources[0];const c=sources[1];
 return <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Blend Directions" className="fixed inset-0 z-50 bg-black/70 text-white flex items-center justify-center p-3">
  <div className="dark border border-[#272C34] bg-[#111419] w-full max-w-2xl max-h-[90vh] overflow-auto p-5 space-y-5">
   <header className="flex justify-between gap-2"><h2 className="text-lg font-semibold">Blend saved directions</h2><button className="border px-3 py-1" onClick={close}>Close Blend Mode</button></header>
   <p className="text-sm text-[var(--text-muted)]">A is the current project. B and C are the actual other directions saved by Compose. Blending creates a new project and preserves locked subtrees.</p>
   <ul className="text-sm space-y-2"><li>A: {manifest.name}</li><li>B: {b?.name ?? 'No saved direction'}</li><li>C: {c?.name ?? 'No saved direction'}</li></ul>
   {!b && <p role="status">Open a direction from Compose to save its sibling directions before blending. <a href="/compose" className="underline">Open Compose</a></p>}
   {error && <p role="alert">{error}</p>}
   <fieldset disabled={!b} className="space-y-3">{ALL_BLEND_CATEGORIES.map(category=><label key={category} className="flex justify-between items-center capitalize gap-3"><span>{category}</span><select aria-label={`${category} source`} value={selections[category]} onChange={event=>setSelections(current=>({...current,[category]:event.target.value as BlendSourceKey}))} className="border border-[#272C34] bg-[#171B21] rounded p-2"><option value="A">Source A</option><option value="B">Source B</option><option value="C" disabled={!c}>Source C</option></select></label>)}</fieldset>
   <button className="rounded bg-[#2547E8] text-white px-4 py-2 disabled:opacity-50" disabled={!b} onClick={()=>{if(b)try{blend(b,{selections,name:`Blend of ${manifest.name}`},c);}catch(cause){setError(String(cause));}}}>Apply Direction Blend</button>
  </div>
 </div>;
}
