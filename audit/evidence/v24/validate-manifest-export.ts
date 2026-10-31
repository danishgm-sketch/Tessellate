import { readFile } from 'node:fs/promises';
import { ProjectManifestSchema } from '../../../packages/schemas/src/index.js';

const file = new URL('./employee-experience-manifest-ui-export.tess.json', import.meta.url);
const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(file, 'utf8')));
const nodes = manifest.screens.flatMap((screen) => screen.rootNode ? [screen.rootNode] : []);
const refs: string[] = [];
const locks: string[] = [];
const visit = (node: typeof nodes[number]) => {
  if (node.resourceRef) refs.push(node.resourceRef);
  if (node.locked) locks.push(node.id);
  for (const child of node.children ?? []) visit(child);
};
for (const node of nodes) visit(node);
console.log(JSON.stringify({
  schema: 'ProjectManifestSchema',
  valid: true,
  projectId: manifest.id,
  name: manifest.name,
  screens: manifest.screens.length,
  resourceRefs: refs.length,
  uniqueResourceRefs: new Set(refs).size,
  lockedNodeIds: locks,
  exportBytes: (await readFile(file)).byteLength,
}, null, 2));
