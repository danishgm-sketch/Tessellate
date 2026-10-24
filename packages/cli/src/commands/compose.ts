import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import type { ProjectManifest } from '@tessellate/schemas';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { composeProjectPipeline } from '@tessellate/compatibility';
import { getCatalogue } from './search.js';

export interface ComposeOptions {
  name?: string;
  archetype?: string;
  output?: string;
  cwd?: string;
}

export async function runCompose(promptText: string, options: ComposeOptions = {}): Promise<ProjectManifest> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const name = options.name || 'Composed Interface';
  console.log(`[tess] Composing interface system for: "${promptText}"...`);

  if (!promptText.trim()) throw new Error('[tess] A non-empty product brief is required to compose a project.');

  const catalogue = await getCatalogue(cwd);
  if (catalogue.resources.length === 0) {
    throw new Error('[tess] Cannot compose without a ready catalogue containing resources.');
  }

  const seed = `cli-${createHash('sha256').update(`${options.archetype ?? 'auto'}\0${promptText}`).digest('hex').slice(0, 16)}`;
  const composition = composeProjectPipeline(
    { description: promptText, archetypeOverride: options.archetype },
    { catalogResources: catalogue.resources, seed },
  );
  const diagnostics = composition.directionA.diagnostics ?? [];
  if (diagnostics.length > 0) {
    const unresolved = [...new Set(diagnostics.map((diagnostic) => diagnostic.role))];
    throw new Error(`[tess] Composition could not resolve required resource roles: ${unresolved.join(', ')}. No project was written.`);
  }

  console.log(`  • Detected Archetype: ${composition.productModel.productArchetypes[0]?.tag ?? 'saas'}`);
  console.log(`  • Planned Screens:    ${composition.screenGraph.groups.flatMap((group) => group.screens).length}`);
  console.log(`  • Resource Instances: ${composition.directionA.manifest.screens.reduce((count, screen) => count + countResourceNodes(screen.rootNode), 0)}`);

  const manifest: ProjectManifest = {
    ...composition.directionA.manifest,
    name,
  };

  // Validate output against ProjectManifestSchema
  const validated = ProjectManifestSchema.parse(manifest);

  if (options.output) {
    const outPath = path.resolve(cwd, options.output);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(validated, null, 2), 'utf-8');
    console.log(`[tess] Saved composed ProjectManifest to: ${outPath}`);
  }

  return validated;
}

function countResourceNodes(node: ProjectManifest['screens'][number]['rootNode']): number {
  return (node.resourceRef ? 1 : 0) + node.children.reduce((total, child) => total + countResourceNodes(child), 0);
}
