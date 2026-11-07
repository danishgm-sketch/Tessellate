import { writeFileSync } from 'node:fs';
import { SHOWCASE_PROJECTS } from '../../../../packages/composer/src/showcases.js';
import { composeShowcase } from '../../../../packages/compatibility/src/showcase-composition.js';
const site='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const [indexResponse,catalogResponse]=await Promise.all([
 fetch(`${site}/data/showcases/index.json`,{cache:'no-store'}),
 fetch(`${site}/data/catalog.json`,{cache:'no-store'}),
]);
const actual=await indexResponse.json();
const catalogue=(await catalogResponse.json()).resources;
const canonical=SHOWCASE_PROJECTS.map(showcase=>({
 id:showcase.id,
 name:showcase.name,
 tagline:showcase.tagline,
 archetypeId:showcase.archetypeId,
 navigationModel:showcase.navigationModel,
 dnaPresetName:showcase.dnaPresetName,
 colorMode:showcase.colorMode,
 screenCount:composeShowcase(showcase.id,catalogue).screens.length,
}));
const fieldDiffs=canonical.flatMap(item=>{const found=actual.find(entry=>entry.id===item.id);if(!found)return [{id:item.id,missing:true}];const fields=Object.keys(item).filter(key=>found[key]!==item[key]);return fields.length?[{id:item.id,fields,expected:item,actual:found}]:[];});
const stable=value=>value===null||typeof value!=='object'?value:Array.isArray(value)?value.map(stable):Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
const manifestChecks=[];
for(const showcase of SHOWCASE_PROJECTS){
 const response=await fetch(`${site}/data/showcases/${showcase.id}.json`,{cache:'no-store'});
 const actualManifest=await response.json();
 const expectedManifest=composeShowcase(showcase.id,catalogue);
 manifestChecks.push({id:showcase.id,status:response.status,expectedScreenCount:expectedManifest.screens.length,actualScreenCount:actualManifest.screens?.length,match:JSON.stringify(stable(actualManifest))===JSON.stringify(stable(expectedManifest))});
}
const report={site,siteVersion:53,capturedAt:new Date().toISOString(),routes:{index:'/data/showcases/index.json',catalogue:'/data/catalog.json',manifests:`/data/showcases/[id].json`},httpStatus:{index:indexResponse.status,catalogue:catalogResponse.status},expectedCount:canonical.length,actualCount:actual.length,uniqueIds:new Set(actual.map(x=>x.id)).size,indexFieldDiffs:fieldDiffs,manifests:manifestChecks,result:indexResponse.status===200&&catalogResponse.status===200&&actual.length===canonical.length&&fieldDiffs.length===0&&manifestChecks.every(x=>x.status===200&&x.match)?'PASS':'FAIL'};
writeFileSync('quality/evidence/step-45/public-v53-reaudit-2026-10-28/public-index-verification-v53.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
