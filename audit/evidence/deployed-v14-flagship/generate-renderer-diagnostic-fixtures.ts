import { writeFile } from 'node:fs/promises';
import { createRendererParityProject } from '../../../packages/testing/src/renderer-parity-fixture.js';
import { ProjectManifestSchema } from '../../../packages/schemas/src/project.js';

const outputDir = new URL('.', import.meta.url);

const parity = createRendererParityProject();
parity.id = 'deployed-renderer-parity-diagnostic';
parity.name = 'Renderer parity diagnostic';
parity.updatedAt = new Date().toISOString();
const root = parity.screens[0]!.rootNode;
root.children.push({
  id: 'parity-hostless-dialog',
  nodeType: 'component',
  semanticRole: 'dialog',
  resourceRef: { id: 'res_primitive_dialog', slug: 'dialog', version: '1.0.0' },
  variant: 'quiet',
  props: { open: true, title: 'Hostless dialog', children: 'Dialog closes with Escape.' },
  slots: {},
  children: [],
});
const validatedParity = ProjectManifestSchema.parse(parity);
await writeFile(new URL('deployed-renderer-parity-diagnostic.tess.json', outputDir), `${JSON.stringify(validatedParity, null, 2)}\n`);

const unsupported = structuredClone(parity);
unsupported.id = 'deployed-unsupported-variant-diagnostic';
unsupported.name = 'Unsupported variant diagnostic';
unsupported.updatedAt = new Date(Date.now() + 1).toISOString();
const unsupportedButton = unsupported.screens[0]!.rootNode.children.find((node) => node.id === 'parity-data-attribute-action');
if (!unsupportedButton) throw new Error('The parity action fixture is missing.');
unsupportedButton.variant = 'deliberately-unsupported';
const validatedUnsupported = ProjectManifestSchema.parse(unsupported);
await writeFile(new URL('deployed-unsupported-variant-diagnostic.tess.json', outputDir), `${JSON.stringify(validatedUnsupported, null, 2)}\n`);

process.stdout.write(JSON.stringify({
  parity: { id: validatedParity.id, screens: validatedParity.screens.length, nodes: root.children.length },
  unsupported: { id: validatedUnsupported.id, variant: unsupportedButton.variant },
}, null, 2));
