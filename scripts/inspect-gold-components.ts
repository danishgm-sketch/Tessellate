import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOLD_40_SLUGS } from '../packages/catalog/src/gold.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const resourcesDir = path.join(rootDir, 'resources');

const categories = fs.readdirSync(resourcesDir);
const results: Array<{ slug: string; file: string; relPath: string; exports: string[] }> = [];

for (const slug of GOLD_40_SLUGS) {
  let foundFile: string | null = null;
  let catFound = '';
  for (const cat of categories) {
    const candidate = path.join(resourcesDir, cat, slug, 'index.tsx');
    if (fs.existsSync(candidate)) {
      foundFile = candidate;
      catFound = cat;
      break;
    }
  }

  if (!foundFile) {
    console.error(`Missing resource component for slug: ${slug}`);
    continue;
  }

  const content = fs.readFileSync(foundFile, 'utf-8');
  // Simple regex to find exported functions / consts / default
  const exportMatches = [
    ...content.matchAll(/export\s+(?:function|const|class)\s+([A-Za-z0-9_]+)/g)
  ].map(m => m[1]);
  const hasDefault = /export\s+default\s+/.test(content);

  results.push({
    slug,
    file: foundFile,
    relPath: `../../../resources/${catFound}/${slug}/index.js`,
    exports: [...exportMatches, ...(hasDefault ? ['default'] : [])],
  });
}

console.log(JSON.stringify(results, null, 2));
