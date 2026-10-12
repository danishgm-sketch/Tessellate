import {getShowcaseProject} from '@tessellate/composer';
import {ProjectManifestSchema,type ResourceManifest,type ProjectManifest} from '@tessellate/schemas';
import {composeProjectPipeline,composeProjectForDirection} from './compose-pipeline.js';
/** Render showcase briefs through the same validated pipeline as user projects. */
export function composeShowcase(id:string,catalogue:ResourceManifest[]):ProjectManifest {
 const showcase=getShowcaseProject(id);if(!showcase)throw new Error(`Unknown showcase: ${id}`);
 const description=id==='showcase-playful-hr'?'Employee experience platform for people, teams, playful onboarding and peer recognition.':(showcase.manifest.description ?? showcase.tagline);
 const archetypes:Record<string,string>={fintech:'fintech',ai:'ai',hospitality:'hospitality',hr:'recruitment',ecommerce:'ecommerce',scientific:'intelligence-research',analytics:'analytics',productivity:'productivity'};
 const composed=composeProjectPipeline({description,archetypeOverride:archetypes[showcase.archetypeId],visualAmbition:showcase.designDNA.visualAmbition,structuralCreativity:showcase.designDNA.structuralCreativity,targetDevices:['desktop','tablet','mobile']},{catalogResources:catalogue,seed:id});
 const navigationModel=showcase.navigationModel.includes('sidebar')?'sidebar':showcase.navigationModel.includes('top')?'top-nav':'rail';
 const base=navigationModel==='sidebar'?composed.directionA: navigationModel==='top-nav'?composed.directionB:composed.directionC;
 const dna={...showcase.designDNA,navigationModel,visualMode:showcase.colorMode==='dark'?'dark':'light'} as const;
 const diagnostics:NonNullable<Parameters<typeof composeProjectForDirection>[0]['diagnostics']>=[];
 const manifest=composeProjectForDirection({productModel:composed.productModel,screenGraph:composed.screenGraph,direction:{...base.direction,dna,navigationModel},catalogResources:catalogue,seed:id,briefDescription:description,diagnostics});
 if(diagnostics.length)throw new Error(`${id}: ${JSON.stringify(diagnostics)}`);
 manifest.id=id;manifest.name=showcase.name;manifest.description=`Example project. ${description}`;
 return ProjectManifestSchema.parse(manifest);
}
