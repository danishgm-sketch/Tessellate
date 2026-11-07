/* global console */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageDir, '../..');
const outputDir = path.join(packageDir, 'dist');
const catalogueSource = path.join(repoRoot, 'apps/site/public/data/catalog.json');

if (!fs.existsSync(catalogueSource)) {
  throw new Error(`Built catalogue not found at ${catalogueSource}; run "pnpm build:catalog" first.`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outputDir, 'data'), { recursive: true });

await build({
  entryPoints: [path.join(packageDir, 'src/bin.ts')],
  outfile: path.join(outputDir, 'index.cjs'),
  bundle: true,
  packages: 'bundle',
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['typescript'],
  legalComments: 'eof',
});

fs.copyFileSync(catalogueSource, path.join(outputDir, 'data/catalog.json'));
fs.chmodSync(path.join(outputDir, 'index.cjs'), 0o755);
console.log(`[tess] Built portable CLI at ${path.join(outputDir, 'index.cjs')}`);
