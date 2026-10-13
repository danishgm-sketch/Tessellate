import {z} from 'zod';
import {ProjectManifestSchema} from '@tessellate/schemas';
import type {Checkpoint} from '../history/checkpoints.js';
import {saveLocalCheckpoint,listLocalCheckpoints} from './storage.js';
const schema=z.object({id:z.string(),name:z.string(),timestamp:z.string(),type:z.enum(['auto','named']),trigger:z.enum(['initial-generation','pre-recompose','pre-ai','pre-blend','manual','pre-migration']),manifest:ProjectManifestSchema,description:z.string().optional()});
export async function loadCheckpointJournal(projectId:string):Promise<Checkpoint[]>{
 const raw=localStorage.getItem(`tessellate_checkpoints_${projectId}`);
 const journal=raw?schema.array().parse(JSON.parse(raw)):[];
 const stored=schema.array().parse(await listLocalCheckpoints(projectId));
 const values=new Map([...stored,...journal].map(checkpoint=>[checkpoint.id,checkpoint]));
 return [...values.values()].sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp));
}
export async function saveCheckpointJournal(projectId:string,checkpoints:Checkpoint[]):Promise<void>{
 const valid=schema.array().parse(checkpoints);
 localStorage.setItem(`tessellate_checkpoints_${projectId}`,JSON.stringify(valid));
 await Promise.all(valid.map(checkpoint=>saveLocalCheckpoint(projectId,checkpoint)));
}
