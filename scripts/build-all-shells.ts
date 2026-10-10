import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeShell } from './shells-builder.js';
import { SHELLS_BATCH_1 } from './shells-batch-1.js';
import { SHELLS_BATCH_2 } from './shells-batch-2.js';
import { validateResource } from '../packages/catalog/src/validator.js';
import { loadJsonManifest } from '../packages/catalog/src/loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const ALL_SHELLS = [...SHELLS_BATCH_1, ...SHELLS_BATCH_2];

console.log(`[shells-build] Generating ${ALL_SHELLS.length} canonical navigation & application shells...`);

let successCount = 0;
let errorCount = 0;

for (const def of ALL_SHELLS) {
  writeShell(def, repoRoot);

  const resourceDir = path.join(repoRoot, 'resources', 'shells', def.slug);
  const manifestPath = path.join(resourceDir, 'manifest.json');
  const rawManifest = loadJsonManifest(manifestPath);

  const validation = validateResource(resourceDir, rawManifest);
  if (!validation.valid) {
    console.error(`[shells-build] ✕ Validation failed for ${def.slug}:`);
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    errorCount++;
  } else {
    successCount++;
  }
}

console.log(`\n[shells-build] Complete: ${successCount} passed validation, ${errorCount} failed.`);
if (errorCount > 0) {
  process.exit(1);
}
