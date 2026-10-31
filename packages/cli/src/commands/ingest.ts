import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import type { IngestionResult } from '@tessellate/ingest';

export interface CliIngestOptions {
  output?: string;
  name?: string;
}

export async function runIngest(
  targetDir = '.',
  options: CliIngestOptions = {}
): Promise<IngestionResult> {
  const dir = path.resolve(targetDir);
  const outputPath = options.output
    ? path.resolve(dir, options.output)
    : path.join(dir, 'tessellate.project.json');
  const projectName = options.name || path.basename(dir);

  console.log(`[tess] Ingesting codebase from: ${dir}...`);

  const filePaths = await glob('**/*.{tsx,jsx}', {
    cwd: dir,
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.git/**', '**/build/**'],
  });

  if (filePaths.length === 0) {
    throw new Error(
      `[tess] No React source files (.tsx or .jsx) found in ${dir}; no manifest was written.`
    );
  }

  const files = filePaths.map((relPath) => ({
    filePath: relPath,
    code: fs.readFileSync(path.join(dir, relPath), 'utf-8'),
  }));

  const absoluteSourcePaths = new Set(
    filePaths.map((filePath) => path.resolve(dir, filePath).toLowerCase())
  );
  const realSourcePaths = new Set(
    filePaths.map((filePath) => fs.realpathSync(path.join(dir, filePath)).toLowerCase())
  );
  const realOutputPath = fs.existsSync(outputPath)
    ? fs.realpathSync(outputPath).toLowerCase()
    : undefined;
  if (
    absoluteSourcePaths.has(outputPath.toLowerCase()) ||
    (realOutputPath && realSourcePaths.has(realOutputPath))
  ) {
    throw new Error(
      `[tess] Refusing to write the imported manifest over a source file: ${outputPath}`
    );
  }

  const { mapSourceFilesToProject } = await import('@tessellate/ingest');
  const result = mapSourceFilesToProject(files, projectName);

  fs.writeFileSync(outputPath, JSON.stringify(result.projectManifest, null, 2), 'utf-8');

  console.log(
    `[tess] Identified ${result.screens.length} React route(s) across ${result.sourceFileCount} source file(s).`
  );
  console.log(`  • Detected Palette:   ${result.inferredDna.detectedPalette}`);
  console.log(`  • Curvature Score:    ${result.inferredDna.detectedCurvature}/100`);
  console.log(`  • Visual Mode:        ${result.inferredDna.detectedVisualMode}`);
  console.log(
    `  • Design DNA evidence: ${result.inferredDna.inferredFields.join(', ') || 'none'}; ${result.inferredDna.defaultedFields.length} schema defaults are not inferred`
  );
  console.log(`  • Product intent:     not inferred`);
  console.log(`  • Original source:    unchanged`);
  for (const warning of result.warnings) console.log(`[tess] Scope: ${warning}`);
  console.log(`[tess] Saved partial ProjectManifest to: ${outputPath}`);

  return result;
}
