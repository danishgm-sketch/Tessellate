import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

interface RouteBudget {
  route: string;
  maxGzipBytes: number;
  description: string;
}

interface RouteBundle {
  assets: string[];
  missingAssets: string[];
  rawBytes: number;
  gzipBytes: number;
}

const ROUTE_BUDGETS: RouteBudget[] = [
  {
    route: 'index.html',
    maxGzipBytes: 150 * 1024,
    description: 'Homepage eager hydration bundle',
  },
  {
    route: 'explore/index.html',
    maxGzipBytes: 200 * 1024,
    description: 'Explore route eager hydration bundle',
  },
  {
    route: 'compose/index.html',
    maxGzipBytes: 750 * 1024,
    description: 'Compose route eager hydration bundle',
  },
  {
    route: 'workbench/index.html',
    maxGzipBytes: 750 * 1024,
    description: 'Workbench route eager hydration bundle',
  },
];

function getIslandAttribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];
}

function getInitialJavaScriptUrls(html: string): string[] {
  const urls = new Set<string>();

  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js(?:\?[^"]*)?)"[^>]*>/gi)) {
    urls.add(match[1]!);
  }

  for (const match of html.matchAll(/<astro-island\b[^>]*>/gi)) {
    const tag = match[0];
    const client = getIslandAttribute(tag, 'client');
    if (client !== 'load' && client !== 'only') continue;

    for (const attribute of ['component-url', 'renderer-url']) {
      const url = getIslandAttribute(tag, attribute);
      if (url?.endsWith('.js')) urls.add(url);
    }
  }

  return [...urls];
}

function getAssetPath(url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url, 'https://tessellate.invalid').pathname;
    pathname = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }

  return pathname.startsWith('/_astro/') ? pathname.slice('/_astro/'.length) : undefined;
}

function getStaticJavaScriptImports(source: string): string[] {
  const imports = new Set<string>();
  let remaining = source.trimStart();
  while (/^(?:import|export)\b/.test(remaining)) {
    const declaration = remaining.match(/^(?:import|export)\b[^;]*;/)?.[0];
    if (!declaration) break;

    const reExport = declaration.match(/\bfrom\s*["']([^"']+\.js(?:\?[^"']*)?)["']/);
    const sideEffectImport = declaration.match(/^import\s*["']([^"']+\.js(?:\?[^"']*)?)["']/);
    const url = reExport?.[1] ?? sideEffectImport?.[1];
    if (url) imports.add(url);

    remaining = remaining.slice(declaration.length).trimStart();
  }
  return [...imports];
}

export function calculateRouteBundle(html: string, astroDir: string): RouteBundle {
  const root = path.resolve(astroDir);
  const assets = new Set<string>();
  const missingAssets = new Set<string>();

  const visit = (url: string, importer?: string): void => {
    const cleanUrl = url.split(/[?#]/, 1)[0]!;
    const relative = importer && !cleanUrl.startsWith('/')
      ? path.posix.join(path.posix.dirname(importer), cleanUrl)
      : getAssetPath(cleanUrl);
    if (!relative) return;

    const normalized = path.posix.normalize(relative);
    const fullPath = path.resolve(root, normalized);
    if (!fullPath.startsWith(`${root}${path.sep}`)) {
      missingAssets.add(url);
      return;
    }

    const assetName = normalized.replaceAll('\\', '/');
    if (assets.has(assetName) || missingAssets.has(assetName)) return;
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      missingAssets.add(assetName);
      return;
    }

    assets.add(assetName);
    const source = fs.readFileSync(fullPath, 'utf8');
    for (const importedUrl of getStaticJavaScriptImports(source)) visit(importedUrl, assetName);
  };

  for (const url of getInitialJavaScriptUrls(html)) visit(url);

  let rawBytes = 0;
  let gzipBytes = 0;
  for (const asset of assets) {
    const filePath = path.join(root, asset);
    const contents = fs.readFileSync(filePath);
    rawBytes += contents.byteLength;
    gzipBytes += zlib.gzipSync(contents).byteLength;
  }

  return {
    assets: [...assets].sort(),
    missingAssets: [...missingAssets].sort(),
    rawBytes,
    gzipBytes,
  };
}

function runBundleAudit(): void {
  console.log('--- AUDITING EAGER ROUTE BUNDLE BUDGETS ---');
  const distDir = path.resolve('apps/site/dist');
  const astroDir = path.join(distDir, '_astro');

  if (!fs.existsSync(astroDir)) {
    throw new Error(`Directory ${astroDir} does not exist. Run site build first.`);
  }

  let allPassed = true;
  for (const budget of ROUTE_BUDGETS) {
    const htmlPath = path.join(distDir, budget.route);
    if (!fs.existsSync(htmlPath)) {
      console.error(`[FAIL] ${budget.description}: missing built route ${budget.route}`);
      allPassed = false;
      continue;
    }

    const report = calculateRouteBundle(fs.readFileSync(htmlPath, 'utf8'), astroDir);
    const limitKb = (budget.maxGzipBytes / 1024).toFixed(0);
    if (report.assets.length === 0) {
      console.error(`[FAIL] ${budget.description}: no eager JavaScript assets found`);
      allPassed = false;
      continue;
    }
    if (report.missingAssets.length > 0) {
      console.error(`[FAIL] ${budget.description}: missing imports: ${report.missingAssets.join(', ')}`);
      allPassed = false;
      continue;
    }

    const gzipKb = (report.gzipBytes / 1024).toFixed(2);
    const rawKb = (report.rawBytes / 1024).toFixed(2);
    const status = report.gzipBytes <= budget.maxGzipBytes ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${budget.description}: ${gzipKb} KB gzip (${rawKb} KB raw, ${report.assets.length} files) ${report.gzipBytes <= budget.maxGzipBytes ? '<=' : '>'} ${limitKb} KB budget`);
    if (report.gzipBytes > budget.maxGzipBytes) allPassed = false;
  }

  const catalogPath = path.resolve('apps/site/public/data/catalog.min.json');
  if (fs.existsSync(catalogPath)) {
    const catalogGzip = zlib.gzipSync(fs.readFileSync(catalogPath)).byteLength;
    const catalogBudget = 2 * 1024 * 1024;
    const status = catalogGzip <= catalogBudget ? 'PASS' : 'FAIL';
    console.log(`[${status}] Search catalog data: ${(catalogGzip / 1024).toFixed(2)} KB gzip <= 2048 KB budget`);
    if (catalogGzip > catalogBudget) allPassed = false;
  }

  if (!allPassed) {
    console.error('Bundle budget audit failed.');
    process.exit(1);
  }
  console.log('Bundle budget audit passed successfully.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runBundleAudit();
}
