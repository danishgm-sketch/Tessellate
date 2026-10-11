import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTypographyResource } from './typography-builder';
import { TYPOGRAPHY_BATCH_1 } from './typography-batch-1';
import { TYPOGRAPHY_BATCH_2 } from './typography-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allTypography = [...TYPOGRAPHY_BATCH_1, ...TYPOGRAPHY_BATCH_2];

console.log(`Generating ${allTypography.length} Typography Effects resources...`);

for (const typo of allTypography) {
  writeTypographyResource(typo, repoRoot);
  console.log(`  ✓ Generated ${typo.slug}`);
}

console.log('Finished generating all typography resources!');
