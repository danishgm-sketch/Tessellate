import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeDataResource } from './data-builder';
import { DATA_BATCH_1 } from './data-batch-1';
import { DATA_BATCH_2 } from './data-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allData = [...DATA_BATCH_1, ...DATA_BATCH_2];

console.log(`Writing ${allData.length} data visualization resources to resources/data/...`);

for (const dataRes of allData) {
  writeDataResource(dataRes, repoRoot);
  console.log(`  ✓ ${dataRes.slug} (${dataRes.name})`);
}

console.log(`Successfully generated ${allData.length} data visualization resources.`);
