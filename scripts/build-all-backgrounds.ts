import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeBackgroundResource } from './backgrounds-builder';
import { BACKGROUNDS_BATCH_1 } from './backgrounds-batch-1';
import { BACKGROUNDS_BATCH_2 } from './backgrounds-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allBackgrounds = [...BACKGROUNDS_BATCH_1, ...BACKGROUNDS_BATCH_2];

console.log(`Generating ${allBackgrounds.length} Backgrounds & Effects resources...`);

for (const bg of allBackgrounds) {
  writeBackgroundResource(bg, repoRoot);
  console.log(`  ✓ Generated ${bg.slug}`);
}

console.log('Finished generating all backgrounds!');
