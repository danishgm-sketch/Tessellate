// Packaging adapter only: retain Astro pages and React islands byte-for-byte.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'apps/site/dist');
const destination = path.join(root, process.argv.includes('--worker-assets') ? 'apps/sites/.static' : 'dist');
if (!existsSync(path.join(source, 'index.html'))) {
  throw new Error('Run pnpm build before preparing the Sites artifact.');
}
// The fixed output path is inside this checkout, never an externally supplied path.
if (![path.join(root,'dist'),path.join(root,'apps/sites/.static')].includes(destination)) throw new Error('Invalid artifact destination.');
rmSync(destination, { recursive: true, force: true });
if(process.argv.includes('--worker-assets')){
 const rootOutput=path.join(root,'dist');
 if(path.dirname(rootOutput)!==root)throw new Error('Invalid Worker output directory.');
 rmSync(rootOutput,{recursive:true,force:true});
}
const assetsDestination=process.argv.includes('--worker-assets') ? path.join(destination,'__tessellate_asset_payloads') : destination;
cpSync(source, assetsDestination, { recursive: true });

// Existing detail/preview pages reference this development stylesheet URL.
// Serve the already compiled canonical stylesheet at that URL on static hosting.
const styles = readdirSync(path.join(source, '_astro')).filter((name) => name.endsWith('.css'));
if (styles.length !== 1) throw new Error('Expected one canonical stylesheet; review Astro output before packaging.');
mkdirSync(path.join(assetsDestination, 'src/styles'), { recursive: true });
cpSync(path.join(source, '_astro', styles[0]), path.join(assetsDestination, 'src/styles/global.css'));

const catalog = JSON.parse(readFileSync(path.join(assetsDestination, 'data/catalog.json'), 'utf8'));
if (catalog.count !== 324 || catalog.resources.length !== 324) throw new Error('Incomplete catalogue.');
if (readFileSync(path.join(source, '_headers'), 'utf8') !== readFileSync(path.join(assetsDestination, '_headers'), 'utf8')) {
  throw new Error('Security headers changed during packaging.');
}
const required = ['index.html', 'explore/index.html', 'compose/index.html', 'workbench/index.html', 'showcases/index.html', 'r/index.json'];
for (const file of required) {
  if (!statSync(path.join(assetsDestination, file), { throwIfNoEntry: false })?.isFile()) throw new Error(`Missing artifact: ${file}`);
}
process.stdout.write('Sites artifact prepared: canonical Astro output, 324 resources, preserved header declarations (enforcement requires the Worker adapter).\n');

// Sites serves matching asset paths before the Worker despite run_worker_first.
// Keep payloads behind an internal prefix. HTML payloads have binary extensions,
// so the host cannot expose an executable HTML route without Worker CSP headers.
if(process.argv.includes('--worker-assets')){
 const renameHtml=directory=>{for(const entry of readdirSync(directory,{withFileTypes:true})){
  const filename=path.join(directory,entry.name);
  if(entry.isDirectory())renameHtml(filename);
  else if(entry.name.endsWith('.html'))renameSync(filename,filename+'.bin');
 }};
 renameHtml(assetsDestination);
 cpSync(path.join(source,'_headers'),path.join(destination,'_headers'));
}
