import React,{useState} from 'react';
import {ManifestRenderer} from '@tessellate/renderer';
import type {ProjectManifest} from '@tessellate/schemas';
export function ShowcasePreview({manifest}:{manifest:ProjectManifest}){
 const [active,setActive]=useState(manifest.screens[0]!.id);
 return <section className="space-y-4"><label className="flex flex-wrap gap-3 items-center">Example screen<select aria-label="Example screen" className="border p-2 bg-white text-black" value={active} onChange={event=>setActive(event.target.value)}>{manifest.screens.map(screen=><option key={screen.id} value={screen.id}>{screen.name}</option>)}</select></label><div className="border overflow-auto"><ManifestRenderer manifest={manifest} activeScreenId={active} context={{viewport:'desktop',reducedMotion:true}}/></div><dl className="grid sm:grid-cols-3 gap-4 border-t pt-4"><div><dt>Navigation model</dt><dd>{manifest.navigation.model}</dd></div><div><dt>Visual ambition</dt><dd>{manifest.designDNA.visualAmbition}</dd></div><div><dt>Structural creativity</dt><dd>{manifest.designDNA.structuralCreativity}</dd></div></dl></section>;
}
