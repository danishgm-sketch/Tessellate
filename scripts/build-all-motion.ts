import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeMotionResource } from './motion-builder';
import { MOTION_BATCH_1 } from './motion-batch-1';
import { MOTION_BATCH_2 } from './motion-batch-2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allMotion = [...MOTION_BATCH_1, ...MOTION_BATCH_2];

console.log(`Writing ${allMotion.length} motion and microinteraction resources to resources/motion/...`);

for (const motionRes of allMotion) {
  writeMotionResource(motionRes, repoRoot);
  console.log(`  ✓ ${motionRes.slug} (${motionRes.name})`);
}

console.log(`Successfully generated ${allMotion.length} motion resources.`);
