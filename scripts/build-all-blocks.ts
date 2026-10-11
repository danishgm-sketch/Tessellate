import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeBlock } from './blocks-builder';
import { BLOCKS_BATCH_1 } from './blocks-batch-1';
import { BLOCKS_BATCH_2 } from './blocks-batch-2';
import { BLOCKS_BATCH_3 } from './blocks-batch-3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allBlocks = [...BLOCKS_BATCH_1, ...BLOCKS_BATCH_2, ...BLOCKS_BATCH_3];

console.log(`Writing ${allBlocks.length} application blocks to resources/blocks/...`);

for (const block of allBlocks) {
  writeBlock(block, repoRoot);
  console.log(`  ✓ ${block.slug} (${block.name})`);
}

console.log(`Successfully generated ${allBlocks.length} application blocks.`);
