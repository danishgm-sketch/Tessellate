import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

interface Budget {
  target: string;
  maxGzipBytes: number;
  description: string;
}

const BUDGETS: Budget[] = [
  {
    target: 'client',
    maxGzipBytes: 150 * 1024, // < 150 KB gzip
    description: 'Public initial JS bundle',
  },
  {
    target: 'ExploreView',
    maxGzipBytes: 200 * 1024, // < 200 KB gzip
    description: 'Catalogue explore view bundle',
  },
  {
    target: 'workbench',
    maxGzipBytes: 750 * 1024, // < 750 KB gzip
    description: 'Workbench studio application route bundle',
  },
];

function getGzipSize(filePath: string): number {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

function runBundleAudit() {
  console.log('--- AUDITING BUNDLE BUDGETS ---');
  const astroDir = path.resolve('apps/site/dist/_astro');

  if (!fs.existsSync(astroDir)) {
    throw new Error(`Directory ${astroDir} does not exist. Run site build first.`);
  }

  const files = fs.readdirSync(astroDir);
  let allPassed = true;

  for (const budget of BUDGETS) {
    const matchedFiles = files.filter((f) => f.includes(budget.target) && f.endsWith('.js'));
    if (matchedFiles.length === 0) {
      console.warn(`[WARN] No file matched target pattern: ${budget.target}`);
      continue;
    }

    for (const file of matchedFiles) {
      const fullPath = path.join(astroDir, file);
      const rawBytes = fs.statSync(fullPath).size;
      const gzipBytes = getGzipSize(fullPath);
      const passed = gzipBytes <= budget.maxGzipBytes;

      const rawKb = (rawBytes / 1024).toFixed(2);
      const gzipKb = (gzipBytes / 1024).toFixed(2);
      const limitKb = (budget.maxGzipBytes / 1024).toFixed(0);

      if (passed) {
        console.log(`[PASS] ${budget.description} (${file}): ${gzipKb} KB gzip (${rawKb} KB raw) <= ${limitKb} KB budget`);
      } else {
        console.error(`[FAIL] ${budget.description} (${file}): ${gzipKb} KB gzip EXCEEDS limit of ${limitKb} KB!`);
        allPassed = false;
      }
    }
  }

  // Check search index / catalog data size
  const catalogPath = path.resolve('apps/site/public/data/catalog.min.json');
  if (fs.existsSync(catalogPath)) {
    const catalogGzip = getGzipSize(catalogPath);
    const catalogGzipKb = (catalogGzip / 1024).toFixed(2);
    const searchLimitKb = 2048; // 2 MB
    if (catalogGzip <= 2 * 1024 * 1024) {
      console.log(`[PASS] Search catalog data: ${catalogGzipKb} KB gzip <= ${searchLimitKb} KB budget`);
    } else {
      console.error(`[FAIL] Search catalog data: ${catalogGzipKb} KB gzip EXCEEDS 2 MB budget!`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.error('Bundle budget audit failed.');
    process.exit(1);
  }
  console.log('Bundle budget audit passed successfully.');
}

runBundleAudit();
