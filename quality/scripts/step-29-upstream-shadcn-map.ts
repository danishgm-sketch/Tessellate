import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDirectory = path.join(repositoryRoot, 'quality/evidence/step-29/upstream-shadcn');
const sourceRoot = process.argv[2];
if (!sourceRoot) {
  throw new Error(
    'Usage: pnpm exec tsx quality/scripts/step-29-upstream-shadcn-map.ts <tracked-app-source-dir>'
  );
}

async function main(): Promise<void> {
  const workspaceRequire = createRequire(path.join(repositoryRoot, 'packages/cli/src/index.ts'));
  const { glob } = await import(pathToFileURL(workspaceRequire.resolve('glob')).href);
  const sourceFiles = (
    await glob('**/*.{tsx,jsx}', {
      cwd: sourceRoot,
      nodir: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.git/**', '**/build/**'],
    })
  ).sort((a, b) => a.localeCompare(b));
  const files = sourceFiles.map((filePath) => ({
    filePath,
    code: fs.readFileSync(path.join(sourceRoot, filePath), 'utf8'),
  }));
  const ingestPath = workspaceRequire.resolve('@tessellate/ingest');
  const { mapSourceFilesToProject } = await import(pathToFileURL(ingestPath).href);
  const result = mapSourceFilesToProject(files, 'Pinned shadcn v4 source audit');

  assert.equal(result.sourceFileCount, 3504);
  assert.equal(result.screens.length, 19);
  assert.ok(result.screens.some((screen) => screen.route === '/'));
  assert.ok(result.screens.some((screen) => screen.layoutFilePaths.length > 1));
  for (const screen of result.screens) {
    assert.ok(
      screen.layoutFilePaths.every((layoutPath) => result.layoutFilePaths.includes(layoutPath)),
      `${screen.route} must only reference discovered layout source files`
    );
  }

  const evidence = {
    status: 'PASS',
    sourceFileCount: result.sourceFileCount,
    routeCount: result.screens.length,
    layoutFileCount: result.layoutFilePaths.length,
    routes: result.screens.map(({ route, filePath, layoutFilePaths }) => ({
      route,
      sourceFile: filePath,
      layoutFilePaths,
    })),
    warnings: result.warnings,
    sourceModifiedByMapping: false,
  };
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(evidenceDirectory, 'mapping.json'),
    `${JSON.stringify(evidence, null, 2)}\n`
  );
  console.log(JSON.stringify(evidence, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
