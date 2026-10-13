import React, { useState } from 'react';
export type CollapsibleSidebarVariant = 'quiet' | 'expressive' | 'nocturne';
export interface CollapsibleSidebarProps { variant?:CollapsibleSidebarVariant; brand?:string; links?:Array<{label:string;href:string}>; }
export function CollapsibleSidebar({variant='quiet',brand='Example workspace',links=[{label:'Overview',href:'#overview'},{label:'Settings',href:'#settings'}]}:CollapsibleSidebarProps) {
 const [collapsed,setCollapsed] = useState(false);
 const dark=variant==='nocturne';
 return <aside className={`w-full p-3 border rounded-[var(--tess-radius-md,8px)] ${dark?'bg-[#11141B] border-[#2E3440] text-white':'bg-white border-neutral-200 text-neutral-900'}`}>
  <div className="flex items-center justify-between gap-2 mb-4"><span className="font-semibold text-sm">{brand}</span><button type="button" aria-label={collapsed?'Expand navigation':'Collapse navigation'} aria-expanded={!collapsed} onClick={()=>setCollapsed(!collapsed)} className="p-2 border rounded">{collapsed?'+':'−'}</button></div>
  {!collapsed && <nav aria-label="Workspace screens" className="flex flex-wrap @3xl:flex-col gap-1">{links.map(link=><a key={link.href} href={link.href} className={`block rounded px-3 py-2 text-xs ${dark?'hover:bg-[#252C39] text-neutral-200':'hover:bg-neutral-100 text-neutral-700'}`}>{link.label}</a>)}</nav>}
 </aside>;
}
