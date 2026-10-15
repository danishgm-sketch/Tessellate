import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { mapSourceFilesToProject, type IngestionResult } from '@tessellate/ingest';

export interface CliIngestOptions {
  output?: string;
  name?: string;
}

export async function runIngest(
  targetDir = '.',
  options: CliIngestOptions = {}
): Promise<IngestionResult> {
  const dir = path.resolve(targetDir);
  const outputPath = options.output || path.join(dir, 'tessellate.project.json');
  const projectName = options.name || path.basename(dir);

  console.log(`[tess] Ingesting codebase from: ${dir}...`);

  const filePaths = await glob('**/*.{tsx,jsx}', {
    cwd: dir,
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.git/**', '**/build/**'],
  });

  if (filePaths.length === 0) {
    console.warn(`[tess] No .tsx or .jsx files found in ${dir}`);
  }

  const files = filePaths.map((relPath) => ({
    filePath: relPath,
    code: fs.readFileSync(path.join(dir, relPath), 'utf-8'),
  }));

  const result = mapSourceFilesToProject(files, projectName);

  fs.writeFileSync(outputPath, JSON.stringify(result.projectManifest, null, 2), 'utf-8');

  console.log(`[tess] Successfully ingested ${result.sourceFileCount} screen file(s)!`);
  console.log(`  • Detected Palette:   ${result.inferredDna.detectedPalette}`);
  console.log(`  • Curvature Score:    ${result.inferredDna.detectedCurvature}/100`);
  console.log(`  • Visual Mode:        ${result.inferredDna.detectedVisualMode}`);
  console.log(`  • Extracted Screens:  ${result.screens.length}`);
  console.log(`[tess] Saved ProjectManifest AST to: ${outputPath}`);

  return result;
}
