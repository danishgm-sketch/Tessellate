import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeSection } from './sections-builder.js';
import { SECTIONS_BATCH_1 } from './sections-batch-1.js';
import { SECTIONS_BATCH_2 } from './sections-batch-2.js';
import { SECTIONS_BATCH_3 } from './sections-batch-3.js';
import { SECTIONS_BATCH_4 } from './sections-batch-4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allSections = [
  ...SECTIONS_BATCH_1,
  ...SECTIONS_BATCH_2,
  ...SECTIONS_BATCH_3,
  ...SECTIONS_BATCH_4,
];

console.log(`Building ${allSections.length} canonical marketing sections...`);

const slugs = new Set<string>();
for (const s of allSections) {
  if (slugs.has(s.slug)) {
    throw new Error(`Duplicate slug detected: ${s.slug}`);
  }
  slugs.add(s.slug);
  writeSection(s, repoRoot);
}

console.log(`Successfully generated ${allSections.length} sections in resources/sections/!`);
