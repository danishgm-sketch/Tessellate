import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeStateResource } from './states-builder';
import { STATES_BATCH_1 } from './states-batch-1';
import { STATES_BATCH_2 } from './states-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allStates = [...STATES_BATCH_1, ...STATES_BATCH_2];

console.log(`Generating ${allStates.length} State resources...`);

for (const state of allStates) {
  writeStateResource(state, repoRoot);
  console.log(`  ✓ Generated ${state.slug}`);
}

console.log('Finished generating all state resources!');
