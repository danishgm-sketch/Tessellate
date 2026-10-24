// Packaging adapter only: retain Astro pages and React islands byte-for-byte.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'apps/site/dist');
const destination = path.join(
  root,
  process.argv.includes('--worker-assets') ? 'apps/sites/.static' : 'dist'
);
if (!existsSync(path.join(source, 'index.html'))) {
  throw new Error('Run pnpm build before preparing the Sites artifact.');
}
// The fixed output path is inside this checkout, never an externally supplied path.
if (![path.join(root, 'dist'), path.join(root, 'apps/sites/.static')].includes(destination))
  throw new Error('Invalid artifact destination.');
rmSync(destination, { recursive: true, force: true });
if (process.argv.includes('--worker-assets')) {
  const rootOutput = path.join(root, 'dist');
  if (path.dirname(rootOutput) !== root) throw new Error('Invalid Worker output directory.');
  rmSync(rootOutput, { recursive: true, force: true });
}
const assetsDestination = process.argv.includes('--worker-assets')
  ? path.join(destination, '__tessellate_asset_payloads')
  : destination;
cpSync(source, assetsDestination, { recursive: true });

// Existing detail/preview pages reference this development stylesheet URL.
// Serve the already compiled canonical stylesheet at that URL on static hosting.
const styles = readdirSync(path.join(source, '_astro')).filter((name) => name.endsWith('.css'));
if (styles.length !== 1)
  throw new Error('Expected one canonical stylesheet; review Astro output before packaging.');
mkdirSync(path.join(assetsDestination, 'src/styles'), { recursive: true });
cpSync(
  path.join(source, '_astro', styles[0]),
  path.join(assetsDestination, 'src/styles/global.css')
);

const catalog = JSON.parse(readFileSync(path.join(assetsDestination, 'data/catalog.json'), 'utf8'));
if (catalog.count !== 324 || catalog.resources.length !== 324)
  throw new Error('Incomplete catalogue.');
if (
  readFileSync(path.join(source, '_headers'), 'utf8') !==
  readFileSync(path.join(assetsDestination, '_headers'), 'utf8')
) {
  throw new Error('Security headers changed during packaging.');
}
const required = [
  'index.html',
  'explore/index.html',
  'compose/index.html',
  'workbench/index.html',
  'preview/index.html',
  'preview-content/index.html',
  'showcases/index.html',
  'r/index.json',
];
for (const file of required) {
  if (!statSync(path.join(assetsDestination, file), { throwIfNoEntry: false })?.isFile())
    throw new Error(`Missing artifact: ${file}`);
}

const previewHtml = readFileSync(path.join(assetsDestination, 'preview-content/index.html'), 'utf8');
const hashInline = (content) => `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
const inlineScriptHashes = [...previewHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\bsrc\s*=/i.test(attributes ?? ''))
  .map(([, , content]) => hashInline(content ?? ''));
const previewStyleHashes = [...previewHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
  ([, content]) => hashInline(content ?? '')
);
function collectResourceInlineStyleHashes(directory) {
  const hashes = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      hashes.push(...collectResourceInlineStyleHashes(entryPath));
    } else if (/\.(?:tsx|jsx)$/.test(entry.name)) {
      const sourceText = readFileSync(entryPath, 'utf8');
      for (const [, content] of sourceText.matchAll(/<style>\{`([\s\S]*?)`\}<\/style>/g)) {
        if (content.includes('${')) {
          throw new Error(`Cannot certify a dynamic inline style block in ${entryPath}.`);
        }
        hashes.push(hashInline(content));
      }
    }
  }
  return hashes;
}
const resourceInlineStyleHashes = collectResourceInlineStyleHashes(path.join(root, 'resources'));
// WebKit reports the no-op inline rule `body {}` in preview frames during the
// multi-preview workflow. Certify only that exact empty rule rather than allowing
// general inline styles; it has no visual effect and does not broaden script policy.
const webkitEmptyBodyStyleHash = hashInline('body {}');
const inlineStyleHashes = [
  ...new Set([...previewStyleHashes, ...resourceInlineStyleHashes, webkitEmptyBodyStyleHash]),
];
if (inlineScriptHashes.length === 0 || inlineStyleHashes.length === 0) {
  throw new Error('Preview CSP hash generation expected inline scripts and resource style blocks.');
}

function collectSiteInlineHashes(directory) {
  const scripts = new Set();
  const styles = new Set();
  let htmlPages = 0;
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['preview', 'preview-content'].includes(path.relative(directory, file).split(path.sep).join('/'))) visit(file);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      htmlPages += 1;
      const html = readFileSync(file, 'utf8');
      for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!/\bsrc\s*=/i.test(attributes ?? '')) scripts.add(hashInline(content ?? ''));
      }
      for (const [, content] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
        styles.add(hashInline(content ?? ''));
      }
    }
  };
  visit(directory);
  if (htmlPages === 0 || scripts.size === 0) {
    throw new Error('Site CSP hash generation expected public HTML pages and inline scripts.');
  }
  return { htmlPages, scripts: [...scripts], styles: [...styles] };
}

const siteInlineHashes = collectSiteInlineHashes(assetsDestination);
const cspModulePath = path.join(root, 'apps/sites/src/generated-preview-csp.ts');
mkdirSync(path.dirname(cspModulePath), { recursive: true });
writeFileSync(
  cspModulePath,
  `// Generated from the canonical Astro preview HTML during Sites packaging.\n` +
    `export const PREVIEW_INLINE_SCRIPT_HASHES = ${JSON.stringify(inlineScriptHashes)} as const;\n` +
    `export const PREVIEW_INLINE_STYLE_HASHES = ${JSON.stringify(inlineStyleHashes)} as const;\n` +
    `// Public shell hashes cover ${siteInlineHashes.htmlPages} canonical Astro HTML files, excluding the isolated preview route.\n` +
    `export const SITE_INLINE_SCRIPT_HASHES = ${JSON.stringify(siteInlineHashes.scripts)} as const;\n` +
    `export const SITE_INLINE_STYLE_HASHES = ${JSON.stringify(siteInlineHashes.styles)} as const;\n`
);
process.stdout.write(
  `Sites artifact prepared: canonical Astro output, 324 resources, ${siteInlineHashes.htmlPages} public HTML CSP records (${siteInlineHashes.scripts.length} script hashes), preserved header declarations.\n`
);

// Sites serves matching asset paths before the Worker despite run_worker_first.
// Keep payloads behind an internal prefix. HTML payloads have binary extensions,
// so the host cannot expose an executable HTML route without Worker CSP headers.
if (process.argv.includes('--worker-assets')) {
  const renameHtml = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) renameHtml(filename);
      else if (entry.name.endsWith('.html')) renameSync(filename, filename + '.bin');
    }
  };
  renameHtml(assetsDestination);
  cpSync(path.join(source, '_headers'), path.join(destination, '_headers'));
}
