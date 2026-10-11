import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeAIResource } from './ai-builder';
import { AI_BATCH_1 } from './ai-batch-1';
import { AI_BATCH_2 } from './ai-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allAI = [...AI_BATCH_1, ...AI_BATCH_2];

console.log(`Writing ${allAI.length} AI interaction patterns to resources/ai/...`);

for (const aiRes of allAI) {
  writeAIResource(aiRes, repoRoot);
  console.log(`  ✓ ${aiRes.slug} (${aiRes.name})`);
}

console.log(`Successfully generated ${allAI.length} AI interaction patterns.`);
