import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProjectManifest } from '@tessellate/schemas';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import { interpretProductBrief, planScreenGraph } from '@tessellate/composer';

export interface ComposeOptions {
  name?: string;
  archetype?: string;
  output?: string;
  cwd?: string;
}

export async function runCompose(promptText: string, options: ComposeOptions = {}): Promise<ProjectManifest> {
  const name = options.name || 'Composed Interface';
  console.log(`[tess] Composing interface system for: "${promptText}"...`);

  // 1. Interpret product brief deterministically
  const { productModel } = interpretProductBrief({
    description: promptText,
    archetypeOverride: options.archetype,
  });

  // 2. Plan screen graph
  const screenPlan = planScreenGraph(productModel);

  console.log(`  • Detected Archetype: ${productModel.productArchetypes[0]?.tag ?? 'saas'}`);
  console.log(`  • Planned Screens:    ${screenPlan.totalScreens}`);

  // 3. Assemble validated ProjectManifest
  const now = new Date().toISOString();
  const manifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: `proj_${Date.now()}`,
    name,
    description: promptText,
    createdAt: now,
    updatedAt: now,
    catalogVersion: '1.0.0',
    seed: `tess-seed-${Date.now()}`,
    productModel,
    designDNA: DEFAULT_DESIGN_DNA,
    constraints: productModel.constraints,
    screenGraph: screenPlan.screenGraph,
    screens: [],
    navigation: {
      model: 'sidebar-fixed',
      primaryItems: [],
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 0,
      headRevision: 1,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };

  // Validate output against ProjectManifestSchema
  const validated = ProjectManifestSchema.parse(manifest);

  if (options.output) {
    const outPath = path.resolve(options.cwd || process.cwd(), options.output);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(validated, null, 2), 'utf-8');
    console.log(`[tess] Saved composed ProjectManifest to: ${outPath}`);
  }

  return validated;
}
