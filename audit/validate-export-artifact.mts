import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {ProjectManifestSchema,type ProjectNode} from '../packages/schemas/src/project.js';
import {isGoldResource} from '../packages/catalog/src/gold.js';
const folder=process.env.STANDALONE_AUDIT_FOLDER??'audit/evidence/deployed-version-6/flagship';
const load=async(file:string)=>JSON.parse(await readFile(path.join(folder,file),'utf8'));
const downloaded=ProjectManifestSchema.parse(await load('12-final-manifest.tess.json'));
const exported=ProjectManifestSchema.parse(await load('standalone/project.tess.json'));
const result=await load('result.json');
assert.deepEqual(exported,downloaded,'ZIP manifest must equal the final UI download');
const catalogue=JSON.parse(await readFile('apps/site/public/data/catalog.json','utf8')).resources;
const walk=(node:ProjectNode):ProjectNode[]=>[node,...node.children.flatMap(walk)];
const nodes=exported.screens.flatMap(screen=>walk(screen.rootNode));
const references=nodes.flatMap(node=>node.resourceRef?[node.resourceRef]:[]);
for(const ref of references){const match=catalogue.find((resource:{id:string;slug:string;version:string})=>resource.id===ref.id&&resource.slug===ref.slug&&resource.version===ref.version);assert(match,`Canonical resource missing: ${ref.slug}`);assert(isGoldResource(ref.slug),`Unsupported runtime resource: ${ref.slug}`);}
assert.deepEqual(nodes.find(node=>node.id===result.locked.id),result.locked,'Locked subtree must remain exact in export');
assert(nodes.some(node=>node.resourceRef?.slug===result.replacedSlug),'Final replacement must exist');
const pkg=await load('standalone/package.json');
assert(!Object.keys({...pkg.dependencies,...pkg.devDependencies}).some(name=>name.startsWith('@tessellate/')));
const sourceFiles:string[]=[];
async function inspect(dir:string){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await inspect(file);else{sourceFiles.push(file);assert(!(await readFile(file,'utf8')).includes('@tessellate/'),`Runtime lock-in in ${file}`);}}}
await inspect(path.join(folder,'standalone/src'));
await writeFile(path.join(folder,'export-validation.json'),JSON.stringify({status:'PASS',projectId:exported.id,canonicalSchema:true,exactUiManifest:true,canonicalResourceReferences:references.length,unresolvedResources:0,syntheticResources:0,lockedSubtreeExact:true,replacedSlug:result.replacedSlug,tessellateRuntimeDependencies:0,sourceFiles:sourceFiles.length},null,2));
console.log(JSON.stringify({status:'PASS',projectId:exported.id,references:references.length}));
