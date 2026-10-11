import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePrimitive } from './primitives-builder.js';
import { BATCH_1 } from './primitives-batch-1.js';
import { BATCH_2 } from './primitives-batch-2.js';
import { BATCH_3 } from './primitives-batch-3.js';
import { validateResource } from '../packages/catalog/src/validator.js';
import { loadJsonManifest } from '../packages/catalog/src/loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const ALL_NEW_PRIMITIVES = [...BATCH_1, ...BATCH_2, ...BATCH_3];

console.log(`[primitives-build] Generating ${ALL_NEW_PRIMITIVES.length} canonical primitives...`);

let successCount = 0;
let errorCount = 0;

for (const def of ALL_NEW_PRIMITIVES) {
  writePrimitive(def, repoRoot);

  const resourceDir = path.join(repoRoot, 'resources', 'primitives', def.slug);
  const manifestPath = path.join(resourceDir, 'manifest.json');
  const rawManifest = loadJsonManifest(manifestPath);

  const validation = validateResource(resourceDir, rawManifest);
  if (!validation.valid) {
    console.error(`[primitives-build] ✕ Validation failed for ${def.slug}:`);
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    errorCount++;
  } else {
    successCount++;
  }
}

console.log(`\n[primitives-build] Complete: ${successCount} passed validation, ${errorCount} failed.`);
if (errorCount > 0) {
  process.exit(1);
}
