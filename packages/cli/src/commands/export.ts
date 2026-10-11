import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { generateSourceTree } from '@tessellate/exporter';

export interface ExportOptions {
  output?: string;
  cwd?: string;
}

export async function runExport(manifestPath = 'project.json', options: ExportOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const fullManifestPath = path.resolve(cwd, manifestPath);

  if (!fs.existsSync(fullManifestPath)) {
    console.error(`[tess] ProjectManifest file not found: ${fullManifestPath}`);
    return { success: false, error: 'Manifest file not found' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(fullManifestPath, 'utf-8'));
  } catch (err) {
    console.error(`[tess] Failed to parse JSON in ${manifestPath}:`, (err as Error).message);
    return { success: false, error: 'Invalid JSON' };
  }

  const parsed = ProjectManifestSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`[tess] Invalid ProjectManifest:`);
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    return { success: false, error: 'Schema validation failed' };
  }

  const manifest = parsed.data;
  console.log(`[tess] Generating standalone project source tree for "${manifest.name}"...`);

  const fileTree = generateSourceTree(manifest);
  const targetDir = path.resolve(cwd, options.output || './dist/export');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let writtenCount = 0;
  for (const [relPath, content] of Object.entries(fileTree)) {
    const dest = path.join(targetDir, relPath);
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(dest, content, 'utf-8');
    writtenCount++;
  }

  console.log(`[tess] Successfully exported ${writtenCount} files to: ${targetDir}`);
  return {
    success: true,
    targetDir,
    writtenCount,
    files: Object.keys(fileTree),
  };
}
