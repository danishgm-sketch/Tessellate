import fs from 'node:fs';
import path from 'node:path';
import {ResourceManifestSchema} from '@tessellate/schemas';
export function readCatalogue(){
 const candidates=[path.resolve('apps/site/public/data/catalog.json'),path.resolve('public/data/catalog.json')];
 const location=candidates.find(candidate=>fs.existsSync(candidate));
 if(!location)throw new Error('Build catalogue before rendering public routes.');
 return ResourceManifestSchema.array().parse(JSON.parse(fs.readFileSync(location,'utf8')).resources);
}
